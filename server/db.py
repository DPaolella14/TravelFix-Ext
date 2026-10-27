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

-- Invitations to a plan. As with login tokens, only the SHA-256 of the
-- token is stored: a leaked row is not a working key to someone's trip.
-- The role is fixed here, when the invite is made, and accepting cannot
-- change it.
CREATE TABLE IF NOT EXISTS invites (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id     INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    email_normalised TEXT NOT NULL,
    token_hash  TEXT    NOT NULL UNIQUE,
    role        TEXT    NOT NULL CHECK (role IN ('editor', 'viewer')),
    invited_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at  INTEGER NOT NULL,
    expires_at  INTEGER NOT NULL,
    accepted_at INTEGER,
    accepted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    revoked_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_invites_plan ON invites(plan_id);

-- Trip chat. A message belongs to a plan and is visible to its members.
-- Deleting the plan or the author's account deletes the message.
CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id     INTEGER NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    author_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body        TEXT    NOT NULL,
    card_json   TEXT,
    created_at  INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messages_plan ON messages(plan_id, id);
"""


def connect():
    """One connection per thread; the HTTP server is threaded."""
    conn = getattr(_local, 'conn', None)
    if conn is None:
        conn = sqlite3.connect(DB_PATH, timeout=10)
        conn.row_factory = sqlite3.Row
        conn.execute('PRAGMA foreign_keys = ON')
        # Deleted rows are overwritten, not just unlinked, so a deleted
        # account cannot be read back out of the file's free pages.
        conn.execute('PRAGMA secure_delete = ON')
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


def list_plans_for(user_id):
    return connect().execute(
        'SELECT p.id, p.owner_id, p.title, p.data, p.created_at, p.updated_at, m.role'
        ' FROM plans p'
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
        'SELECT p.id, p.owner_id, p.title, p.data, p.created_at, p.updated_at, m.role'
        ' FROM plans p'
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


def leave_plan(plan_id, user_id):
    """A member who is not the owner removes themselves. Returns True if they left."""
    conn = connect()
    cur = conn.execute(
        "DELETE FROM plan_members WHERE plan_id = ? AND user_id = ? AND role != 'owner'",
        (plan_id, user_id)
    )
    conn.commit()
    return cur.rowcount == 1


def list_members_for(plan_id, user_id):
    """Everyone on a plan, or [] if the caller is not on it."""
    return connect().execute(
        'SELECT u.email, u.display_name, m.role, m.joined_at FROM plan_members m'
        ' JOIN users u ON u.id = m.user_id'
        ' WHERE m.plan_id = ?'
        '   AND EXISTS (SELECT 1 FROM plan_members me WHERE me.plan_id = ? AND me.user_id = ?)'
        ' ORDER BY m.joined_at, u.id',
        (plan_id, plan_id, user_id)
    ).fetchall()


# ---------------------------------------------------------------- invites
#
# Creating, listing and revoking go through the caller's membership like
# every other plan query. Accepting is the one path that starts from a
# token rather than a plan, and it is what grants the membership.

def count_pending_invites(plan_id):
    return connect().execute(
        'SELECT COUNT(*) FROM invites WHERE plan_id = ?'
        ' AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > ?',
        (plan_id, now())
    ).fetchone()[0]


def is_member_email(plan_id, email_normalised):
    return connect().execute(
        'SELECT 1 FROM plan_members m JOIN users u ON u.id = m.user_id'
        ' WHERE m.plan_id = ? AND u.email_normalised = ?',
        (plan_id, email_normalised)
    ).fetchone() is not None


def create_invite(plan_id, email_normalised, token_hash, role, invited_by, expires_at):
    conn = connect()
    cur = conn.execute(
        'INSERT INTO invites (plan_id, email_normalised, token_hash, role, invited_by,'
        ' created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        (plan_id, email_normalised, token_hash, role, invited_by, now(), expires_at)
    )
    conn.commit()
    return cur.lastrowid


def list_pending_invites_for(plan_id, user_id):
    """Outstanding invites on a plan the caller owns, or []."""
    return connect().execute(
        'SELECT i.id, i.email_normalised, i.role, i.created_at, i.expires_at FROM invites i'
        ' WHERE i.plan_id = ? AND i.accepted_at IS NULL AND i.revoked_at IS NULL'
        '   AND i.expires_at > ?'
        "   AND EXISTS (SELECT 1 FROM plan_members m WHERE m.plan_id = i.plan_id"
        "               AND m.user_id = ? AND m.role = 'owner')"
        ' ORDER BY i.created_at, i.id',
        (plan_id, now(), user_id)
    ).fetchall()


def revoke_invite_for(plan_id, invite_id, user_id):
    """Only the plan's owner can revoke. Returns True if an open invite was revoked."""
    conn = connect()
    cur = conn.execute(
        'UPDATE invites SET revoked_at = ?'
        ' WHERE id = ? AND plan_id = ? AND accepted_at IS NULL AND revoked_at IS NULL'
        "   AND EXISTS (SELECT 1 FROM plan_members m WHERE m.plan_id = invites.plan_id"
        "               AND m.user_id = ? AND m.role = 'owner')",
        (now(), invite_id, plan_id, user_id)
    )
    conn.commit()
    return cur.rowcount == 1


def find_open_invite(token_hash):
    """An invite that can still be accepted, or None."""
    return connect().execute(
        'SELECT * FROM invites WHERE token_hash = ?'
        ' AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > ?',
        (token_hash, now())
    ).fetchone()


def accept_invite(invite_id, user_id):
    """
    Consume the invite and add the member, together or not at all.

    The UPDATE's WHERE clause is the single-use guarantee: of two requests
    racing with the same token, exactly one changes the row. Someone who is
    already on the plan keeps the role they have; an invite never demotes an
    owner or promotes past what it was created with.
    Returns the role granted, or None if the invite was no longer open.
    """
    conn = connect()
    ts = now()
    with conn:
        cur = conn.execute(
            'UPDATE invites SET accepted_at = ?, accepted_by = ?'
            ' WHERE id = ? AND accepted_at IS NULL AND revoked_at IS NULL AND expires_at > ?',
            (ts, user_id, invite_id, ts)
        )
        if cur.rowcount != 1:
            return None
        row = conn.execute('SELECT plan_id, role FROM invites WHERE id = ?', (invite_id,)).fetchone()
        conn.execute(
            'INSERT OR IGNORE INTO plan_members (plan_id, user_id, role, joined_at)'
            ' VALUES (?, ?, ?, ?)',
            (row['plan_id'], user_id, row['role'], ts)
        )
    return row['role']


# --------------------------------------------------------------- messages
#
# Both functions take the caller's user id and go through plan_members, the
# same as every plan query: a non-member gets nothing back and writes nothing.

def list_messages_for(plan_id, user_id, after_id=0, limit=200):
    """Messages after after_id, oldest first, or None if the caller is not a member."""
    conn = connect()
    if conn.execute('SELECT 1 FROM plan_members WHERE plan_id = ? AND user_id = ?',
                    (plan_id, user_id)).fetchone() is None:
        return None
    return conn.execute(
        'SELECT m.id, m.author_id, m.body, m.card_json, m.created_at,'
        ' u.email, u.display_name, pm.role'
        ' FROM messages m JOIN users u ON u.id = m.author_id'
        ' LEFT JOIN plan_members pm ON pm.plan_id = m.plan_id AND pm.user_id = m.author_id'
        ' WHERE m.plan_id = ? AND m.id > ?'
        ' ORDER BY m.id LIMIT ?',
        (plan_id, after_id, limit)
    ).fetchall()


def create_message_for(plan_id, user_id, body, card_json):
    """Returns the new message id, or None if the caller is not a member."""
    conn = connect()
    cur = conn.execute(
        'INSERT INTO messages (plan_id, author_id, body, card_json, created_at)'
        ' SELECT ?, ?, ?, ?, ? WHERE EXISTS'
        ' (SELECT 1 FROM plan_members WHERE plan_id = ? AND user_id = ?)',
        (plan_id, user_id, body, card_json, now(), plan_id, user_id)
    )
    conn.commit()
    return cur.lastrowid if cur.rowcount == 1 else None


# ----------------------------------------------------- export and erasure

def export_user(user_id):
    """Everything stored about one account, as plain rows. No hashes."""
    conn = connect()
    user = conn.execute(
        'SELECT email, email_normalised, display_name, email_verified_at, password_set_at,'
        ' password_hash IS NOT NULL AS has_password, created_at FROM users WHERE id = ?',
        (user_id,)
    ).fetchone()
    if user is None:
        return None
    return {
        'user': user,
        'plans': list_plans_for(user_id),
        'invites_sent': conn.execute(
            'SELECT plan_id, email_normalised, role, created_at, expires_at, accepted_at,'
            ' revoked_at FROM invites WHERE invited_by = ? ORDER BY id', (user_id,)
        ).fetchall(),
        'invites_received': conn.execute(
            'SELECT plan_id, role, created_at, expires_at, accepted_at, revoked_at'
            ' FROM invites WHERE email_normalised = ? ORDER BY id', (user['email_normalised'],)
        ).fetchall(),
        'sessions': conn.execute(
            'SELECT created_at, expires_at, user_agent FROM sessions WHERE user_id = ? ORDER BY id',
            (user_id,)
        ).fetchall(),
        'messages': conn.execute(
            'SELECT plan_id, body, card_json, created_at FROM messages'
            ' WHERE author_id = ? ORDER BY id', (user_id,)
        ).fetchall(),
        'login_tokens': conn.execute(
            'SELECT created_at, expires_at, consumed_at, request_ip FROM login_tokens'
            ' WHERE user_id = ? ORDER BY id', (user_id,)
        ).fetchall(),
    }


def delete_user(user_id, email_normalised):
    """
    Erase an account. Cascades remove its sessions, sign-in tokens, the plans
    it owns (with their members and invites) and its memberships elsewhere.
    Invites addressed to it on other people's plans carry its email address,
    so they go too. Returns True if the account existed.
    """
    conn = connect()
    with conn:
        conn.execute('DELETE FROM invites WHERE email_normalised = ?', (email_normalised,))
        cur = conn.execute('DELETE FROM users WHERE id = ?', (user_id,))
    # Fold the write-ahead log back into the file so the erased pages do not
    # linger there either; secure_delete has already zeroed them in place.
    conn.execute('PRAGMA wal_checkpoint(TRUNCATE)')
    return cur.rowcount == 1


def purge_expired():
    """Housekeeping: drop anything past its lifetime."""
    conn = connect()
    ts = now()
    conn.execute('DELETE FROM sessions WHERE expires_at < ?', (ts,))
    conn.execute('DELETE FROM login_tokens WHERE expires_at < ?', (ts,))
    conn.commit()
