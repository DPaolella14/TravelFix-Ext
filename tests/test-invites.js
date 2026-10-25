// Plan invites end to end: the owner sends one from the invite dialog, the
// invitee opens the emailed link in another browser, signs up with that
// address, verifies it, and lands in the shared plan with the invited role.
//
// Mail is off in tests, so links are read from the server's console output:
//   DB_PATH=/tmp/tf-test.db python server.py > /tmp/tf-server.log 2>&1
//   TF_SERVER_LOG=/tmp/tf-server.log node tests/test-invites.js
const fs = require('fs');
const { chromium, ctx, page, errs, check, summary, URL } = require('./lib');

const LOG = process.env.TF_SERVER_LOG;
const PASSWORD = 'a-reasonably-long-passphrase';
const stamp = Date.now();
const OWNER = `inv-owner-${stamp}@example.com`;
const EDITOR = `inv-editor-${stamp}@example.com`;
const VIEWER = `inv-viewer-${stamp}@example.com`;
const ORIGIN = new globalThis.URL(URL).origin;

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
  const status = await p.evaluate(async ({ email, password }) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.status;
  }, { email, password: PASSWORD });
  await settle(p, 500);
  const link = lastLink('Sign-in link', email);
  // Following the emailed link verifies the address (and sets a session).
  await p.evaluate(async (path) => { await fetch(path, { credentials: 'same-origin' }); },
    link ? link.replace(ORIGIN, '') : '/nope');
  await p.evaluate(() => window.travelFixApp.account.refresh());
  await settle(p);
  return status;
}

const titles = p => p.evaluate(() => window.travelFixApp.planner.getAllPlans().map(pl => pl.title));
const toast = p => p.evaluate(() => document.getElementById('travelfix-toast')?.textContent || '');

(async () => {
  if (!LOG || !fs.existsSync(LOG)) {
    console.log('TF_SERVER_LOG must point at the running server\'s console output.');
    console.log('\n0 passed, 1 failed');
    process.exitCode = 1;
    return;
  }
  const b = await chromium.launch();

  console.log('--- owner: invite dialog before signing in ---');
  const c1 = await ctx(b);
  const p1 = await page(c1);
  check('app booted for the owner', await ready(p1), errs(p1).join(' | '));
  await p1.evaluate(() => window.travelFixApp.ui.openInviteModal());
  await settle(p1, 400);
  const signedOutCopy = await p1.evaluate(() => document.body.innerText);
  check('signed out, the dialog says to sign in rather than taking an address',
    /Sign in to invite people/.test(signedOutCopy));
  await p1.evaluate(() => document.querySelector('.btn-sched-cancel')?.click());

  console.log('--- owner: sign up and send an invite ---');
  check('owner signs up', (await signUpAndVerify(p1, OWNER)) === 201);
  await p1.evaluate(() => window.travelFixApp.planner.renamePlan('Lisbon in June'));
  await settle(p1);
  check('the plan is the owner\'s on the server',
    await p1.evaluate(() => window.travelFixApp.planner.roleOf()) === 'owner');

  await p1.evaluate(() => window.travelFixApp.ui.openInviteModal());
  await settle(p1, 400);
  check('the invite dialog opens', await p1.evaluate(() =>
    !document.getElementById('invite-modal').classList.contains('hidden')));
  check('it names the plan', await p1.evaluate(() =>
    document.getElementById('invite-plan-title').textContent) === 'Lisbon in June');

  await p1.fill('#invite-email', 'not an email');
  await p1.evaluate(() => document.getElementById('form-invite-user').requestSubmit());
  await settle(p1, 300);
  // type=email blocks submission in the browser; force the server path too.
  await p1.evaluate(() => { document.getElementById('invite-email').type = 'text'; });
  await p1.evaluate(() => document.getElementById('form-invite-user').requestSubmit());
  await settle(p1, 800);
  const errText = await p1.evaluate(() => document.getElementById('invite-error').textContent);
  check('a bad address shows the server\'s reason in the dialog', /email address/i.test(errText), errText);

  await p1.fill('#invite-email', EDITOR);
  await p1.selectOption('#invite-role', 'editor');
  await p1.evaluate(() => document.getElementById('form-invite-user').requestSubmit());
  await settle(p1, 1200);
  check('the dialog closes', await p1.evaluate(() =>
    document.getElementById('invite-modal').classList.contains('hidden')));
  check('the owner is told the invite went out', /Invite (sent|created) for|Invite sent to/.test(await toast(p1)), await toast(p1));
  const editorLink = lastLink('Invite link', EDITOR);
  check('an invite link was mailed', !!editorLink, String(editorLink));

  console.log('--- invitee: opens the link signed out ---');
  const c2 = await ctx(b);
  const p2 = await c2.newPage();
  p2.__errors = [];
  p2.on('pageerror', e => p2.__errors.push('PAGEERROR: ' + e.message.slice(0, 200)));
  await p2.goto(editorLink, { waitUntil: 'load', timeout: 60000 });
  check('app booted for the invitee', await ready(p2), errs(p2).join(' | '));
  await settle(p2, 2500);
  check('the token is taken out of the address bar',
    !(await p2.evaluate(() => window.location.search)).includes('invite'));
  check('the sign-up dialog is offered', await p2.evaluate(() => !!document.querySelector('#auth-email')));
  check('they are told to use the invited address', /address the invite was sent to/.test(await toast(p2)), await toast(p2));
  await p2.evaluate(() => document.querySelector('.auth-dialog-close, .btn-close-icon')?.click());

  console.log('--- invitee: signs up with that address ---');
  check('invitee signs up and verifies', (await signUpAndVerify(p2, EDITOR)) === 201);
  await settle(p2, 1500);
  const t2 = await titles(p2);
  check('the shared plan is in their planner', t2.includes('Lisbon in June'), JSON.stringify(t2));
  check('it is the active plan', await p2.evaluate(() => window.travelFixApp.planner.plan.title) === 'Lisbon in June');
  check('as a co-planner', await p2.evaluate(() => window.travelFixApp.planner.roleOf()) === 'editor');
  check('they are told they joined', /You joined "Lisbon in June"/.test(await toast(p2)), await toast(p2));
  check('the token is forgotten once used',
    await p2.evaluate(() => sessionStorage.getItem('travelfix_pending_invite')) === null);

  console.log('--- an editor\'s change reaches the owner ---');
  await p2.evaluate(() => window.travelFixApp.planner.renamePlan('Lisbon and Porto'));
  await settle(p2);
  await p1.reload({ waitUntil: 'load' });
  await ready(p1);
  await settle(p1, 2500);
  check('the owner sees the editor\'s rename', (await titles(p1)).includes('Lisbon and Porto'), JSON.stringify(await titles(p1)));

  await p2.evaluate(() => window.travelFixApp.ui.openInviteModal());
  await settle(p2, 400);
  check('an editor is told only the owner can invite',
    /Only the plan's owner can invite people/.test(await p2.evaluate(() => document.body.innerText)));
  await p2.evaluate(() => document.querySelector('.btn-sched-cancel')?.click());

  console.log('--- a viewer cannot change the plan ---');
  await p1.evaluate(async (email) => {
    const planner = window.travelFixApp.planner;
    await planner.invite(email, 'viewer');
  }, VIEWER);
  const c3 = await ctx(b);
  const p3 = await c3.newPage();
  await p3.goto(lastLink('Invite link', VIEWER), { waitUntil: 'load', timeout: 60000 });
  await ready(p3);
  await settle(p3, 2500);
  await signUpAndVerify(p3, VIEWER);
  await settle(p3, 1500);
  check('the viewer joins as a viewer', await p3.evaluate(() => window.travelFixApp.planner.roleOf()) === 'viewer');
  await p3.evaluate(() => window.travelFixApp.planner.renamePlan('Viewer was here'));
  await settle(p3, 2000);
  check('their edit is put back', await p3.evaluate(() => window.travelFixApp.planner.plan.title) === 'Lisbon and Porto',
    await p3.evaluate(() => window.travelFixApp.planner.plan.title));
  check('and they are told why', /view this plan but not change it/.test(await toast(p3)), await toast(p3));
  const ownerView = await p1.evaluate(async () => (await (await fetch('/api/plans')).json()).plans.map(p => p.title));
  check('the owner\'s plan is unchanged', ownerView.includes('Lisbon and Porto') && !ownerView.includes('Viewer was here'),
    JSON.stringify(ownerView));

  for (const [label, p] of [['owner', p1], ['editor', p2], ['viewer', p3]]) {
    check(`no page errors for the ${label}`, (p.__errors || []).filter(e => /PAGEERROR/.test(e)).length === 0,
      (p.__errors || []).join(' | '));
  }

  await b.close();
  summary();
})();
