// Group chat between two members of a shared plan, in two browsers.
//
// Mail is off in tests, so sign-in and invite links are read from the
// server's console output:
//   DB_PATH=/tmp/tf-test.db python server.py > /tmp/tf-server.log 2>&1
//   TF_SERVER_LOG=/tmp/tf-server.log node tests/test-groupchat.js
const fs = require('fs');
const { chromium, ctx, page, hideMap, errs, check, summary, URL } = require('./lib');

const LOG = process.env.TF_SERVER_LOG;
const PASSWORD = 'a-reasonably-long-passphrase';
const stamp = Date.now();
const OWNER = `gc-owner-${stamp}@example.com`;
const FRIEND = `gc-friend-${stamp}@example.com`;
const ORIGIN = new globalThis.URL(URL).origin;
const POLL_WAIT = 8000;  // CHAT_POLL_MS is 3000; leave room for slow requests

const ready = p => p.waitForFunction(() => !!(window.travelFixApp && window.travelFixApp.planner), null, { timeout: 30000 })
  .then(() => true, () => false);
const settle = (p, ms = 1500) => p.waitForTimeout(ms);

function lastLink(kind, email) {
  const log = fs.readFileSync(LOG, 'utf8');
  const re = new RegExp(`${kind} for ${email.replace(/[.+]/g, '\\$&')}:\\s*\\n\\[TravelFix\\] (\\S+)`, 'g');
  let m, last = null;
  while ((m = re.exec(log))) last = m[1];
  return last;
}

async function signUpAndVerify(p, email) {
  await p.evaluate(async ({ email, password }) => {
    await fetch('/api/auth/signup', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  }, { email, password: PASSWORD });
  await settle(p, 500);
  const link = lastLink('Sign-in link', email);
  await p.evaluate(async (path) => { await fetch(path, { credentials: 'same-origin' }); }, link.replace(ORIGIN, ''));
  await p.evaluate(() => window.travelFixApp.account.refresh());
  await settle(p);
}

const streamText = p => p.evaluate(() => document.getElementById('docked-chat-messages').textContent);
const waitForText = (p, text) => p.waitForFunction(
  t => document.getElementById('docked-chat-messages').textContent.includes(t), text, { timeout: POLL_WAIT })
  .then(() => true, () => false);

async function send(p, text) {
  await p.fill('#docked-chat-input', text);
  await p.click('.btn-chat-send');
}

(async () => {
  if (!LOG || !fs.existsSync(LOG)) {
    console.log('TF_SERVER_LOG must point at the running server\'s console output.');
    console.log('\n0 passed, 1 failed');
    process.exitCode = 1;
    return;
  }
  const b = await chromium.launch();

  console.log('--- signed out, chat is local notes ---');
  const c1 = await ctx(b);
  const p1 = await page(c1);
  check('app booted for the owner', await ready(p1), errs(p1).join(' | '));
  await hideMap(p1);
  await p1.click('#tab-btn-chat');
  await settle(p1, 800);
  check('the chat says notes stay in this browser', /stay in this browser/.test(await streamText(p1)));
  check('it is not shared', !(await p1.evaluate(() => window.travelFixApp.chat.isShared())));

  console.log('--- signed in, the plan has a shared conversation ---');
  await signUpAndVerify(p1, OWNER);
  await p1.evaluate(() => window.travelFixApp.planner.renamePlan('Rome in May'));
  await settle(p1);
  check('the chat is now the plan\'s', await p1.evaluate(() => window.travelFixApp.chat.isShared()));
  check('it says who sees it', /Everyone this plan is shared with/.test(await streamText(p1)), await streamText(p1));

  await p1.evaluate(async (email) => { await window.travelFixApp.planner.invite(email, 'editor'); }, FRIEND);
  const c2 = await ctx(b);
  const p2 = await c2.newPage();
  p2.__errors = [];
  p2.on('pageerror', e => p2.__errors.push('PAGEERROR: ' + e.message.slice(0, 200)));
  await p2.goto(lastLink('Invite link', FRIEND), { waitUntil: 'load', timeout: 60000 });
  check('app booted for the friend', await ready(p2));
  await settle(p2, 2500);
  await p2.evaluate(() => document.querySelector('.tf-schedule-overlay')?.click());
  await signUpAndVerify(p2, FRIEND);
  await settle(p2, 2000);
  check('the friend joined the plan', await p2.evaluate(() => window.travelFixApp.planner.plan.title) === 'Rome in May');
  await hideMap(p2);
  await p2.click('#tab-btn-chat');
  await settle(p2, 800);
  check('the friend is in the same conversation', await p2.evaluate(() =>
    window.travelFixApp.chat.planId === window.travelFixApp.planner.plan.id && window.travelFixApp.chat.isShared()));

  console.log('--- messages travel both ways ---');
  await send(p1, 'Colosseum on Saturday?');
  check('the owner sees their own message straight away', (await streamText(p1)).includes('Colosseum on Saturday?'));
  check('it reaches the friend by polling', await waitForText(p2, 'Colosseum on Saturday?'));
  const fromOwner = await p2.evaluate(() => {
    const row = [...document.querySelectorAll('.chat-message-row')].find(r => r.textContent.includes('Colosseum'));
    return row ? { other: row.classList.contains('msg-other'), author: row.querySelector('.msg-author')?.textContent,
                   role: row.querySelector('.msg-role-tag')?.textContent } : null;
  });
  check('the friend sees who wrote it', fromOwner && fromOwner.other && fromOwner.author.includes('gc-owner-')
    && fromOwner.role === 'Owner', JSON.stringify(fromOwner));

  await send(p2, 'Yes, and gelato after');
  check('the reply reaches the owner', await waitForText(p1, 'Yes, and gelato after'));
  check('the reply is tagged with the friend\'s role', await p1.evaluate(() => {
    const row = [...document.querySelectorAll('.chat-message-row')].find(r => r.textContent.includes('gelato'));
    return row?.querySelector('.msg-role-tag')?.textContent === 'Co-Planner';
  }));
  await settle(p1, 1000);
  check('each message appears once', (await p1.evaluate(() =>
    window.travelFixApp.chat.getMessages('group').filter(m => m.text === 'Colosseum on Saturday?').length)) === 1);

  console.log('--- a hostile message is shown as text ---');
  const evil = '<img src=x onerror="window.__chatXss=1">';
  await send(p2, evil);
  check('it reaches the owner', await waitForText(p1, evil));
  await settle(p1, 500);
  check('as literal text, not markup', await p1.evaluate(() =>
    !window.__chatXss && !document.querySelector('#docked-chat-messages img[src="x"]')));

  console.log('--- unread count while the chat is closed ---');
  await p1.click('#tab-btn-planner').catch(() => p1.evaluate(() => document.querySelector('[id^="tab-btn-"]:not(#tab-btn-chat)')?.click()));
  await settle(p1, 500);
  await send(p2, 'Booked the tickets');
  await p1.waitForFunction(() => {
    const u = window.travelFixApp.chat.state.unreadCounts;
    return (u.group || 0) > 0;
  }, null, { timeout: POLL_WAIT }).catch(() => {});
  check('a message from someone else counts as unread', await p1.evaluate(() =>
    (window.travelFixApp.chat.state.unreadCounts.group || 0) > 0));

  console.log('--- nothing shared is kept in the browser ---');
  check('the shared conversation is not in localStorage', await p1.evaluate(() =>
    !(localStorage.getItem('travelfix_chat_state_v2') || '').includes('Colosseum')));

  console.log('--- signing out goes back to local notes ---');
  await p2.evaluate(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    await window.travelFixApp.account.refresh();
  });
  await settle(p2, 1500);
  check('the friend\'s chat is local again', !(await p2.evaluate(() => window.travelFixApp.chat.isShared())));
  check('and the shared messages are gone from it', !(await p2.evaluate(() =>
    window.travelFixApp.chat.getMessages('group').some(m => m.text === 'Colosseum on Saturday?'))));

  for (const [label, p] of [['owner', p1], ['friend', p2]]) {
    check(`no page errors for the ${label}`, (p.__errors || []).filter(e => /PAGEERROR/.test(e)).length === 0,
      (p.__errors || []).join(' | '));
  }
  await b.close();
  summary();
})();
