#!/usr/bin/env python3
"""
Sign-in API tests, including the abuse cases.

Run the server first, then:

    python tests/test_auth.py
    TF_BASE=http://localhost:8081 python tests/test_auth.py

Standard library only, same as the server.
"""

import http.cookiejar
import json
import os
import re
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = os.environ.get('TF_BASE', 'http://localhost:8080').rstrip('/')
DB_PATH = os.environ.get(
    'TF_DB',
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'server', 'travelfix.db')
)

PASS = 0
FAIL = 0


def check(name, condition, detail=''):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f'  PASS  {name}')
    else:
        FAIL += 1
        print(f'  FAIL  {name}' + (f' — {detail}' if detail else ''))


def request(path, method='GET', body=None, jar=None, headers=None, follow=True):
    """Returns (status, headers, parsed_body_or_text)."""
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header('Content-Type', 'application/json')
    req.add_header('Origin', BASE)
    for key, value in (headers or {}).items():
        req.add_header(key, value)

    handlers = []
    if jar is not None:
        handlers.append(urllib.request.HTTPCookieProcessor(jar))
    if not follow:
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *args, **kwargs):
                return None
        handlers.append(NoRedirect())
    opener = urllib.request.build_opener(*handlers)

    try:
        with opener.open(req, timeout=10) as res:
            raw = res.read().decode('utf-8', 'replace')
            try:
                return res.status, dict(res.headers), json.loads(raw)
            except json.JSONDecodeError:
                return res.status, dict(res.headers), raw
    except urllib.error.HTTPError as err:
        raw = err.read().decode('utf-8', 'replace')
        try:
            return err.code, dict(err.headers), json.loads(raw)
        except json.JSONDecodeError:
            return err.code, dict(err.headers), raw


def latest_token_for(email):
    """Read the raw token out of the DB? No — only the hash is stored.

    That is the point, so the test reads the server log instead. When the log
    is unavailable we fall back to driving the flow through the database's
    token id, which is what a legitimate operator could do.
    """
    return None


def reset_rate_limits():
    """The limiter is in-process, so the only reset is a fresh server."""
    pass


def db_conn():
    return sqlite3.connect(DB_PATH)


def main():
    print(f'Testing {BASE}\n')

    # ------------------------------------------------------------ liveness
    status, _, body = request('/api/auth/me')
    check('API is up', status == 200 and 'user' in body, f'status={status}')
    check('anonymous request has no user', body.get('user') is None)

    # -------------------------------------------------- input validation
    print('\n--- input validation ---')
    for bad in ['', 'not-an-email', 'a@b', '@example.com', 'x' * 250 + '@e.com', 'a b@c.com']:
        status, _, body = request('/api/auth/request-link', 'POST', {'email': bad})
        check(f'rejects {bad[:28]!r}', status == 400, f'status={status}')

    status, _, _ = request('/api/auth/request-link', 'POST', {'email': 12345})
    check('rejects a non-string email', status == 400)

    status, _, _ = request('/api/auth/request-link', 'POST', {})
    check('rejects a missing email', status == 400)

    # ------------------------------------------------- no user enumeration
    print('\n--- account enumeration ---')
    known = 'enumeration-known@example.com'
    unknown = f'enumeration-unknown-{int(time.time())}@example.com'
    request('/api/auth/request-link', 'POST', {'email': known})  # create it

    s1, _, b1 = request('/api/auth/request-link', 'POST', {'email': known})
    s2, _, b2 = request('/api/auth/request-link', 'POST', {'email': unknown})
    check('same status for known and unknown addresses', s1 == s2, f'{s1} vs {s2}')
    check('same body for known and unknown addresses', b1 == b2, f'{b1} vs {b2}')

    # ---------------------------------------------------- SQL injection
    print('\n--- injection attempts ---')
    payloads = [
        "' OR '1'='1",
        "admin'--",
        "x@test.com'; DROP TABLE users;--",
        "x@test.com' UNION SELECT 1,2,3--",
    ]
    for payload in payloads:
        status, _, _ = request('/api/auth/request-link', 'POST', {'email': payload})
        check(f'rejects {payload[:26]!r}', status == 400, f'status={status}')

    with db_conn() as conn:
        tables = [r[0] for r in conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
    check('users table survived injection attempts', 'users' in tables, str(tables))

    # A valid address containing quote characters must be stored safely, not
    # rejected by luck. SQLite parameter binding is what makes this safe.
    weird = "o'brien+test@example.com"
    status, _, _ = request('/api/auth/request-link', 'POST', {'email': weird})
    check("accepts a legitimate apostrophe address", status == 202, f'status={status}')
    with db_conn() as conn:
        row = conn.execute(
            'SELECT email FROM users WHERE email_normalised = ?', (weird,)).fetchone()
    check('apostrophe address stored verbatim', row is not None and row[0] == weird, str(row))

    # ------------------------------------------------------ token handling
    print('\n--- token handling ---')
    with db_conn() as conn:
        row = conn.execute(
            'SELECT token_hash, expires_at, consumed_at FROM login_tokens ORDER BY id DESC LIMIT 1'
        ).fetchone()
    check('a login token was created', row is not None)
    if row:
        token_hash, expires_at, consumed_at = row
        check('only a hash is stored, not the token',
              len(token_hash) == 64 and re.fullmatch(r'[0-9a-f]{64}', token_hash) is not None,
              token_hash[:20])
        check('token expires within 15 minutes',
              0 < expires_at - int(time.time()) <= 15 * 60,
              f'ttl={expires_at - int(time.time())}s')
        check('token starts unconsumed', consumed_at is None)

    status, headers, _ = request('/api/auth/verify?token=obviously-not-valid',
                                 follow=False)
    check('a bogus token does not sign you in', status == 303, f'status={status}')
    check('a bogus token sets no cookie', 'Set-Cookie' not in headers, str(headers.get('Set-Cookie')))
    check('a bogus token redirects to an error state',
          'signin=invalid' in headers.get('Location', ''), headers.get('Location', ''))

    # ---------------------------------------------------- cookie hardening
    print('\n--- session cookie ---')
    # Drive a real sign-in by minting a token directly, the way the server
    # does, so the test does not have to scrape the console.
    import hashlib
    import secrets as _secrets
    raw = _secrets.token_urlsafe(32)
    with db_conn() as conn:
        uid = conn.execute('SELECT id FROM users ORDER BY id LIMIT 1').fetchone()[0]
        conn.execute(
            'INSERT INTO login_tokens (user_id, token_hash, expires_at, created_at)'
            ' VALUES (?,?,?,?)',
            (uid, hashlib.sha256(raw.encode()).hexdigest(), int(time.time()) + 600, int(time.time()))
        )
        conn.commit()

    jar = http.cookiejar.CookieJar()
    status, headers, _ = request(f'/api/auth/verify?token={urllib.parse.quote(raw)}',
                                 jar=jar, follow=False)
    cookie_header = headers.get('Set-Cookie', '')
    check('valid token signs you in', status == 303 and 'signin=ok' in headers.get('Location', ''),
          headers.get('Location', ''))
    check('session cookie is HttpOnly', 'HttpOnly' in cookie_header, cookie_header)
    check('session cookie is SameSite=Lax', 'SameSite=Lax' in cookie_header, cookie_header)
    check('session cookie is scoped to /', 'Path=/' in cookie_header, cookie_header)

    status, _, body = request('/api/auth/me', jar=jar)
    check('session identifies the user', body.get('user') is not None, str(body))
    check('email marked verified after clicking the link',
          bool(body.get('user', {}).get('emailVerified')), str(body.get('user')))

    # --------------------------------------------------------- replay
    print('\n--- token replay ---')
    status, headers, _ = request(f'/api/auth/verify?token={urllib.parse.quote(raw)}',
                                 follow=False)
    check('the same token cannot be used twice',
          'signin=invalid' in headers.get('Location', ''), headers.get('Location', ''))
    check('replay sets no cookie', 'Set-Cookie' not in headers)

    # ------------------------------------------------------ expired token
    print('\n--- expired token ---')
    stale = _secrets.token_urlsafe(32)
    with db_conn() as conn:
        conn.execute(
            'INSERT INTO login_tokens (user_id, token_hash, expires_at, created_at)'
            ' VALUES (?,?,?,?)',
            (uid, hashlib.sha256(stale.encode()).hexdigest(), int(time.time()) - 60, int(time.time()) - 600)
        )
        conn.commit()
    status, headers, _ = request(f'/api/auth/verify?token={urllib.parse.quote(stale)}',
                                 follow=False)
    check('an expired token is refused',
          'signin=invalid' in headers.get('Location', ''), headers.get('Location', ''))

    # ---------------------------------------------- superseding old links
    print('\n--- requesting a new link retires the old one ---')
    superseded = _secrets.token_urlsafe(32)
    with db_conn() as conn:
        conn.execute(
            'INSERT INTO login_tokens (user_id, token_hash, expires_at, created_at)'
            ' VALUES (?,?,?,?)',
            (uid, hashlib.sha256(superseded.encode()).hexdigest(),
             int(time.time()) + 600, int(time.time()))
        )
        conn.commit()
        email_for_uid = conn.execute('SELECT email FROM users WHERE id = ?', (uid,)).fetchone()[0]
    request('/api/auth/request-link', 'POST', {'email': email_for_uid})
    status, headers, _ = request(f'/api/auth/verify?token={urllib.parse.quote(superseded)}',
                                 follow=False)
    check('the previous link stops working',
          'signin=invalid' in headers.get('Location', ''), headers.get('Location', ''))

    # ---------------------------------------------------------- logout
    print('\n--- logout ---')
    status, headers, _ = request('/api/auth/logout', 'POST', {}, jar=jar)
    check('logout succeeds', status == 200)
    status, _, body = request('/api/auth/me', jar=jar)
    check('session is gone after logout', body.get('user') is None, str(body))

    # ------------------------------------------------------------- CSRF
    print('\n--- cross-origin protection ---')
    status, _, _ = request('/api/auth/request-link', 'POST', {'email': 'csrf@example.com'},
                           headers={'Origin': 'https://evil.example'})
    check('rejects a request from another origin', status == 403, f'status={status}')

    status, _, _ = request('/api/auth/logout', 'POST', {},
                           headers={'Origin': 'https://evil.example'})
    check('rejects cross-origin logout', status == 403, f'status={status}')

    # -------------------------------------------------- security headers
    print('\n--- response headers ---')
    status, headers, _ = request('/api/auth/me')
    check('X-Content-Type-Options: nosniff', headers.get('X-Content-Type-Options') == 'nosniff')
    check('X-Frame-Options: DENY', headers.get('X-Frame-Options') == 'DENY')
    check('Content-Security-Policy present', 'Content-Security-Policy' in headers)
    check('frame-ancestors none in CSP',
          "frame-ancestors 'none'" in headers.get('Content-Security-Policy', ''))
    check('auth responses are not cached', headers.get('Cache-Control') == 'no-store',
          headers.get('Cache-Control', ''))

    # ------------------------------------------------- secrets not served
    print('\n--- private files are not served ---')
    for path in ['/.env', '/server/travelfix.db']:
        status, _, _ = request(path)
        check(f'{path} is not downloadable', status == 404, f'status={status}')

    # -------------------------------------------------------- rate limit
    print('\n--- rate limiting ---')
    burst_email = f'burst-{int(time.time())}@example.com'
    statuses = []
    for _ in range(9):
        s, _, _ = request('/api/auth/request-link', 'POST', {'email': burst_email})
        statuses.append(s)
    check('repeated requests eventually get 429', 429 in statuses, str(statuses))

    # ------------------------------------------------------ oversized body
    print('\n--- oversized request ---')
    status, _, _ = request('/api/auth/request-link', 'POST', {'email': 'a' * 20000 + '@e.com'})
    check('oversized body refused', status in (400, 413), f'status={status}')

    print(f'\n{PASS} passed, {FAIL} failed')
    return 1 if FAIL else 0


if __name__ == '__main__':
    sys.exit(main())
