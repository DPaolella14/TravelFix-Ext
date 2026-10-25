#!/usr/bin/env python3
"""
Plan invite tests: token handling, single use, expiry, role fixing, and
membership scoping on every invite endpoint.

The raw invite token only ever exists in the email, so with mail switched
off the test reads it from the server's console output. Start the server
with a throwaway database and its output captured, then point this at both:

    DB_PATH=/tmp/tf-test.db python server.py > /tmp/tf-server.log 2>&1
    TF_DB=/tmp/tf-test.db TF_SERVER_LOG=/tmp/tf-server.log python tests/test_invites.py

It writes to that database directly (to mark test accounts verified and to
backdate an invite), so never point it at a database you care about.
Creates six accounts, so it needs six of the per-IP signup budget.
"""

import base64
import hashlib
import http.cookiejar
import os
import re
import secrets
import sqlite3
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from test_auth import BASE, DB_PATH, check, request  # noqa: E402
import test_auth  # noqa: E402

PASSWORD = 'a-perfectly-fine-passphrase'
SERVER_LOG = os.environ.get('TF_SERVER_LOG')
SEVEN_DAYS = 7 * 24 * 60 * 60


def sign_up(prefix, verified=True, email=None):
    jar = http.cookiejar.CookieJar()
    email = email or f'{prefix}-{secrets.token_hex(4)}@example.com'
    status, _, body = request('/api/auth/signup', 'POST',
                              {'email': email, 'password': PASSWORD}, jar=jar)
    if status != 201:
        print(f'  could not create a test account: {status} {body}')
        sys.exit(2)
    if verified:
        verify(email)
    return email, jar


def verify(email):
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('UPDATE users SET email_verified_at = ? WHERE email_normalised = ?',
                     (int(time.time()), email.lower()))


def invite_link_for(email):
    """The most recent invite link the server printed for this address."""
    with open(SERVER_LOG, encoding='utf-8', errors='replace') as fh:
        log = fh.read()
    found = re.findall(r'Invite link for ' + re.escape(email.lower())
                       + r':\s*\n\[TravelFix\] (\S+)', log)
    return found[-1] if found else None


def token_from(link):
    match = re.search(r'[?&]invite=([^&\s]+)', link or '')
    return match.group(1) if match else None


def invite(jar, plan_id, email, role):
    return request(f'/api/plans/{plan_id}/invites', 'POST', {'email': email, 'role': role}, jar=jar)


def accept(jar, token, **extra):
    return request('/api/invites/accept', 'POST', {'token': token, **extra}, jar=jar)


def plan_ids(jar):
    _, _, body = request('/api/plans', jar=jar)
    return {p['id']: p for p in body.get('plans', [])}


def main():
    if not SERVER_LOG or not os.path.exists(SERVER_LOG):
        print('TF_SERVER_LOG must point at the running server\'s console output.')
        return 2
    if not os.path.exists(DB_PATH):
        print('TF_DB must point at the running server\'s database.')
        return 2
    print(f'Testing {BASE}\n')

    owner, owner_jar = sign_up('owner')
    friend, friend_jar = sign_up('friend', verified=False)
    stranger, stranger_jar = sign_up('stranger')
    viewer, viewer_jar = sign_up('viewer')
    unverified_owner, unverified_jar = sign_up('unverified', verified=False)

    _, _, body = request('/api/plans', 'POST',
                         {'title': 'Kyoto <b>in</b> April', 'plan': {'days': []}}, jar=owner_jar)
    plan_id = body['plan']['id']
    missing_id = str(int(plan_id) + 100000)

    # ------------------------------------------------------------ session
    print('--- signed out ---')
    for method, path in [('GET', f'/api/plans/{plan_id}/invites'),
                         ('POST', f'/api/plans/{plan_id}/invites'),
                         ('GET', f'/api/plans/{plan_id}/members'),
                         ('DELETE', f'/api/plans/{plan_id}/invites/1'),
                         ('POST', '/api/invites/accept')]:
        status, _, _ = request(path, method, {'email': 'x@example.com', 'role': 'viewer', 'token': 'x'})
        check(f'{method} {path.replace(plan_id, "<id>")} needs a session', status == 401, f'status={status}')

    # ------------------------------------------------------------- create
    print('\n--- creating an invite ---')
    status, _, body = invite(owner_jar, plan_id, friend.upper(), 'editor')
    check('owner can invite', status == 201, f'status={status} {body}')
    check('the response never contains the token',
          'token' not in str(body).lower() and 'invite=' not in str(body), str(body))
    check('the address is normalised', body.get('invite', {}).get('email') == friend.lower(), str(body))

    link = invite_link_for(friend)
    token = token_from(link)
    check('an invite link was sent', bool(token), str(link))
    check('the link points at this app', (link or '').startswith(BASE + '/?invite='), str(link))
    raw = base64.urlsafe_b64decode(token + '=' * (-len(token) % 4)) if token else b''
    check('the token is 32 random bytes', len(raw) == 32, f'{len(raw)} bytes')

    with sqlite3.connect(DB_PATH) as conn:
        conn.row_factory = sqlite3.Row
        stored = conn.execute('SELECT * FROM invites WHERE email_normalised = ?',
                              (friend.lower(),)).fetchone()
        dump = '\n'.join(conn.iterdump())
    check('only the SHA-256 is stored',
          stored['token_hash'] == hashlib.sha256(token.encode()).hexdigest(), stored['token_hash'])
    check('the raw token appears nowhere in the database', token not in dump)
    check('it expires in exactly 7 days',
          stored['expires_at'] - stored['created_at'] == SEVEN_DAYS,
          str(stored['expires_at'] - stored['created_at']))
    check('the role is fixed at creation', stored['role'] == 'editor', stored['role'])

    status, _, body = request(f'/api/plans/{plan_id}/invites', jar=owner_jar)
    check('owner sees the open invite',
          status == 200 and [i['email'] for i in body.get('invites', [])] == [friend.lower()], str(body))

    print('\n--- refused invites ---')
    for label, email, role, expect in [
        ('an owner role', viewer, 'owner', 400),
        ('an unknown role', viewer, 'admin', 400),
        ('a missing role', viewer, None, 400),
        ('a bad address', 'not-an-email', 'viewer', 400),
        ('themselves', owner, 'viewer', 409),
    ]:
        status, _, _ = invite(owner_jar, plan_id, email, role)
        check(f'refuses inviting {label}', status == expect, f'status={status}')

    _, _, body = request('/api/plans', 'POST', {'title': 'Mine', 'plan': {}}, jar=unverified_jar)
    status, _, body = invite(unverified_jar, body['plan']['id'], viewer, 'viewer')
    check('an unverified account cannot send invites',
          status == 403 and body.get('error') == 'verify_first', f'status={status} {body}')

    # --------------------------------------------------------------- IDOR
    print('\n--- non-member gets 404 on every invite endpoint ---')

    def compare(label, method, path, body=None):
        s_theirs, _, b_theirs = request(path.format(plan_id), method, body, jar=stranger_jar)
        s_none, _, b_none = request(path.format(missing_id), method, body, jar=stranger_jar)
        check(f'{label}: non-member gets 404', s_theirs == 404, f'status={s_theirs} {b_theirs}')
        check(f'{label}: identical to a plan that does not exist',
              (s_theirs, b_theirs) == (s_none, b_none), f'{b_theirs} vs {b_none}')

    compare('GET members', 'GET', '/api/plans/{}/members')
    compare('GET invites', 'GET', '/api/plans/{}/invites')
    compare('POST invites', 'POST', '/api/plans/{}/invites', {'email': stranger, 'role': 'editor'})
    compare('POST invites (malformed)', 'POST', '/api/plans/{}/invites', {'role': 'owner'})
    compare('DELETE invite', 'DELETE', '/api/plans/{}/invites/' + str(stored['id']))
    check('the stranger did not invite themselves', invite_link_for(stranger) is None)

    # ------------------------------------------------------------- accept
    print('\n--- accepting ---')
    status, _, body = accept(stranger_jar, token)
    check('a forwarded link does not work for another account',
          status == 403 and body.get('error') == 'wrong_account', f'status={status} {body}')
    status, _, body = accept(friend_jar, token)
    check('the invitee must verify their address first',
          status == 403 and body.get('error') == 'verify_first', f'status={status} {body}')
    check('neither attempt used the invite up', plan_id not in plan_ids(friend_jar))

    verify(friend)
    status, _, body = accept(friend_jar, token, role='owner')
    check('the invitee joins the plan', status == 200 and body['plan']['id'] == plan_id,
          f'status={status} {body}')
    check('with the role the invite was made with, not one they ask for',
          body.get('plan', {}).get('role') == 'editor', str(body))
    check('the shared plan is in their list', plan_ids(friend_jar).get(plan_id, {}).get('role') == 'editor')

    status, _, body = accept(friend_jar, token)
    s_bad, _, b_bad = accept(friend_jar, secrets.token_urlsafe(32))
    check('the link works once', status == 404, f'status={status}')
    check('a used link looks exactly like a made-up one', (status, body) == (s_bad, b_bad),
          f'{body} vs {b_bad}')
    status, _, _ = request(f'/api/plans/{plan_id}/invites', jar=owner_jar)
    check('the accepted invite is no longer open',
          request(f'/api/plans/{plan_id}/invites', jar=owner_jar)[2].get('invites') == [])

    status, _, body = request(f'/api/plans/{plan_id}/members', jar=friend_jar)
    roles = {m['email']: m['role'] for m in body.get('members', [])}
    check('members list shows owner and editor',
          roles == {owner.lower(): 'owner', friend.lower(): 'editor'}, str(roles))

    print('\n--- roles ---')
    status, _, body = request(f'/api/plans/{plan_id}', 'PUT',
                              {'title': 'Kyoto and Osaka', 'plan': {'days': []}}, jar=friend_jar)
    check('an editor can edit', status == 200, f'status={status} {body}')
    status, _, _ = invite(friend_jar, plan_id, viewer, 'viewer')
    check('an editor cannot invite', status == 403, f'status={status}')
    status, _, _ = request(f'/api/plans/{plan_id}/invites', jar=friend_jar)
    check('an editor cannot list invites', status == 403, f'status={status}')

    invite(owner_jar, plan_id, viewer, 'viewer')
    status, _, body = accept(viewer_jar, token_from(invite_link_for(viewer)))
    check('a viewer joins as a viewer', status == 200 and body['plan']['role'] == 'viewer', str(body))
    status, _, _ = request(f'/api/plans/{plan_id}', 'PUT',
                           {'title': 'Hijack', 'plan': {'days': []}}, jar=viewer_jar)
    check('a viewer cannot edit', status == 403, f'status={status}')
    status, _, body = request(f'/api/plans/{plan_id}', jar=viewer_jar)
    check('a viewer can read', status == 200 and body['plan']['title'] == 'Kyoto and Osaka', str(body))

    # ------------------------------------------------- expiry and revoke
    print('\n--- expiry and revoking ---')
    late = f'late-{secrets.token_hex(4)}@example.com'
    invite(owner_jar, plan_id, late, 'viewer')
    late_token = token_from(invite_link_for(late))
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute('UPDATE invites SET expires_at = ? WHERE email_normalised = ?',
                     (int(time.time()) - 1, late))
    _, late_jar = sign_up('late', email=late)
    status, _, body = accept(late_jar, late_token)
    check('an expired link is refused', status == 404 and body.get('error') == 'invite_invalid',
          f'status={status} {body}')

    gone = f'gone-{secrets.token_hex(4)}@example.com'
    _, _, body = invite(owner_jar, plan_id, gone, 'editor')
    gone_id = body['invite']['id']
    status, _, _ = request(f'/api/plans/{plan_id}/invites/{gone_id}', 'DELETE', jar=friend_jar)
    check('an editor cannot revoke', status == 403, f'status={status}')
    status, _, _ = request(f'/api/plans/{plan_id}/invites/{gone_id}', 'DELETE', jar=owner_jar)
    check('the owner can revoke', status == 200, f'status={status}')
    with sqlite3.connect(DB_PATH) as conn:
        open_after = conn.execute(
            'SELECT COUNT(*) FROM invites WHERE email_normalised = ? AND revoked_at IS NULL',
            (gone,)).fetchone()[0]
    check('a revoked invite is closed', open_after == 0)
    status, _, _ = request(f'/api/plans/{plan_id}/invites/{gone_id}', 'DELETE', jar=owner_jar)
    check('revoking twice is 404', status == 404, f'status={status}')

    # ------------------------------------------------------ cross-origin
    print('\n--- cross-origin ---')
    evil = {'Origin': 'https://evil.example'}
    status, _, _ = request(f'/api/plans/{plan_id}/invites', 'POST',
                           {'email': stranger, 'role': 'editor'}, jar=owner_jar, headers=evil)
    check('POST invites rejects another origin', status == 403, f'status={status}')
    status, _, _ = request('/api/invites/accept', 'POST', {'token': 'x'}, jar=friend_jar, headers=evil)
    check('POST accept rejects another origin', status == 403, f'status={status}')

    # ------------------------------------------------------------ leaving
    print('\n--- leaving ---')
    status, _, body = request(f'/api/plans/{plan_id}', 'DELETE', jar=friend_jar)
    check('a member who is not the owner leaves instead of deleting',
          status == 200 and body.get('left') is True, f'status={status} {body}')
    status, _, _ = request(f'/api/plans/{plan_id}', jar=friend_jar)
    check('after leaving, the plan is 404 for them', status == 404, f'status={status}')
    status, _, _ = request(f'/api/plans/{plan_id}', jar=owner_jar)
    check('the plan still exists for the owner', status == 200, f'status={status}')

    print(f'\n{test_auth.PASS} passed, {test_auth.FAIL} failed')
    return 1 if test_auth.FAIL else 0


if __name__ == '__main__':
    sys.exit(main())
