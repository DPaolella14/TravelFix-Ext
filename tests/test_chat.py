#!/usr/bin/env python3
"""
Trip chat API: membership scoping, what members see of each other's
messages, and server-side validation of what a message may contain.

    DB_PATH=/tmp/tf-test.db python server.py > /tmp/tf-server.log 2>&1
    TF_DB=/tmp/tf-test.db TF_SERVER_LOG=/tmp/tf-server.log python tests/test_chat.py

Writes to that database directly (to mark accounts verified), so use a
throwaway one. Creates four accounts.
"""

import os
import sqlite3
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from test_auth import BASE, DB_PATH, check, request  # noqa: E402
from test_invites import accept, invite, invite_link_for, sign_up, token_from  # noqa: E402
import test_auth  # noqa: E402

SERVER_LOG = os.environ.get('TF_SERVER_LOG')


def post(jar, plan_id, text='', card=None, **extra):
    body = {'text': text, **extra}
    if card is not None:
        body['card'] = card
    return request(f'/api/plans/{plan_id}/messages', 'POST', body, jar=jar)


def messages(jar, plan_id, after=None):
    path = f'/api/plans/{plan_id}/messages' + (f'?after={after}' if after is not None else '')
    return request(path, jar=jar)


DAY_CARD = {
    'type': 'day_card', 'title': 'Saturday — Lisbon', 'destinationId': 'lisbon',
    'livingSpaceName': 'Palacio Belmonte', 'activityTitles': ['Tram 28', 'Fado night'], 'notes': 'Bring cash',
}


def main():
    if not SERVER_LOG or not os.path.exists(SERVER_LOG) or not os.path.exists(DB_PATH):
        print('TF_DB and TF_SERVER_LOG must point at the running server\'s database and output.')
        return 2
    print(f'Testing {BASE}\n')

    owner, owner_jar = sign_up('chat-owner')
    editor, editor_jar = sign_up('chat-editor')
    viewer, viewer_jar = sign_up('chat-viewer')
    stranger, stranger_jar = sign_up('chat-stranger')
    _, _, body = request('/api/plans', 'POST', {'title': 'Lisbon', 'plan': {'days': []}}, jar=owner_jar)
    plan_id = body['plan']['id']
    missing_id = str(int(plan_id) + 100000)
    for email, jar, role in [(editor, editor_jar, 'editor'), (viewer, viewer_jar, 'viewer')]:
        invite(owner_jar, plan_id, email, role)
        accept(jar, token_from(invite_link_for(email)))

    print('--- signed out ---')
    status, _, _ = messages(None, plan_id)
    check('reading needs a session', status == 401, f'status={status}')
    status, _, _ = post(None, plan_id, 'hi')
    check('posting needs a session', status == 401, f'status={status}')

    print('\n--- members talk to each other ---')
    status, _, body = post(owner_jar, plan_id, 'Who wants the window seat?')
    check('the owner can post', status == 201, f'status={status} {body}')
    first = body.get('message', {})
    check('the reply is the stored message', first.get('text') == 'Who wants the window seat?'
          and first.get('author', {}).get('self') is True, str(first))
    status, _, body = post(editor_jar, plan_id, 'Me!')
    check('an editor can post', status == 201, f'status={status}')
    status, _, body = post(viewer_jar, plan_id, 'Can I come too?')
    check('a viewer can post (chat is not editing the plan)', status == 201, f'status={status}')

    status, _, body = messages(editor_jar, plan_id)
    texts = [m['text'] for m in body.get('messages', [])]
    check('every member sees every message, oldest first',
          texts == ['Who wants the window seat?', 'Me!', 'Can I come too?'], str(texts))
    by_text = {m['text']: m['author'] for m in body.get('messages', [])}
    check('each message says who wrote it, with their role',
          by_text['Who wants the window seat?']['email'] == owner
          and by_text['Who wants the window seat?']['role'] == 'owner'
          and by_text['Can I come too?']['role'] == 'viewer', str(by_text))
    check("'self' is from the reader's point of view",
          by_text['Me!']['self'] is True and by_text['Who wants the window seat?']['self'] is False)

    status, _, body = messages(viewer_jar, plan_id, after=first['id'])
    check('?after= returns only newer messages',
          [m['text'] for m in body.get('messages', [])] == ['Me!', 'Can I come too?'], str(body))
    last_id = body['messages'][-1]['id']
    status, _, body = messages(viewer_jar, plan_id, after=last_id)
    check('nothing new is an empty list', status == 200 and body.get('messages') == [], str(body))
    for bad in ['-1', 'abc', '1.5', '9' * 30]:
        status, _, _ = messages(owner_jar, plan_id, after=bad)
        check(f'?after={bad[:10]} is refused', status == 400, f'status={status}')

    # ------------------------------------------------------------- IDOR
    print('\n--- non-member gets 404 on every chat endpoint ---')
    for label, call in [('GET messages', lambda pid: messages(stranger_jar, pid)),
                        ('POST messages', lambda pid: post(stranger_jar, pid, 'let me in')),
                        ('POST messages (malformed)', lambda pid: post(stranger_jar, pid, 12345))]:
        s_theirs, _, b_theirs = call(plan_id)
        s_none, _, b_none = call(missing_id)
        check(f'{label}: non-member gets 404', s_theirs == 404, f'status={s_theirs}')
        check(f'{label}: identical to a plan that does not exist',
              (s_theirs, b_theirs) == (s_none, b_none), f'{b_theirs} vs {b_none}')
    status, _, body = messages(owner_jar, plan_id)
    check("the stranger's message was not stored",
          'let me in' not in [m['text'] for m in body.get('messages', [])])

    # ------------------------------------------------------- validation
    print('\n--- validation ---')
    status, _, body = post(owner_jar, plan_id, 'a‮b\x07c\nnext line\tok')
    check('control and bidi-override characters are stripped, newlines kept',
          status == 201 and body['message']['text'] == 'abc\nnext line\tok', repr(body.get('message', {}).get('text')))
    payload = '<img src=x onerror=alert(1)>'
    status, _, body = post(owner_jar, plan_id, payload)
    check('markup is stored as text, for the client to escape',
          status == 201 and body['message']['text'] == payload, str(body))
    for label, args, expect in [
        ('an empty message', ('   ',), 400),
        ('a non-string text', (42,), 400),
        ('a message over 2000 characters', ('x' * 2001,), 400),
    ]:
        status, _, _ = post(owner_jar, plan_id, *args)
        check(f'refuses {label}', status == expect, f'status={status}')
    status, _, _ = post(owner_jar, plan_id, 'x' * 2000)
    check('accepts exactly 2000 characters', status == 201, f'status={status}')

    print('\n--- shared cards ---')
    status, _, body = post(owner_jar, plan_id, 'Saturday:', {**DAY_CARD, 'onclick': 'alert(1)', 'html': '<b>x</b>'})
    card = body.get('message', {}).get('card') or {}
    check('a day card is accepted', status == 201, f'status={status} {body}')
    check('fields a day card does not have are dropped', 'onclick' not in card and 'html' not in card, str(card))
    check('its fields come back intact', card.get('activityTitles') == ['Tram 28', 'Fado night']
          and card.get('destinationId') == 'lisbon', str(card))
    status, _, body = post(owner_jar, plan_id, '', {'type': 'plan_summary', 'title': 'Lisbon',
                                                     'daysCount': 3, 'startDate': '2027-05-01', 'totalEstimate': 1840.5})
    check('a card alone is a valid message', status == 201, f'status={status} {body}')
    for label, card in [
        ('an unknown card type', {'type': 'script', 'title': 'x'}),
        ('a card that is not an object', 'card'),
        ('a destinationId that is not an id', {**DAY_CARD, 'destinationId': 'javascript:alert(1)'}),
        ('a destinationId with quotes', {**DAY_CARD, 'destinationId': 'x" onmouseover="y'}),
        ('activityTitles that is not a list', {**DAY_CARD, 'activityTitles': 'Tram 28'}),
        ('too many activityTitles', {**DAY_CARD, 'activityTitles': ['a'] * 31}),
        ('a non-string activity title', {**DAY_CARD, 'activityTitles': [{'x': 1}]}),
        ('an over-long card title', {**DAY_CARD, 'title': 'x' * 201}),
        ('a non-numeric daysCount', {'type': 'plan_summary', 'daysCount': '3'}),
        ('a boolean totalEstimate', {'type': 'plan_summary', 'totalEstimate': True}),
        ('a negative totalEstimate', {'type': 'plan_summary', 'totalEstimate': -5}),
    ]:
        status, _, _ = post(owner_jar, plan_id, 'card', card)
        check(f'refuses {label}', status == 400, f'status={status}')

    status, _, _ = request(f'/api/plans/{plan_id}/messages', 'POST', {'text': 'hi'}, jar=owner_jar,
                           headers={'Origin': 'https://evil.example'})
    check('refuses another origin', status == 403, f'status={status}')

    # ------------------------------------------------- leaving, deleting
    print('\n--- leaving and deleting ---')
    request(f'/api/plans/{plan_id}', 'DELETE', jar=viewer_jar)
    status, _, _ = messages(viewer_jar, plan_id)
    check('after leaving the plan, its chat is 404', status == 404, f'status={status}')
    status, _, body = messages(owner_jar, plan_id)
    left = [m['author'] for m in body.get('messages', []) if m['text'] == 'Can I come too?']
    check('messages from someone who left stay, with no role',
          left and left[0]['role'] is None, str(left))

    request(f'/api/plans/{plan_id}', 'DELETE', jar=owner_jar)
    with sqlite3.connect(DB_PATH) as conn:
        remaining = conn.execute('SELECT COUNT(*) FROM messages WHERE plan_id = ?', (plan_id,)).fetchone()[0]
    check('deleting the plan deletes its chat', remaining == 0, str(remaining))

    print(f'\n{test_auth.PASS} passed, {test_auth.FAIL} failed')
    return 1 if test_auth.FAIL else 0


if __name__ == '__main__':
    sys.exit(main())
