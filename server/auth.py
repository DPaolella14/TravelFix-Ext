"""
Passwordless sign-in.

The flow: you give an email address, we email a one-time link, clicking it
proves you own the address and starts a session. No passwords are stored,
because the safest credential is the one you never hold.

Security properties this file is responsible for:

  * Tokens and session ids are 32 bytes from a CSPRNG, and only their
    SHA-256 is written to the database.
  * A login token works once and expires in 15 minutes. Consuming it is a
    conditional UPDATE, so two simultaneous clicks cannot both succeed.
  * Requesting a link never reveals whether an account exists — same
    response, same status, whatever the address.
  * Lookups compare hashes with hmac.compare_digest to avoid leaking
    position information through timing.
"""

import hashlib
import hmac
import re
import secrets
import threading
import time

import db
import passwords
from config import (
    LOGIN_TOKEN_TTL_SECONDS, SESSION_TTL_SECONDS,
    RATE_LIMIT_PER_IP, RATE_LIMIT_PER_EMAIL, RATE_LIMIT_WINDOW_SECONDS,
)

# Validation is a usability check, NOT the security boundary. What keeps
# hostile input harmless is parameterised SQL in db.py and HTML escaping in
# js/escape.py's counterpart on the client — never this pattern. So it allows
# the punctuation RFC 5321 actually permits in a local part, including the
# apostrophe in addresses like o'brien@example.com. Rejecting those would
# lock real people out while providing no protection whatsoever.
EMAIL_RE = re.compile(
    r"^[A-Za-z0-9!#$%&'*+/=?^_`{|}~.-]+"
    r'@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?'
    r'(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*'
    r'\.[A-Za-z]{2,}$'
)
MAX_EMAIL_LENGTH = 254  # RFC 5321


def normalise_email(email):
    return (email or '').strip().lower()


def is_valid_email(email):
    if not email or len(email) > MAX_EMAIL_LENGTH:
        return False
    return bool(EMAIL_RE.match(email))


def hash_token(raw):
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()


def new_token():
    return secrets.token_urlsafe(32)


# ------------------------------------------------------------ rate limits

class RateLimiter:
    """
    Fixed-window counter held in memory.

    Adequate for a single process. A multi-process or multi-host deployment
    needs this in shared storage (Redis, or a table) or each worker enforces
    its own private limit.
    """

    def __init__(self):
        self._hits = {}
        self._lock = threading.Lock()

    def check(self, key, limit, window=RATE_LIMIT_WINDOW_SECONDS):
        """Record an attempt. Returns True when it is allowed."""
        now = time.time()
        with self._lock:
            bucket = [t for t in self._hits.get(key, []) if now - t < window]
            if len(bucket) >= limit:
                self._hits[key] = bucket
                return False
            bucket.append(now)
            self._hits[key] = bucket
            return True

    def clear(self, key):
        """Forget a key's history, e.g. after a successful login."""
        with self._lock:
            self._hits.pop(key, None)

    def reset(self):
        with self._lock:
            self._hits.clear()


limiter = RateLimiter()


def check_signin_limits(ip, email_normalised):
    """
    Both limits are consulted so neither a single address nor a single host
    can be used to flood someone's inbox. Returns True when allowed.
    """
    ip_ok = limiter.check(f'ip:{ip}', RATE_LIMIT_PER_IP)
    email_ok = limiter.check(f'email:{email_normalised}', RATE_LIMIT_PER_EMAIL)
    return ip_ok and email_ok


# Password logins get their own, tighter budget. scrypt makes each attempt
# cost ~150ms, and this caps how many an attacker gets per window, which is
# what keeps online guessing far away from offline guessing rates.
LOGIN_ATTEMPTS_PER_ACCOUNT = 8
LOGIN_ATTEMPTS_PER_IP = 25
LOGIN_WINDOW_SECONDS = 15 * 60


def check_login_limits(ip, email_normalised):
    account_ok = limiter.check(
        f'login-acct:{email_normalised}', LOGIN_ATTEMPTS_PER_ACCOUNT, LOGIN_WINDOW_SECONDS)
    ip_ok = limiter.check(f'login-ip:{ip}', LOGIN_ATTEMPTS_PER_IP, LOGIN_WINDOW_SECONDS)
    return account_ok and ip_ok


def clear_login_limits(ip, email_normalised):
    """
    Called after a successful login. The budget exists to slow down guessing,
    and a correct password is proof this is not guessing — without this, a
    user who mistypes a few times then succeeds stays one slip away from
    being locked out of their own account.
    """
    limiter.clear(f'login-acct:{email_normalised}')
    limiter.clear(f'login-ip:{ip}')


def check_signup_limits(ip):
    return limiter.check(f'signup-ip:{ip}', RATE_LIMIT_PER_IP, RATE_LIMIT_WINDOW_SECONDS)


# ------------------------------------------------------ password accounts

def register(email, password):
    """
    Create an account with a password.

    Returns (user_id, error_code). error_code is 'exists' when the address is
    already registered — see the note in docs/BACKEND-SETUP.md about why
    signup answers this honestly while login deliberately does not.
    """
    normalised = normalise_email(email)
    if db.get_user_by_email(normalised) is not None:
        return None, 'exists'
    user_id = db.create_user_with_password(
        email.strip(), normalised, passwords.hash_password(password)
    )
    return user_id, None


def authenticate(email, password):
    """
    Check an email and password pair.

    Returns the user row, or None. Every failure path costs about the same
    amount of time: when the account does not exist, or exists without a
    password, a dummy hash is computed anyway so the response cannot be
    told apart with a stopwatch.
    """
    normalised = normalise_email(email)
    user = db.get_user_by_email(normalised)

    if user is None or not user['password_hash']:
        passwords.dummy_verify()
        return None

    if not passwords.verify_password(password, user['password_hash']):
        return None

    # Opportunistic upgrade if the stored parameters are now below standard.
    if passwords.needs_rehash(user['password_hash']):
        db.set_password_hash(user['id'], passwords.hash_password(password))

    return user


def set_password(user_id, password, keep_session_hash=None):
    """
    Set or change a password.

    Every other session for the account is dropped, so changing a password
    after a suspected compromise actually evicts the intruder. The caller's
    own session is recreated by the handler.
    """
    db.set_password_hash(user_id, passwords.hash_password(password))
    db.delete_user_sessions(user_id)


def start_session(user_id, user_agent):
    """Open a session and return its raw token for the cookie."""
    raw = new_token()
    db.create_session(
        user_id=user_id,
        token_hash=hash_token(raw),
        expires_at=db.now() + SESSION_TTL_SECONDS,
        user_agent=user_agent,
    )
    return raw


# --------------------------------------------------------------- sign-in

def begin_sign_in(email, request_ip):
    """
    Create (or find) the account and mint a single-use login token.

    Returns the raw token for emailing. The caller must not leak whether the
    account already existed.
    """
    normalised = normalise_email(email)
    user = db.get_user_by_email(normalised)
    if user is None:
        user_id = db.create_user(email.strip(), normalised)
    else:
        user_id = user['id']

    # A freshly requested link supersedes any earlier unused one, so a
    # forwarded or intercepted older email stops working.
    db.invalidate_user_login_tokens(user_id)

    raw = new_token()
    db.create_login_token(
        user_id=user_id,
        token_hash=hash_token(raw),
        expires_at=db.now() + LOGIN_TOKEN_TTL_SECONDS,
        request_ip=request_ip,
    )
    return raw


def complete_sign_in(raw_token, user_agent):
    """
    Validate a login token and open a session.

    Returns (session_token, user_row) on success, or (None, None). The caller
    gets no detail about why it failed — expired, used and unknown all look
    the same from outside.
    """
    if not raw_token or len(raw_token) > 512:
        return None, None

    candidate = hash_token(raw_token)
    row = db.find_login_token(candidate)
    if row is None:
        return None, None

    # Constant-time comparison, even though the lookup already matched.
    if not hmac.compare_digest(row['token_hash'], candidate):
        return None, None
    if row['consumed_at'] is not None:
        return None, None
    if row['expires_at'] < db.now():
        return None, None
    if not db.consume_login_token(row['id']):
        return None, None  # lost the race to a simultaneous click

    user_id = row['user_id']
    db.mark_email_verified(user_id)

    session_raw = start_session(user_id, user_agent)
    return session_raw, db.get_user_by_id(user_id)


def session_user(raw_session):
    """Resolve a session cookie to a user, or None."""
    if not raw_session or len(raw_session) > 512:
        return None
    row = db.find_session(hash_token(raw_session))
    if row is None:
        return None
    if row['expires_at'] < db.now():
        db.delete_session(row['token_hash'])
        return None
    return row


def sign_out(raw_session):
    if raw_session:
        db.delete_session(hash_token(raw_session))
