#!/usr/bin/env python3
"""
Data export and account deletion.

Deletion is checked from the outside (the account no longer works, other
people's plans no longer show it) and from the inside (the database, and the
raw bytes of its file, no longer contain the address).

    DB_PATH=/tmp/tf-test.db python server.py > /tmp/tf-server.log 2>&1
    TF_DB=/tmp/tf-test.db TF_SERVER_LOG=/tmp/tf-server.log python tests/test_account.py

Writes to that database directly (to mark accounts verified), so use a
throwaway one. Creates three accounts with passwords and one by emailed link.
"""

import http.cookiejar
import json
import os
import re
import secrets
import sqlite3
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from test_auth import BASE, DB_PATH, check, request  # noqa: E402
from test_invites import PASSWORD, accept, invite, invite_link_for, sign_up, token_from  # noqa: E402
import test_auth  # noqa: E402
import test_invites  # noqa: E402

SERVER_LOG = os.environ.get('TF_SERVER_LOG')


def link_for(kind, email):
    with open(SERVER_LOG, encoding='utf-8', errors='replace') as fh:
        found = re.findall(kind + r' for ' + re.escape(email.lower()) + r':\s*\n\[TravelFix\] (\S+)', fh.read())
    return found[-1] if found else None


def new_plan(jar, title):
    _, _, body = request('/api/plans', 'POST',
                         {'title': title, 'plan': {'days': [], 'notes': f'{title} notes'}}, jar=jar)
    return body['plan']['id']


def db_text():
    with sqlite3.connect(DB_PATH) as conn:
        return '\n'.join(conn.iterdump()).lower()


def raw_bytes():
    data = b''
    for suffix in ('', '-wal'):
        path = DB_PATH + suffix
        if os.path.exists(path):
            with open(path, 'rb') as fh:
                data += fh.read()
    return data.lower()


def main():
    if not SERVER_LOG or not os.path.exists(SERVER_LOG) or not os.path.exists(DB_PATH):
        print('TF_DB and TF_SERVER_LOG must point at the running server\'s database and output.')
        return 2
    test_invites.SERVER_LOG = SERVER_LOG
    print(f'Testing {BASE}\n')

    print('--- signed out ---')
    status, _, _ = request('/api/account/export')
    check('export needs a session', status == 401, f'status={status}')
    status, _, _ = request('/api/account/delete', 'POST', {'confirmEmail': 'x@example.com'})
    check('delete needs a session', status == 401, f'status={status}')

    # Alice owns a plan shared with Bob, is a viewer on Bob's plan, and has
    # an open invite to Carol's plan.
    alice, alice_jar = sign_up('alice')
    bob, bob_jar = sign_up('bob')
    carol, carol_jar = sign_up('carol')
    alice_plan = new_plan(alice_jar, 'Alice in Lisbon')
    bob_plan = new_plan(bob_jar, 'Bob in Porto')
    carol_plan = new_plan(carol_jar, 'Carol in Faro')
    invite(alice_jar, alice_plan, bob, 'editor')
    accept(bob_jar, token_from(invite_link_for(bob)))
    invite(bob_jar, bob_plan, alice, 'viewer')
    accept(alice_jar, token_from(invite_link_for(alice)))
    invite(carol_jar, carol_plan, alice, 'editor')

    # ------------------------------------------------------------- export
    print('\n--- export ---')
    status, headers, body = request('/api/account/export', jar=alice_jar)
    check('export answers 200', status == 200, f'status={status}')
    check('it downloads as a file',
          'attachment' in headers.get('Content-Disposition', '')
          and '.json' in headers.get('Content-Disposition', ''), headers.get('Content-Disposition', ''))
    check('it is not cached', headers.get('Cache-Control') == 'no-store')
    check('the account is in it', body.get('account', {}).get('email') == alice, str(body.get('account')))
    plans = {p['id']: p for p in body.get('plans', [])}
    check('the plan they own is in it, with its contents',
          plans.get(alice_plan, {}).get('role') == 'owner'
          and plans[alice_plan]['plan'].get('notes') == 'Alice in Lisbon notes', str(plans.get(alice_plan)))
    check('a plan shared with them is in it', plans.get(bob_plan, {}).get('role') == 'viewer')
    check("a plan they were only invited to is not", carol_plan not in plans)
    sent = body.get('invitesSent', [])
    check('invites they sent are in it',
          [(i['email'], i['status']) for i in sent] == [(bob, 'accepted')], str(sent))
    received = sorted((i['planId'], i['status']) for i in body.get('invitesReceived', []))
    check('invites addressed to them are in it',
          received == sorted([(bob_plan, 'accepted'), (carol_plan, 'open')]), str(received))
    check('their sessions are in it', len(body.get('sessions', [])) >= 1)

    raw = json.dumps(body)
    with sqlite3.connect(DB_PATH) as conn:
        secrets_stored = [r[0] for r in conn.execute(
            'SELECT token_hash FROM sessions UNION ALL SELECT token_hash FROM login_tokens'
            ' UNION ALL SELECT token_hash FROM invites UNION ALL'
            ' SELECT password_hash FROM users WHERE password_hash IS NOT NULL')]
    check('no password or token hash is in it',
          not any(h in raw for h in secrets_stored) and 'hash' not in raw.lower())
    status, _, body = request('/api/account/export', jar=bob_jar)
    check("another account's export holds only their own account",
          body.get('account', {}).get('email') == bob)

    # ------------------------------------------------------------- delete
    print('\n--- refused deletions ---')
    for label, payload, expect in [
        ('without typing the address', {'password': PASSWORD}, 400),
        ('with the wrong address', {'confirmEmail': bob, 'password': PASSWORD}, 400),
        ('without the password', {'confirmEmail': alice}, 403),
        ('with the wrong password', {'confirmEmail': alice, 'password': 'not-the-password-at-all'}, 403),
    ]:
        status, _, _ = request('/api/account/delete', 'POST', payload, jar=alice_jar)
        check(f'refuses {label}', status == expect, f'status={status}')
    status, _, _ = request('/api/account/delete', 'POST', {'confirmEmail': alice, 'password': PASSWORD},
                           jar=alice_jar, headers={'Origin': 'https://evil.example'})
    check('refuses another origin', status == 403, f'status={status}')
    check('nothing was deleted by those', request('/api/auth/me', jar=alice_jar)[2].get('user') is not None)

    print('\n--- deleting ---')
    status, headers, body = request('/api/account/delete', 'POST',
                                    {'confirmEmail': '  ' + alice.upper() + ' ', 'password': PASSWORD},
                                    jar=alice_jar)
    check('delete answers 200', status == 200, f'status={status} {body}')
    check('the session cookie is cleared', 'Max-Age=0' in headers.get('Set-Cookie', ''),
          headers.get('Set-Cookie', ''))

    status, _, body = request('/api/auth/me', jar=alice_jar)
    check('the old session no longer works', body.get('user') is None, str(body))
    status, _, _ = request('/api/auth/login', 'POST', {'email': alice, 'password': PASSWORD})
    check('the password no longer logs in', status == 401, f'status={status}')

    status, _, _ = request(f'/api/plans/{alice_plan}', jar=bob_jar)
    check('the plan they owned is gone for the people it was shared with', status == 404, f'status={status}')
    _, _, body = request(f'/api/plans/{bob_plan}/members', jar=bob_jar)
    check("they are gone from other people's plans",
          [m['email'] for m in body.get('members', [])] == [bob], str(body))
    _, _, body = request(f'/api/plans/{carol_plan}/invites', jar=carol_jar)
    check('open invites to their address are gone', body.get('invites') == [], str(body))
    status, _, _ = request(f'/api/plans/{bob_plan}', jar=bob_jar)
    check("other people's plans are untouched", status == 200, f'status={status}')

    check('the address appears nowhere in the database', alice.lower() not in db_text())
    check('nor anywhere in the database file on disk', alice.lower().encode() not in raw_bytes())
    check("the plan's contents are not left in the file either",
          b'alice in lisbon notes' not in raw_bytes())

    # --------------------------------------------- an account with no password
    print('\n--- an account made by emailed link ---')
    linky = f'linky-{secrets.token_hex(4)}@example.com'
    request('/api/auth/request-link', 'POST', {'email': linky})
    jar = http.cookiejar.CookieJar()
    link = link_for('Sign-in link', linky) or ''
    request(link.replace(BASE, ''), jar=jar, follow=False)
    status, _, body = request('/api/auth/me', jar=jar)
    check('signed in by link', (body.get('user') or {}).get('email') == linky, str(body))
    status, _, _ = request('/api/account/delete', 'POST', {'confirmEmail': linky}, jar=jar)
    check('it is deleted by typing the address alone', status == 200, f'status={status}')
    check('and is gone', linky not in db_text())

    print(f'\n{test_auth.PASS} passed, {test_auth.FAIL} failed')
    return 1 if test_auth.FAIL else 0


if __name__ == '__main__':
    sys.exit(main())
