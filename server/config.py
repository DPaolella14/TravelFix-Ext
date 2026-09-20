"""
Configuration, loaded from the environment or a .env file.

Secrets never live in the repo. .env is gitignored; .env.example documents
what belongs in it.
"""

import os
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent


def _load_dotenv():
    """Minimal .env reader. Existing environment variables always win."""
    env_path = ROOT / '.env'
    if not env_path.exists():
        return
    for raw in env_path.read_text(encoding='utf-8').splitlines():
        line = raw.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, _, value = line.partition('=')
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


_load_dotenv()


def _int(name, default):
    try:
        return int(os.environ.get(name, default))
    except (TypeError, ValueError):
        return default


PORT = _int('PORT', 8080)

# Public origin of this app. Magic links are built from it, so it must match
# what the browser actually uses or the cookie will not come back.
BASE_URL = os.environ.get('BASE_URL', f'http://localhost:{PORT}').rstrip('/')

DB_PATH = os.environ.get('DB_PATH', str(ROOT / 'server' / 'travelfix.db'))

# Email. With no API key the app prints the link to the console instead of
# sending it, so the whole flow is testable before any DNS work is done.
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '').strip()
MAIL_FROM = os.environ.get('MAIL_FROM', 'TravelFix <onboarding@resend.dev>').strip()
MAIL_ENABLED = bool(RESEND_API_KEY)

# Lifetimes
LOGIN_TOKEN_TTL_SECONDS = _int('LOGIN_TOKEN_TTL_SECONDS', 15 * 60)       # 15 minutes
SESSION_TTL_SECONDS = _int('SESSION_TTL_SECONDS', 30 * 24 * 60 * 60)     # 30 days

# Rate limits for the sign-in endpoint
RATE_LIMIT_PER_IP = _int('RATE_LIMIT_PER_IP', 10)          # per window
RATE_LIMIT_PER_EMAIL = _int('RATE_LIMIT_PER_EMAIL', 5)     # per window
RATE_LIMIT_WINDOW_SECONDS = _int('RATE_LIMIT_WINDOW_SECONDS', 60 * 60)

# Cookies are only marked Secure when the app is actually served over HTTPS;
# marking them Secure on plain-HTTP localhost would stop them working at all.
COOKIE_SECURE = BASE_URL.startswith('https://')
SESSION_COOKIE_NAME = 'tf_session'

IS_PRODUCTION = os.environ.get('ENV', 'development').lower() == 'production'
