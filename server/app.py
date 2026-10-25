#!/usr/bin/env python3
"""
TravelFix application server.

Serves the static site and a small JSON API for passwordless sign-in.
Standard library only — no pip install, no build step.

    python server.py            (from the repo root)
    python server.py --open     opens a browser too

Endpoints
    POST /api/auth/signup         { email, password } -> account + session
    POST /api/auth/login          { email, password } -> session
    POST /api/auth/request-link   { email }           -> always 202
    GET  /api/auth/verify?token=  sets cookie, redirects to /
    POST /api/auth/set-password   { password }        -> needs a session
    GET  /api/auth/me             current user or null
    POST /api/auth/logout         clears the session

    GET    /api/plans             plans the caller is a member of
    POST   /api/plans             { title, plan } -> new plan, caller is owner
    GET    /api/plans/<id>        one plan
    PUT    /api/plans/<id>        { title, plan } -> owner or editor
    DELETE /api/plans/<id>        owner deletes it; anyone else leaves it

    GET    /api/plans/<id>/members            who is on the plan
    GET    /api/plans/<id>/invites            open invites (owner)
    POST   /api/plans/<id>/invites            { email, role } (owner)
    DELETE /api/plans/<id>/invites/<invite>   revoke (owner)
    POST   /api/invites/accept                { token } -> join the plan

Every plan route needs a session. A plan the caller is not a member of
answers 404, exactly as a plan that does not exist does.
"""

import http.cookies
import http.server
import json
import os
import re
import socketserver
import sys
import urllib.parse
import webbrowser

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import auth
import db
import mailer
import passwords
from config import (
    BASE_URL, COOKIE_SECURE, LOGIN_TOKEN_TTL_SECONDS, MAIL_ENABLED,
    PORT, ROOT, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS,
)

STATIC_ROOT = str(ROOT)
# The only top-level folders the site serves, besides index.html. Everything
# else in the repo (server/, tests/, docs/, the database) is never reachable.
STATIC_DIRS = ('css', 'js', 'assets')
MAX_BODY_BYTES = 8 * 1024  # a sign-in request is tiny; refuse anything larger
MAX_PLAN_BYTES = 256 * 1024  # a long itinerary is a few tens of KB
MAX_PLANS_PER_USER = 100
MAX_PLAN_TITLE = 200

PLAN_PATH = re.compile(r'^/api/plans/([1-9][0-9]{0,17})$')
PLAN_SUB_PATH = re.compile(r'^/api/plans/([1-9][0-9]{0,17})/(members|invites)$')
INVITE_PATH = re.compile(r'^/api/plans/([1-9][0-9]{0,17})/invites/([1-9][0-9]{0,17})$')

INVITE_TTL_SECONDS = 7 * 24 * 60 * 60
INVITE_ROLES = ('editor', 'viewer')
MAX_OPEN_INVITES_PER_PLAN = 50
INVITES_PER_USER_PER_HOUR = 20
INVITE_ACCEPTS_PER_IP_PER_HOUR = 30


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

    def read_json(self, max_bytes=MAX_BODY_BYTES):
        try:
            length = int(self.headers.get('Content-Length') or 0)
        except ValueError:
            return None
        if length <= 0 or length > max_bytes:
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
        keys = row.keys()
        return {
            'email': row['email'],
            'displayName': row['display_name'],
            'emailVerified': bool(row['email_verified_at']),
            'hasPassword': bool(row['password_hash']) if 'password_hash' in keys else False,
        }

    # -------------------------------------------------------------- routes

    def do_GET(self):
        parsed = urllib.parse.urlsplit(self.path)
        if parsed.path == '/api/auth/me':
            return self.handle_me()
        if parsed.path == '/api/auth/verify':
            return self.handle_verify(parsed.query)
        if parsed.path == '/api/plans':
            return self.handle_list_plans()
        match = PLAN_PATH.match(parsed.path)
        if match:
            return self.handle_get_plan(int(match.group(1)))
        match = PLAN_SUB_PATH.match(parsed.path)
        if match and match.group(2) == 'members':
            return self.handle_list_members(int(match.group(1)))
        if match and match.group(2) == 'invites':
            return self.handle_list_invites(int(match.group(1)))
        if parsed.path.startswith('/api/'):
            return self.send_json(404, {'error': 'not_found'})
        return self.serve_static(super().do_GET)

    def do_HEAD(self):
        return self.serve_static(super().do_HEAD)

    # -------------------------------------------------------------- static

    def static_path(self):
        """
        The site-relative path of a file the site is allowed to serve, or None.

        An allow-list, not a deny-list: the repo root also holds the server,
        its database and the tests, and a deny-list has to anticipate every
        spelling of those (percent-encoding, doubled slashes, dot segments,
        case on Windows, SQLite's -wal and -shm sidecars). This decides on the
        decoded path, by segment, and then checks where the file really is.
        """
        # Not urlsplit: it reads '//server/x' as a host name.
        raw = self.path.split('?', 1)[0].split('#', 1)[0]
        try:
            path = urllib.parse.unquote(raw, errors='strict')
        except UnicodeDecodeError:
            return None
        if path in ('/', '/index.html'):
            return 'index.html'
        if not path.startswith('/') or '\\' in path or '\x00' in path:
            return None

        segments = path[1:].split('/')
        if len(segments) < 2 or segments[0] not in STATIC_DIRS:
            return None
        if any(not s or s.startswith('.') for s in segments):
            return None  # empty, '.', '..' and dotfiles

        # realpath resolves symlinks and, on Windows, returns the on-disk
        # spelling, so this one comparison refuses links that lead elsewhere
        # and case variants like /JS/App.js.
        expected = os.path.join(os.path.realpath(STATIC_ROOT), *segments)
        if os.path.realpath(expected) != expected or not os.path.isfile(expected):
            return None
        return '/'.join(segments)

    def serve_static(self, serve):
        relative = self.static_path()
        if relative is None:
            return self.send_json(404, {'error': 'not_found'})
        # Hand the stdlib handler the clean path only, so its own decoding
        # and directory listing never see what the client actually sent.
        self.path = '/' + relative
        return serve()

    def do_POST(self):
        parsed = urllib.parse.urlsplit(self.path)
        if parsed.path == '/api/auth/signup':
            return self.handle_signup()
        if parsed.path == '/api/auth/login':
            return self.handle_login()
        if parsed.path == '/api/auth/set-password':
            return self.handle_set_password()
        if parsed.path == '/api/auth/request-link':
            return self.handle_request_link()
        if parsed.path == '/api/auth/logout':
            return self.handle_logout()
        if parsed.path == '/api/plans':
            return self.handle_create_plan()
        if parsed.path == '/api/invites/accept':
            return self.handle_accept_invite()
        match = PLAN_SUB_PATH.match(parsed.path)
        if match and match.group(2) == 'invites':
            return self.handle_create_invite(int(match.group(1)))
        return self.send_json(404, {'error': 'not_found'})

    def do_PUT(self):
        match = PLAN_PATH.match(urllib.parse.urlsplit(self.path).path)
        if match:
            return self.handle_update_plan(int(match.group(1)))
        return self.send_json(404, {'error': 'not_found'})

    def do_DELETE(self):
        path = urllib.parse.urlsplit(self.path).path
        match = PLAN_PATH.match(path)
        if match:
            return self.handle_delete_plan(int(match.group(1)))
        match = INVITE_PATH.match(path)
        if match:
            return self.handle_revoke_invite(int(match.group(1)), int(match.group(2)))
        return self.send_json(404, {'error': 'not_found'})

    # --------------------------------------------------- password accounts

    def read_credentials(self):
        """Shared parsing for signup and login. Returns (email, password, error)."""
        payload = self.read_json()
        if not isinstance(payload, dict):
            return None, None, (400, {'error': 'bad_request'})

        email = payload.get('email')
        password = payload.get('password')
        if not isinstance(email, str) or not isinstance(password, str):
            return None, None, (400, {'error': 'bad_request'})

        return email.strip(), password, None

    def handle_signup(self):
        if not self.same_origin():
            return self.send_json(403, {'error': 'bad_origin'})

        email, password, error = self.read_credentials()
        if error:
            return self.send_json(*error)

        if not auth.is_valid_email(email):
            return self.send_json(400, {
                'error': 'invalid_email',
                'message': 'That does not look like an email address.'
            })

        problem = passwords.validate(password, email)
        if problem:
            return self.send_json(400, {'error': 'weak_password', 'message': problem})

        if not auth.check_signup_limits(self.client_ip()):
            return self.send_json(429, {
                'error': 'rate_limited',
                'message': 'Too many sign-up attempts. Try again in a little while.'
            })

        user_id, failure = auth.register(email, password)
        if failure == 'exists':
            # Signup answers this honestly, unlike login. The trade-off is
            # documented in docs/BACKEND-SETUP.md: hiding it makes signup
            # unusable, and signup is rate limited per IP to blunt scraping.
            return self.send_json(409, {
                'error': 'email_taken',
                'message': 'That email already has an account. Log in instead.'
            })

        # Signed in immediately; the address is not verified yet, and the UI
        # says so rather than pretending otherwise.
        session_token = auth.start_session(user_id, self.headers.get('User-Agent'))

        raw_token = auth.begin_sign_in(email, self.client_ip())
        link = f'{BASE_URL}/api/auth/verify?token={urllib.parse.quote(raw_token)}'
        sent, _ = mailer.send_login_link(auth.normalise_email(email), link,
                                         LOGIN_TOKEN_TTL_SECONDS // 60)

        header, value = self.cookie_header(session_token, SESSION_TTL_SECONDS)
        return self.send_json(201, {
            'ok': True,
            'user': self.user_payload(db.get_user_by_id(user_id)),
            'verification': 'email' if sent else 'console',
        }, extra_headers=[(header, value)])

    def handle_login(self):
        if not self.same_origin():
            return self.send_json(403, {'error': 'bad_origin'})

        email, password, error = self.read_credentials()
        if error:
            return self.send_json(*error)

        # Deliberately identical for every failure: unknown address, wrong
        # password, and an account with no password set all look the same.
        generic = {
            'error': 'invalid_credentials',
            'message': 'Email or password is incorrect.'
        }

        if not email or not password:
            return self.send_json(401, generic)

        if not auth.check_login_limits(self.client_ip(), auth.normalise_email(email)):
            return self.send_json(429, {
                'error': 'rate_limited',
                'message': 'Too many attempts. Wait a few minutes and try again.'
            })

        user = auth.authenticate(email, password)
        if user is None:
            return self.send_json(401, generic)

        # A correct password proves this is not a guessing run, so the
        # account's attempt budget is returned rather than left depleted.
        auth.clear_login_limits(self.client_ip(), auth.normalise_email(email))

        session_token = auth.start_session(user['id'], self.headers.get('User-Agent'))
        header, value = self.cookie_header(session_token, SESSION_TTL_SECONDS)
        return self.send_json(200, {
            'ok': True,
            'user': self.user_payload(user),
        }, extra_headers=[(header, value)])

    def handle_set_password(self):
        if not self.same_origin():
            return self.send_json(403, {'error': 'bad_origin'})

        row = auth.session_user(self.session_cookie())
        if row is None:
            return self.send_json(401, {'error': 'not_signed_in'})

        payload = self.read_json()
        if not isinstance(payload, dict):
            return self.send_json(400, {'error': 'bad_request'})

        new_password = payload.get('password')
        current = payload.get('currentPassword')

        # Changing an existing password requires proving you know it. Setting
        # one for the first time (after a magic link) does not, because the
        # emailed link already proved control of the address.
        if row['password_hash']:
            if not isinstance(current, str) or not passwords.verify_password(current, row['password_hash']):
                return self.send_json(403, {
                    'error': 'wrong_password',
                    'message': 'Your current password is not correct.'
                })

        problem = passwords.validate(new_password, row['email'])
        if problem:
            return self.send_json(400, {'error': 'weak_password', 'message': problem})

        user_id = row['user_id']
        auth.set_password(user_id, new_password)

        # set_password drops every session for the account, including this
        # one, so issue a fresh cookie rather than logging the user out of
        # the tab they are standing in.
        session_token = auth.start_session(user_id, self.headers.get('User-Agent'))
        header, value = self.cookie_header(session_token, SESSION_TTL_SECONDS)
        return self.send_json(200, {
            'ok': True,
            'message': 'Password updated. Other devices have been signed out.'
        }, extra_headers=[(header, value)])

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


    # --------------------------------------------------------------- plans

    def plan_payload(self, row):
        data = json.loads(row['data'])
        # The server owns the id and title; whatever the client stored inside
        # the document for them is overwritten on the way out.
        data['id'] = str(row['id'])
        data['title'] = row['title']
        return {
            'id': str(row['id']),
            'title': row['title'],
            'role': row['role'],
            'updatedAt': row['updated_at'],
            'plan': data,
        }

    def require_user(self):
        """Returns the session row, or None after answering 401."""
        row = auth.session_user(self.session_cookie())
        if row is None:
            self.send_json(401, {'error': 'not_signed_in'})
        return row

    def read_plan_body(self):
        """Returns (title, data_json, error). Validates shape and size, not content."""
        try:
            length = int(self.headers.get('Content-Length') or 0)
        except ValueError:
            length = 0
        if length > MAX_PLAN_BYTES:
            # Read and discard a bounded amount so the client gets the 413
            # rather than a reset connection, then drop the connection.
            remaining = min(length, 4 * MAX_PLAN_BYTES)
            while remaining > 0:
                chunk = self.rfile.read(min(remaining, 64 * 1024))
                if not chunk:
                    break
                remaining -= len(chunk)
            self.close_connection = True
            return None, None, (413, {'error': 'too_large', 'message': 'That plan is too large to save.'})

        payload = self.read_json(MAX_PLAN_BYTES)
        if not isinstance(payload, dict):
            return None, None, (400, {'error': 'bad_request'})

        title = payload.get('title')
        plan = payload.get('plan')
        if not isinstance(title, str) or not isinstance(plan, dict):
            return None, None, (400, {'error': 'bad_request'})
        title = title.strip()
        if not title or len(title) > MAX_PLAN_TITLE:
            return None, None, (400, {
                'error': 'invalid_title',
                'message': f'A plan title must be 1 to {MAX_PLAN_TITLE} characters.'
            })
        if not isinstance(plan.get('days', []), list):
            return None, None, (400, {'error': 'bad_request'})

        # Ids and titles are the server's; never store the client's copy.
        plan = {k: v for k, v in plan.items() if k not in ('id', 'title')}
        return title, json.dumps(plan, separators=(',', ':')), None

    def plan_not_found(self):
        # One answer for "does not exist" and "not yours", so ids cannot be
        # probed to learn which plans exist.
        return self.send_json(404, {'error': 'not_found'})

    def handle_list_plans(self):
        row = self.require_user()
        if row is None:
            return
        plans = [self.plan_payload(p) for p in db.list_plans_for(row['user_id'])]
        return self.send_json(200, {'plans': plans})

    def handle_get_plan(self, plan_id):
        row = self.require_user()
        if row is None:
            return
        plan = db.get_plan_for(plan_id, row['user_id'])
        if plan is None:
            return self.plan_not_found()
        return self.send_json(200, {'plan': self.plan_payload(plan)})

    def handle_create_plan(self):
        if not self.same_origin():
            return self.send_json(403, {'error': 'bad_origin'})
        row = self.require_user()
        if row is None:
            return
        title, data, error = self.read_plan_body()
        if error:
            return self.send_json(*error)
        if db.count_owned_plans(row['user_id']) >= MAX_PLANS_PER_USER:
            return self.send_json(409, {
                'error': 'too_many_plans',
                'message': f'An account can hold up to {MAX_PLANS_PER_USER} plans.'
            })
        plan_id = db.create_plan(row['user_id'], title, data)
        return self.send_json(201, {'plan': self.plan_payload(db.get_plan_for(plan_id, row['user_id']))})

    def handle_update_plan(self, plan_id):
        if not self.same_origin():
            return self.send_json(403, {'error': 'bad_origin'})
        row = self.require_user()
        if row is None:
            return
        # Membership first: a non-member learns nothing, not even whether
        # their body would have been valid.
        current = db.get_plan_for(plan_id, row['user_id'])
        if current is None:
            return self.plan_not_found()
        title, data, error = self.read_plan_body()
        if error:
            return self.send_json(*error)
        if current['role'] not in db.WRITE_ROLES:
            return self.send_json(403, {'error': 'read_only'})
        if not db.update_plan_for(plan_id, row['user_id'], title, data):
            return self.plan_not_found()
        return self.send_json(200, {'plan': self.plan_payload(db.get_plan_for(plan_id, row['user_id']))})

    def handle_delete_plan(self, plan_id):
        if not self.same_origin():
            return self.send_json(403, {'error': 'bad_origin'})
        row = self.require_user()
        if row is None:
            return
        current = db.get_plan_for(plan_id, row['user_id'])
        if current is None:
            return self.plan_not_found()
        if current['role'] != 'owner':
            # Someone the plan was shared with removes it from their own
            # list; the plan itself is the owner's to delete.
            if not db.leave_plan(plan_id, row['user_id']):
                return self.plan_not_found()
            return self.send_json(200, {'ok': True, 'left': True})
        if not db.delete_plan_for(plan_id, row['user_id']):
            return self.plan_not_found()
        return self.send_json(200, {'ok': True})

    # ------------------------------------------------------------- invites

    def invite_payload(self, row):
        return {
            'id': str(row['id']),
            'email': row['email_normalised'],
            'role': row['role'],
            'createdAt': row['created_at'],
            'expiresAt': row['expires_at'],
        }

    def handle_list_members(self, plan_id):
        row = self.require_user()
        if row is None:
            return
        members = db.list_members_for(plan_id, row['user_id'])
        if not members:
            return self.plan_not_found()
        return self.send_json(200, {'members': [
            {'email': m['email'], 'displayName': m['display_name'], 'role': m['role']}
            for m in members
        ]})

    def handle_list_invites(self, plan_id):
        row = self.require_user()
        if row is None:
            return
        current = db.get_plan_for(plan_id, row['user_id'])
        if current is None:
            return self.plan_not_found()
        if current['role'] != 'owner':
            return self.send_json(403, {'error': 'owner_only'})
        invites = db.list_pending_invites_for(plan_id, row['user_id'])
        return self.send_json(200, {'invites': [self.invite_payload(i) for i in invites]})

    def handle_create_invite(self, plan_id):
        if not self.same_origin():
            return self.send_json(403, {'error': 'bad_origin'})
        row = self.require_user()
        if row is None:
            return
        # Membership before anything else, so a non-member learns nothing
        # from how their request would otherwise have been answered.
        current = db.get_plan_for(plan_id, row['user_id'])
        if current is None:
            return self.plan_not_found()
        if current['role'] != 'owner':
            return self.send_json(403, {
                'error': 'owner_only',
                'message': "Only the plan's owner can invite people."
            })
        if not row['email_verified_at']:
            # An unverified account could be anyone's throwaway; letting it
            # send mail from this domain is how a sender gets marked as spam.
            return self.send_json(403, {
                'error': 'verify_first',
                'message': 'Verify your email address before inviting people.'
            })

        payload = self.read_json()
        if not isinstance(payload, dict):
            return self.send_json(400, {'error': 'bad_request'})
        email = payload.get('email')
        role = payload.get('role')
        if not isinstance(email, str) or not auth.is_valid_email(email.strip()):
            return self.send_json(400, {
                'error': 'invalid_email',
                'message': 'That does not look like an email address.'
            })
        if role not in INVITE_ROLES:
            return self.send_json(400, {'error': 'invalid_role'})

        invitee = auth.normalise_email(email.strip())
        if invitee == auth.normalise_email(row['email']) or db.is_member_email(plan_id, invitee):
            return self.send_json(409, {
                'error': 'already_member',
                'message': 'That person is already on this plan.'
            })
        if db.count_pending_invites(plan_id) >= MAX_OPEN_INVITES_PER_PLAN:
            return self.send_json(409, {
                'error': 'too_many_invites',
                'message': f'A plan can have up to {MAX_OPEN_INVITES_PER_PLAN} open invites.'
            })
        user_ok = auth.limiter.check(f'invite-user:{row["user_id"]}', INVITES_PER_USER_PER_HOUR, 3600)
        ip_ok = auth.limiter.check(f'invite-ip:{self.client_ip()}', INVITES_PER_USER_PER_HOUR, 3600)
        if not (user_ok and ip_ok):
            return self.send_json(429, {
                'error': 'rate_limited',
                'message': 'Too many invites sent. Try again in a little while.'
            })

        # 32 bytes from the OS CSPRNG; only its SHA-256 is stored.
        raw_token = auth.new_token()
        invite_id = db.create_invite(
            plan_id=plan_id,
            email_normalised=invitee,
            token_hash=auth.hash_token(raw_token),
            role=role,
            invited_by=row['user_id'],
            expires_at=db.now() + INVITE_TTL_SECONDS,
        )
        link = f'{BASE_URL}/?invite={urllib.parse.quote(raw_token)}'
        sent, _ = mailer.send_invite(invitee, link, row['display_name'] or row['email'],
                                     current['title'], role, INVITE_TTL_SECONDS // 86400)

        invite = next(i for i in db.list_pending_invites_for(plan_id, row['user_id'])
                      if i['id'] == invite_id)
        return self.send_json(201, {
            'invite': self.invite_payload(invite),
            'delivery': 'email' if sent else 'console',
        })

    def handle_revoke_invite(self, plan_id, invite_id):
        if not self.same_origin():
            return self.send_json(403, {'error': 'bad_origin'})
        row = self.require_user()
        if row is None:
            return
        current = db.get_plan_for(plan_id, row['user_id'])
        if current is None:
            return self.plan_not_found()
        if current['role'] != 'owner':
            return self.send_json(403, {'error': 'owner_only'})
        if not db.revoke_invite_for(plan_id, invite_id, row['user_id']):
            return self.plan_not_found()
        return self.send_json(200, {'ok': True})

    def handle_accept_invite(self):
        if not self.same_origin():
            return self.send_json(403, {'error': 'bad_origin'})
        row = self.require_user()
        if row is None:
            return
        if not auth.limiter.check(f'invite-accept-ip:{self.client_ip()}',
                                  INVITE_ACCEPTS_PER_IP_PER_HOUR, 3600):
            return self.send_json(429, {'error': 'rate_limited'})

        payload = self.read_json()
        token = payload.get('token') if isinstance(payload, dict) else None
        # Unknown, expired, revoked and already-used tokens all get the same
        # answer, so the response says nothing about which it was.
        invalid = (404, {
            'error': 'invite_invalid',
            'message': 'That invite has expired, was already used, or was withdrawn.'
        })
        if not isinstance(token, str) or not token or len(token) > 512:
            return self.send_json(*invalid)
        invite = db.find_open_invite(auth.hash_token(token))
        if invite is None:
            return self.send_json(*invalid)

        # The link alone is not enough: it may have been forwarded. It only
        # works for a verified account with the address it was sent to.
        if auth.normalise_email(row['email']) != invite['email_normalised']:
            return self.send_json(403, {
                'error': 'wrong_account',
                'message': 'This invite was sent to a different email address. '
                           'Sign in with that address to accept it.'
            })
        if not row['email_verified_at']:
            return self.send_json(403, {
                'error': 'verify_first',
                'message': 'Verify your email address, then open the invite link again.'
            })

        if db.accept_invite(invite['id'], row['user_id']) is None:
            return self.send_json(*invalid)
        plan = db.get_plan_for(invite['plan_id'], row['user_id'])
        return self.send_json(200, {'plan': self.plan_payload(plan)})


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
