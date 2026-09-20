#!/usr/bin/env python3
"""
TravelFix application server.

Serves the static site and a small JSON API for passwordless sign-in.
Standard library only — no pip install, no build step.

    python server.py            (from the repo root)
    python server.py --open     opens a browser too

Endpoints
    POST /api/auth/request-link   { email }      -> always 202
    GET  /api/auth/verify?token=  sets cookie, redirects to /
    GET  /api/auth/me             current user or null
    POST /api/auth/logout         clears the session
"""

import http.cookies
import http.server
import json
import os
import socketserver
import sys
import urllib.parse
import webbrowser

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import auth
import db
import mailer
from config import (
    BASE_URL, COOKIE_SECURE, LOGIN_TOKEN_TTL_SECONDS, MAIL_ENABLED,
    PORT, ROOT, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS,
)

STATIC_ROOT = str(ROOT)
MAX_BODY_BYTES = 8 * 1024  # a sign-in request is tiny; refuse anything larger


class Handler(http.server.SimpleHTTPRequestHandler):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_ROOT, **kwargs)

    # ------------------------------------------------------------ plumbing

    def log_message(self, fmt, *args):
        # Keep the console readable; the default logs every static asset.
        if self.path.startswith('/api/'):
            super().log_message(fmt, *args)

    def end_headers(self):
        # Applied to every response, static files included.
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('Referrer-Policy', 'strict-origin-when-cross-origin')
        self.send_header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
        # NOTE: 'unsafe-inline' is required for style because the markup uses
        # inline style attributes throughout. Removing it means moving those
        # into the stylesheet first — worth doing, not done yet.
        self.send_header('Content-Security-Policy', (
            "default-src 'self'; "
            "script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com; "
            "style-src 'self' 'unsafe-inline' https://unpkg.com https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https:; "
            "connect-src 'self' https://nominatim.openstreetmap.org https://overpass-api.de; "
            "frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        ))
        if COOKIE_SECURE:
            self.send_header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
        super().end_headers()

    def client_ip(self):
        return self.client_address[0] if self.client_address else 'unknown'

    def read_json(self):
        try:
            length = int(self.headers.get('Content-Length') or 0)
        except ValueError:
            return None
        if length <= 0 or length > MAX_BODY_BYTES:
            return None
        try:
            return json.loads(self.rfile.read(length).decode('utf-8'))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return None

    def send_json(self, status, payload, extra_headers=None):
        body = json.dumps(payload).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        for key, value in (extra_headers or []):
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def session_cookie(self):
        raw = self.headers.get('Cookie')
        if not raw:
            return None
        try:
            jar = http.cookies.SimpleCookie(raw)
        except http.cookies.CookieError:
            return None
        morsel = jar.get(SESSION_COOKIE_NAME)
        return morsel.value if morsel else None

    def cookie_header(self, value, max_age):
        parts = [
            f'{SESSION_COOKIE_NAME}={value}',
            'Path=/',
            f'Max-Age={max_age}',
            'HttpOnly',          # unreadable from JavaScript, so XSS cannot steal it
            'SameSite=Lax',      # not sent on cross-site POSTs, which blocks CSRF
        ]
        if COOKIE_SECURE:
            parts.append('Secure')
        return ('Set-Cookie', '; '.join(parts))

    def same_origin(self):
        """
        Reject state-changing requests that did not come from our own pages.
        Defence in depth behind SameSite=Lax.
        """
        origin = self.headers.get('Origin')
        if origin:
            return origin.rstrip('/') == BASE_URL
        referer = self.headers.get('Referer')
        if referer:
            return referer.startswith(BASE_URL + '/') or referer.rstrip('/') == BASE_URL
        return True  # no Origin and no Referer: a plain same-origin fetch

    def user_payload(self, row):
        if row is None:
            return None
        return {
            'email': row['email'],
            'displayName': row['display_name'],
            'emailVerified': bool(row['email_verified_at']),
        }

    # -------------------------------------------------------------- routes

    def do_GET(self):
        parsed = urllib.parse.urlsplit(self.path)
        if parsed.path == '/api/auth/me':
            return self.handle_me()
        if parsed.path == '/api/auth/verify':
            return self.handle_verify(parsed.query)
        if parsed.path.startswith('/api/'):
            return self.send_json(404, {'error': 'not_found'})
        if parsed.path == '/server/travelfix.db' or parsed.path.startswith('/.env'):
            return self.send_json(404, {'error': 'not_found'})
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlsplit(self.path)
        if parsed.path == '/api/auth/request-link':
            return self.handle_request_link()
        if parsed.path == '/api/auth/logout':
            return self.handle_logout()
        return self.send_json(404, {'error': 'not_found'})

    # ------------------------------------------------------------ handlers

    def handle_request_link(self):
        if not self.same_origin():
            return self.send_json(403, {'error': 'bad_origin'})

        payload = self.read_json()
        if not isinstance(payload, dict):
            return self.send_json(400, {'error': 'bad_request'})

        email = payload.get('email')
        if not isinstance(email, str):
            return self.send_json(400, {'error': 'bad_request'})
        email = email.strip()

        # An invalid address is the one thing worth reporting, because the
        # user can act on it and it reveals nothing about who has an account.
        if not auth.is_valid_email(email):
            return self.send_json(400, {
                'error': 'invalid_email',
                'message': 'That does not look like an email address.'
            })

        normalised = auth.normalise_email(email)
        if not auth.check_signin_limits(self.client_ip(), normalised):
            return self.send_json(429, {
                'error': 'rate_limited',
                'message': 'Too many sign-in requests. Try again in a little while.'
            })

        raw_token = auth.begin_sign_in(email, self.client_ip())
        link = f'{BASE_URL}/api/auth/verify?token={urllib.parse.quote(raw_token)}'
        sent, _detail = mailer.send_login_link(normalised, link, LOGIN_TOKEN_TTL_SECONDS // 60)

        # Always the same response shape, whether or not the account existed.
        # 'delivery' only reports whether mail is switched on at all, which is
        # a property of this deployment, not of the address.
        return self.send_json(202, {
            'ok': True,
            'message': 'If that address can receive mail, a sign-in link is on its way.',
            'delivery': 'email' if sent else 'console',
        })

    def handle_verify(self, query):
        params = urllib.parse.parse_qs(query)
        token = (params.get('token') or [''])[0]
        session_token, user = auth.complete_sign_in(token, self.headers.get('User-Agent'))

        if not session_token:
            # Land back on the app with a flag it can explain, rather than a
            # bare error page.
            self.send_response(303)
            self.send_header('Location', '/?signin=invalid')
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            return

        self.send_response(303)
        self.send_header('Location', '/?signin=ok')
        self.send_header('Cache-Control', 'no-store')
        header, value = self.cookie_header(session_token, SESSION_TTL_SECONDS)
        self.send_header(header, value)
        self.end_headers()

    def handle_me(self):
        row = auth.session_user(self.session_cookie())
        return self.send_json(200, {
            'user': self.user_payload(row),
            'mailConfigured': MAIL_ENABLED,
        })

    def handle_logout(self):
        if not self.same_origin():
            return self.send_json(403, {'error': 'bad_origin'})
        auth.sign_out(self.session_cookie())
        header, value = self.cookie_header('', 0)
        return self.send_json(200, {'ok': True}, extra_headers=[(header, value)])


class ThreadingServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def run():
    os.chdir(STATIC_ROOT)
    db.init()
    db.purge_expired()

    port = PORT
    for _ in range(5):
        try:
            with ThreadingServer(('', port), Handler) as httpd:
                print('=' * 62)
                print(f'[TravelFix] Running at: http://localhost:{port}')
                print(f'[TravelFix] Serving:    {STATIC_ROOT}')
                if MAIL_ENABLED:
                    print('[TravelFix] Email:      configured (Resend)')
                else:
                    print('[TravelFix] Email:      NOT configured — sign-in links')
                    print('[TravelFix]             will be printed here instead.')
                    print('[TravelFix]             See docs/BACKEND-SETUP.md')
                print('[TravelFix] Ctrl+C to stop.')
                print('=' * 62, flush=True)
                if '--open' in sys.argv:
                    webbrowser.open(f'http://localhost:{port}')
                httpd.serve_forever()
            return
        except OSError as err:
            if 'Address already in use' in str(err) or getattr(err, 'errno', None) in (48, 98, 10048):
                print(f'[TravelFix] Port {port} is busy, trying {port + 1}...')
                port += 1
            else:
                raise
    print('[TravelFix] Could not find a free port. Is another copy running?')


if __name__ == '__main__':
    run()
