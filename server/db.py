"""
SQLite storage.

Every query here is parameterised. No SQL string is ever built by
concatenating a value, which is what keeps user input out of the query plan.
"""

import sqlite3
import threading
import time

from config import DB_PATH

_local = threading.local()

SCHEMA = """
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    email             TEXT    NOT NULL,
    email_normalised  TEXT    NOT NULL UNIQUE,
    display_name      TEXT,
    password_hash     TEXT,
    email_verified_at INTEGER,
    password_set_at   INTEGER,
    created_at        INTEGER NOT NULL
);

-- Magic-link tokens. Only the SHA-256 of the token is stored: if this table
-- leaks, the rows are not usable as login credentials.
CREATE TABLE IF NOT EXISTS login_tokens (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT    NOT NULL UNIQUE,
    expires_at  INTEGER NOT NULL,
    consumed_at INTEGER,
    created_at  INTEGER NOT NULL,
    request_ip  TEXT
);
CREATE INDEX IF NOT EXISTS idx_login_tokens_user ON login_tokens(user_id);

-- Sessions. Same reasoning: the cookie value is a secret, the stored value
-- is its hash.
CREATE TABLE IF NOT EXISTS sessions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT    NOT NULL UNIQUE,
    expires_at  INTEGER NOT NULL,
    created_at  INTEGER NOT NULL,
    user_agent  TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

-- Travel plans. The itinerary itself is one JSON document; the server only
-- needs to know who may see it, not what is in it.
CREATE TABLE IF NOT EXISTS plans (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       TEXT    NOT NULL,
    data        TEXT    NOT NULL,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL
);

-- Who may see a plan. Every plan query goes through this table, so "plan 47"
-- always means "plan 47 if the caller is a member of it". Today the only
-- role in use is owner; editor and viewer arrive with invites.
CREATE TABLE IF NOT EXISTS plan_members (
    plan_id     INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        TEXT    NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
    joined_at   INTEGER NOT NULL,
    PRIMARY KEY (plan_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_plan_members_user ON plan_members(user_id);
"""


def connect():
    """One connection per thread; the HTTP server is threaded."""
    conn = getattr(_local, 'conn', None)
    if conn is None:
        conn = sqlite3.connect(DB_PATH, timeout=10)
        conn.row_factory = sqlite3.Row
        conn.execute('PRAGMA foreign_keys = ON')
        _local.conn = conn
    return conn


def init():
    conn = connect()
    conn.executescript(SCHEMA)
    # Additive migration for databases created before passwords existed.
    existing = {row['name'] for row in conn.execute('PRAGMA table_info(users)')}
    for column, ddl in (
        ('password_hash', 'ALTER TABLE users ADD COLUMN password_hash TEXT'),
        ('password_set_at', 'ALTER TABLE users ADD COLUMN password_set_at INTEGER'),
    ):
        if column not in existing:
            conn.execute(ddl)
    conn.commit()


def now():
    return int(time.time())


# ------------------------------------------------------------------ users

def get_user_by_email(email_normalised):
    return connect().execute(
        'SELECT * FROM users WHERE email_normalised = ?', (email_normalised,)
    ).fetchone()


def get_user_by_id(user_id):
    return connect().execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()


def create_user(email, email_normalised):
    conn = connect()
    cur = conn.execute(
        'INSERT INTO users (email, email_normalised, created_at) VALUES (?, ?, ?)',
        (email, email_normalised, now())
    )
    conn.commit()
    return cur.lastrowid


def mark_email_verified(user_id):
    conn = connect()
    conn.execute(
        'UPDATE users SET email_verified_at = COALESCE(email_verified_at, ?) WHERE id = ?',
        (now(), user_id)
    )
    conn.commit()


def set_password_hash(user_id, password_hash):
    conn = connect()
    conn.execute(
        'UPDATE users SET password_hash = ?, password_set_at = ? WHERE id = ?',
        (password_hash, now(), user_id)
    )
    conn.commit()


def create_user_with_password(email, email_normalised, password_hash):
    conn = connect()
    cur = conn.execute(
        'INSERT INTO users (email, email_normalised, password_hash, password_set_at, created_at)'
        ' VALUES (?, ?, ?, ?, ?)',
        (email, email_normalised, password_hash, now(), now())
    )
    conn.commit()
    return cur.lastrowid


def delete_user_sessions(user_id):
    """Used when a password changes: every other device is signed out."""
    conn = connect()
    conn.execute('DELETE FROM sessions WHERE user_id = ?', (user_id,))
    conn.commit()


def set_display_name(user_id, name):
    conn = connect()
    conn.execute('UPDATE users SET display_name = ? WHERE id = ?', (name, user_id))
    conn.commit()


# ----------------------------------------------------------- login tokens

def create_login_token(user_id, token_hash, expires_at, request_ip):
    conn = connect()
    conn.execute(
        'INSERT INTO login_tokens (user_id, token_hash, expires_at, created_at, request_ip)'
        ' VALUES (?, ?, ?, ?, ?)',
        (user_id, token_hash, expires_at, now(), request_ip)
    )
    conn.commit()


def find_login_token(token_hash):
    return connect().execute(
        'SELECT * FROM login_tokens WHERE token_hash = ?', (token_hash,)
    ).fetchone()


def consume_login_token(token_id):
    """
    Mark a token used, but only if it is still unused. The WHERE clause makes
    this atomic: two simultaneous requests cannot both win.
    Returns True if this call was the one that consumed it.
    """
    conn = connect()
    cur = conn.execute(
        'UPDATE login_tokens SET consumed_at = ? WHERE id = ? AND consumed_at IS NULL',
        (now(), token_id)
    )
    conn.commit()
    return cur.rowcount == 1


def invalidate_user_login_tokens(user_id):
    """Issuing a new link retires any outstanding ones for that account."""
    conn = connect()
    conn.execute(
        'UPDATE login_tokens SET consumed_at = ? WHERE user_id = ? AND consumed_at IS NULL',
        (now(), user_id)
    )
    conn.commit()


# --------------------------------------------------------------- sessions

def create_session(user_id, token_hash, expires_at, user_agent):
    conn = connect()
    conn.execute(
        'INSERT INTO sessions (user_id, token_hash, expires_at, created_at, user_agent)'
        ' VALUES (?, ?, ?, ?, ?)',
        (user_id, token_hash, expires_at, now(), (user_agent or '')[:300])
    )
    conn.commit()


def find_session(token_hash):
    return connect().execute(
        'SELECT s.*, u.email, u.display_name, u.email_verified_at, u.password_hash'
        ' FROM sessions s JOIN users u ON u.id = s.user_id'
        ' WHERE s.token_hash = ?',
        (token_hash,)
    ).fetchone()


def delete_session(token_hash):
    conn = connect()
    conn.execute('DELETE FROM sessions WHERE token_hash = ?', (token_hash,))
    conn.commit()


# ------------------------------------------------------------------ plans
#
# There is deliberately no function here that takes a plan id without a user
# id. A plan the caller is not a member of and a plan that does not exist
# look exactly the same from every one of these: None, or zero rows.

WRITE_ROLES = ('owner', 'editor')

_PLAN_COLUMNS = 'p.id, p.owner_id, p.title, p.data, p.created_at, p.updated_at, m.role'


def list_plans_for(user_id):
    return connect().execute(
        f'SELECT {_PLAN_COLUMNS} FROM plans p'
        ' JOIN plan_members m ON m.plan_id = p.id'
        ' WHERE m.user_id = ?'
        ' ORDER BY p.created_at, p.id',
        (user_id,)
    ).fetchall()


def count_owned_plans(user_id):
    return connect().execute(
        'SELECT COUNT(*) FROM plans WHERE owner_id = ?', (user_id,)
    ).fetchone()[0]


def get_plan_for(plan_id, user_id):
    return connect().execute(
        f'SELECT {_PLAN_COLUMNS} FROM plans p'
        ' JOIN plan_members m ON m.plan_id = p.id'
        ' WHERE p.id = ? AND m.user_id = ?',
        (plan_id, user_id)
    ).fetchone()


def create_plan(owner_id, title, data):
    """The plan and its owner's membership are written together or not at all."""
    conn = connect()
    ts = now()
    with conn:
        cur = conn.execute(
            'INSERT INTO plans (owner_id, title, data, created_at, updated_at)'
            ' VALUES (?, ?, ?, ?, ?)',
            (owner_id, title, data, ts, ts)
        )
        plan_id = cur.lastrowid
        conn.execute(
            'INSERT INTO plan_members (plan_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)',
            (plan_id, owner_id, 'owner', ts)
        )
    return plan_id


def update_plan_for(plan_id, user_id, title, data):
    """Returns True if the caller may write this plan and it was updated."""
    conn = connect()
    cur = conn.execute(
        'UPDATE plans SET title = ?, data = ?, updated_at = ?'
        ' WHERE id = ? AND id IN ('
        '   SELECT plan_id FROM plan_members WHERE user_id = ? AND role IN (?, ?)'
        ' )',
        (title, data, now(), plan_id, user_id, *WRITE_ROLES)
    )
    conn.commit()
    return cur.rowcount == 1


def delete_plan_for(plan_id, user_id):
    """Only the owner can delete. Returns True if a plan was deleted."""
    conn = connect()
    cur = conn.execute(
        'DELETE FROM plans WHERE id = ? AND owner_id = ?'
        ' AND id IN (SELECT plan_id FROM plan_members WHERE user_id = ? AND role = ?)',
        (plan_id, user_id, user_id, 'owner')
    )
    conn.commit()
    return cur.rowcount == 1


def purge_expired():
    """Housekeeping: drop anything past its lifetime."""
    conn = connect()
    ts = now()
    conn.execute('DELETE FROM sessions WHERE expires_at < ?', (ts,))
    conn.execute('DELETE FROM login_tokens WHERE expires_at < ?', (ts,))
    conn.commit()
