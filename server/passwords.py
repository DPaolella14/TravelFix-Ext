"""
Password hashing.

scrypt, from the standard library. It is memory-hard, which is the property
that matters: an attacker with a GPU or an ASIC gains far less against it
than against a pure-iteration function like PBKDF2, because they have to
provide real memory per guess as well as compute.

Parameters were chosen by measuring on the target machine rather than copied
from a blog post:

    scrypt N=2^14           78 ms
    scrypt N=2^15          152 ms   <- chosen
    pbkdf2-sha256 210k      55 ms
    pbkdf2-sha256 600k     173 ms

OWASP's floor for scrypt is N=2^17, which measured well over half a second
here. On a single-process threaded server that is a denial-of-service lever
as much as a defence, so this uses N=2^15 and leans on the login rate
limiter to make offline-grade guessing rates unreachable online. If this
ever moves to a multi-worker deployment, raise N.

Stored format is self-describing, so parameters can be raised later and old
hashes still verify:

    scrypt$16384$8$1$<salt-b64>$<hash-b64>
    pbkdf2_sha256$600000$<salt-b64>$<hash-b64>
"""

import base64
import hashlib
import hmac
import os

SCRYPT_N = 2 ** 15
SCRYPT_R = 8
SCRYPT_P = 1
SCRYPT_DKLEN = 32
SCRYPT_MAXMEM = 132 * 1024 * 1024  # must exceed 128 * N * r

PBKDF2_ITERATIONS = 600_000
SALT_BYTES = 16

MIN_PASSWORD_LENGTH = 10
MAX_PASSWORD_LENGTH = 128  # a cap stops a huge input becoming a CPU attack

# Not a substitute for a real breach corpus, but it catches the handful of
# passwords that show up most often in credential-stuffing lists.
COMMON_PASSWORDS = {
    'password', 'password1', 'password123', 'passw0rd', '123456', '1234567',
    '12345678', '123456789', '1234567890', 'qwerty', 'qwerty123', 'abc123',
    'letmein', 'welcome', 'welcome1', 'monkey', 'dragon', 'iloveyou',
    'admin', 'administrator', 'login', 'princess', 'sunshine', 'football',
    'baseball', 'starwars', 'trustno1', 'whatever', 'changeme', 'secret',
    'passwordpassword', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
    'travelfix', 'travelfix123',
}


def _b64(raw):
    return base64.b64encode(raw).decode('ascii')


def _unb64(text):
    return base64.b64decode(text.encode('ascii'))


def _scrypt_available():
    try:
        hashlib.scrypt(b'x', salt=b'y' * 16, n=2, r=1, p=1, dklen=16)
        return True
    except Exception:
        return False


HAS_SCRYPT = _scrypt_available()


def validate(password, email=None):
    """
    Returns an error message, or None when the password is acceptable.

    Following NIST SP 800-63B: length is the requirement that matters, and
    composition rules (one upper, one digit, one symbol) are not imposed —
    they push people towards predictable patterns without adding real
    strength. Known-weak and email-derived choices are blocked instead.
    """
    if not isinstance(password, str):
        return 'Enter a password.'
    if len(password) < MIN_PASSWORD_LENGTH:
        return f'Use at least {MIN_PASSWORD_LENGTH} characters.'
    if len(password) > MAX_PASSWORD_LENGTH:
        return f'Keep it under {MAX_PASSWORD_LENGTH} characters.'

    lowered = password.lower().strip()
    if lowered in COMMON_PASSWORDS:
        return 'That password is one of the most commonly used ones. Pick something else.'

    if email:
        local = email.split('@')[0].lower()
        if local and len(local) >= 4 and local in lowered:
            return 'Do not use your email address in your password.'

    if len(set(password)) < 4:
        return 'That password repeats too few characters.'

    return None


def hash_password(password):
    salt = os.urandom(SALT_BYTES)
    if HAS_SCRYPT:
        digest = hashlib.scrypt(
            password.encode('utf-8'), salt=salt,
            n=SCRYPT_N, r=SCRYPT_R, p=SCRYPT_P,
            dklen=SCRYPT_DKLEN, maxmem=SCRYPT_MAXMEM,
        )
        return f'scrypt${SCRYPT_N}${SCRYPT_R}${SCRYPT_P}${_b64(salt)}${_b64(digest)}'

    digest = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, PBKDF2_ITERATIONS)
    return f'pbkdf2_sha256${PBKDF2_ITERATIONS}${_b64(salt)}${_b64(digest)}'


def verify_password(password, stored):
    """
    Constant-time verification. Returns False for anything malformed rather
    than raising, so a corrupt row cannot become a 500.
    """
    if not password or not stored:
        return False
    if len(password) > MAX_PASSWORD_LENGTH:
        return False

    try:
        parts = stored.split('$')
        algorithm = parts[0]

        if algorithm == 'scrypt':
            _, n, r, p, salt_b64, hash_b64 = parts
            expected = _unb64(hash_b64)
            actual = hashlib.scrypt(
                password.encode('utf-8'), salt=_unb64(salt_b64),
                n=int(n), r=int(r), p=int(p),
                dklen=len(expected), maxmem=SCRYPT_MAXMEM,
            )
        elif algorithm == 'pbkdf2_sha256':
            _, iterations, salt_b64, hash_b64 = parts
            expected = _unb64(hash_b64)
            actual = hashlib.pbkdf2_hmac(
                'sha256', password.encode('utf-8'), _unb64(salt_b64), int(iterations),
                dklen=len(expected),
            )
        else:
            return False

        return hmac.compare_digest(actual, expected)
    except (ValueError, TypeError, IndexError, MemoryError):
        return False


def needs_rehash(stored):
    """True when a stored hash uses weaker parameters than we now use."""
    if not stored:
        return False
    parts = stored.split('$')
    if parts[0] == 'scrypt' and HAS_SCRYPT:
        try:
            return int(parts[1]) < SCRYPT_N
        except (ValueError, IndexError):
            return True
    if parts[0] == 'pbkdf2_sha256':
        return HAS_SCRYPT or int(parts[1]) < PBKDF2_ITERATIONS
    return True


def dummy_verify():
    """
    Burn roughly the same time as a real check.

    Called when the account does not exist, so that "no such user" and "wrong
    password" take comparable time and the response cannot be distinguished
    by a stopwatch.
    """
    verify_password('x' * 24, hash_password('x' * 24))
