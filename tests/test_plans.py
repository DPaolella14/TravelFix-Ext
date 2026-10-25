#!/usr/bin/env python3
"""
Plan API tests, centred on object-level authorisation.

Every plan endpoint is called by a second account against the first
account's plan, and must answer exactly what it answers for a plan that does
not exist. That is the IDOR check docs/BACKEND-SCOPE.md asks for, one per
endpoint.

Run the server first, then:

    python tests/test_plans.py
    TF_BASE=http://localhost:8081 python tests/test_plans.py

Creates three accounts, so it needs three of the per-IP signup budget
(RATE_LIMIT_PER_IP, default 10 an hour). Standard library only.
"""

import http.cookiejar
import os
import secrets
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from test_auth import BASE, check, request  # noqa: E402
import test_auth  # noqa: E402

PASSWORD = 'a-perfectly-fine-passphrase'


def sign_up():
    jar = http.cookiejar.CookieJar()
    email = f'plans-{secrets.token_hex(5)}@example.com'
    status, _, body = request('/api/auth/signup', 'POST',
                              {'email': email, 'password': PASSWORD}, jar=jar)
    if status != 201:
        print(f'  could not create a test account: {status} {body}')
        sys.exit(2)
    return email, jar


def log_in(email):
    """A fresh cookie jar: stands in for a second device or browser."""
    jar = http.cookiejar.CookieJar()
    status, _, _ = request('/api/auth/login', 'POST',
                           {'email': email, 'password': PASSWORD}, jar=jar)
    return status, jar


def sample_plan(note):
    return {
        'currency': 'EUR',
        'collaborators': [],
        'days': [{'date': '2027-05-01', 'destinationId': 'paris', 'notes': note,
                  'stay': None, 'activities': [], 'transit': None}],
    }


def main():
    print(f'Testing {BASE}\n')

    # ------------------------------------------------------- no session
    print('--- signed out ---')
    for method, path in [('GET', '/api/plans'), ('POST', '/api/plans'),
                         ('GET', '/api/plans/1'), ('PUT', '/api/plans/1'),
                         ('DELETE', '/api/plans/1')]:
        body = {'title': 'x', 'plan': {}} if method in ('POST', 'PUT') else None
        status, _, resp = request(path, method, body)
        check(f'{method} {path} needs a session', status == 401, f'status={status} {resp}')

    alice, alice_jar = sign_up()
    bob, bob_jar = sign_up()

    # ------------------------------------------------------------- CRUD
    print('\n--- owner CRUD ---')
    status, _, body = request('/api/plans', 'GET', jar=alice_jar)
    check('a new account has no plans', status == 200 and body.get('plans') == [], str(body))

    status, _, body = request('/api/plans', 'POST',
                              {'title': '  Paris in May  ', 'plan': sample_plan('first')},
                              jar=alice_jar)
    check('create answers 201', status == 201, f'status={status} {body}')
    created = body.get('plan', {})
    plan_id = created.get('id')
    check('create returns a server id', isinstance(plan_id, str) and plan_id.isdigit(), str(created))
    check('create trims the title', created.get('title') == 'Paris in May', str(created))
    check('the creator is the owner', created.get('role') == 'owner', str(created))
    check('the plan body round-trips',
          created.get('plan', {}).get('days', [{}])[0].get('notes') == 'first', str(created))

    status, _, body = request('/api/plans', 'POST',
                              {'title': 'x', 'plan': {**sample_plan('spoof'), 'id': '999999'}},
                              jar=alice_jar)
    check('a client-supplied id is ignored',
          status == 201 and body['plan']['id'] != '999999'
          and body['plan']['plan']['id'] == body['plan']['id'], str(body))
    spare_id = body.get('plan', {}).get('id')

    status, _, body = request(f'/api/plans/{plan_id}', 'GET', jar=alice_jar)
    check('owner can read the plan', status == 200 and body['plan']['id'] == plan_id, str(body))

    status, _, body = request(f'/api/plans/{plan_id}', 'PUT',
                              {'title': 'Paris and Lyon', 'plan': sample_plan('second')},
                              jar=alice_jar)
    check('owner can update the plan',
          status == 200 and body['plan']['title'] == 'Paris and Lyon'
          and body['plan']['plan']['days'][0]['notes'] == 'second', f'status={status} {body}')

    # ------------------------------------------------- across devices
    print('\n--- persists across devices ---')
    status, other_device = log_in(alice)
    check('owner logs in on a second device', status == 200, f'status={status}')
    status, _, body = request('/api/plans', 'GET', jar=other_device)
    ids = [p['id'] for p in body.get('plans', [])]
    check('the second device sees both plans', status == 200 and plan_id in ids and spare_id in ids, str(ids))
    mine = next((p for p in body.get('plans', []) if p['id'] == plan_id), {})
    check('the second device sees the latest edit',
          mine.get('title') == 'Paris and Lyon'
          and mine.get('plan', {}).get('days', [{}])[0].get('notes') == 'second', str(mine))

    # ------------------------------------------------------------- IDOR
    print('\n--- non-member gets 404 on every endpoint ---')
    missing_id = str(int(plan_id) + 100000)

    def compare(label, method, body=None):
        s_theirs, _, b_theirs = request(f'/api/plans/{plan_id}', method, body, jar=bob_jar)
        s_none, _, b_none = request(f'/api/plans/{missing_id}', method, body, jar=bob_jar)
        check(f'{label}: non-member gets 404', s_theirs == 404, f'status={s_theirs} {b_theirs}')
        check(f'{label}: identical to a plan that does not exist',
              (s_theirs, b_theirs) == (s_none, b_none), f'{s_theirs} {b_theirs} vs {s_none} {b_none}')

    compare('GET /api/plans/<id>', 'GET')
    compare('PUT /api/plans/<id>', 'PUT', {'title': 'Hijacked', 'plan': sample_plan('bob was here')})
    compare('PUT /api/plans/<id> (malformed body)', 'PUT', {'nonsense': True})
    compare('DELETE /api/plans/<id>', 'DELETE')

    status, _, body = request('/api/plans', 'GET', jar=bob_jar)
    check("GET /api/plans: non-member's list leaves the plan out",
          status == 200 and plan_id not in [p['id'] for p in body.get('plans', [])], str(body))

    status, _, body = request(f'/api/plans/{plan_id}', 'GET', jar=alice_jar)
    check("the non-member's PUT and DELETE changed nothing",
          status == 200 and body['plan']['title'] == 'Paris and Lyon'
          and body['plan']['plan']['days'][0]['notes'] == 'second', f'status={status} {body}')

    # A third account, signed up on a fresh database, still cannot reach
    # plan 1 by guessing the lowest id.
    carol, carol_jar = sign_up()
    status, _, _ = request('/api/plans/1', 'GET', jar=carol_jar)
    check('guessing a low id gets 404', status == 404, f'status={status}')

    # ------------------------------------------------------- validation
    print('\n--- validation ---')
    bad_bodies = [
        ('missing title', {'plan': sample_plan('x')}),
        ('empty title', {'title': '   ', 'plan': sample_plan('x')}),
        ('title too long', {'title': 'x' * 201, 'plan': sample_plan('x')}),
        ('plan not an object', {'title': 'x', 'plan': [1, 2, 3]}),
        ('days not a list', {'title': 'x', 'plan': {'days': 'nope'}}),
        ('title not a string', {'title': 42, 'plan': sample_plan('x')}),
    ]
    for label, body in bad_bodies:
        status, _, _ = request('/api/plans', 'POST', body, jar=alice_jar)
        check(f'create rejects {label}', status == 400, f'status={status}')

    huge = sample_plan('y' * (300 * 1024))
    status, _, _ = request('/api/plans', 'POST', {'title': 'big', 'plan': huge}, jar=alice_jar)
    check('create rejects an oversized plan', status == 413, f'status={status}')
    status, _, _ = request(f'/api/plans/{plan_id}', 'PUT', {'title': 'big', 'plan': huge}, jar=alice_jar)
    check('update rejects an oversized plan', status == 413, f'status={status}')

    for path in ['/api/plans/0', '/api/plans/-1', '/api/plans/abc', "/api/plans/1%20OR%201=1",
                 '/api/plans/' + '9' * 30]:
        status, _, _ = request(path, 'GET', jar=alice_jar)
        check(f'GET {path[:28]} is 404', status == 404, f'status={status}')

    # ------------------------------------------------------ cross-origin
    print('\n--- cross-origin ---')
    evil = {'Origin': 'https://evil.example'}
    for method, path in [('POST', '/api/plans'), ('PUT', f'/api/plans/{plan_id}'),
                         ('DELETE', f'/api/plans/{plan_id}')]:
        status, _, _ = request(path, method, {'title': 'x', 'plan': {}}, jar=alice_jar, headers=evil)
        check(f'{method} {path} rejects another origin', status == 403, f'status={status}')

    # ---------------------------------------------------------- deletion
    print('\n--- deletion ---')
    status, _, _ = request(f'/api/plans/{spare_id}', 'DELETE', jar=alice_jar)
    check('owner can delete a plan', status == 200, f'status={status}')
    status, _, _ = request(f'/api/plans/{spare_id}', 'GET', jar=alice_jar)
    check('a deleted plan is gone', status == 404, f'status={status}')
    status, _, _ = request(f'/api/plans/{spare_id}', 'DELETE', jar=alice_jar)
    check('deleting twice is 404', status == 404, f'status={status}')

    print(f'\n{test_auth.PASS} passed, {test_auth.FAIL} failed')
    return 1 if test_auth.FAIL else 0


if __name__ == '__main__':
    sys.exit(main())
