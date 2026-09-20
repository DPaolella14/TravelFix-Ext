// Sign-in UI against the live API.
const { chromium, ctx, page, hideMap, errs, check, summary, SP } = require('./lib');
const { execSync } = require('child_process');

(async () => {
  const b = await chromium.launch();
  const c = await ctx(b);
  const p = await page(c);
  await hideMap(p);

  console.log('--- signed out state ---');
  const out = await p.evaluate(() => ({
    btn: document.querySelector('#btn-account')?.textContent.trim(),
    signedIn: !!document.querySelector('.account-btn.signed-in')
  }));
  check('navbar offers Sign in', out.btn === 'Sign in', String(out.btn));
  check('not signed in yet', !out.signedIn);

  console.log('--- sign-in dialog ---');
  await p.click('#btn-account');
  await p.waitForTimeout(500);
  const dlg = await p.evaluate(() => ({
    hasEmail: !!document.querySelector('#signin-email'),
    hasPassword: !!document.querySelector('input[type="password"]'),
    note: document.querySelector('.account-note')?.textContent || ''
  }));
  check('asks for an email', dlg.hasEmail);
  check('no password field', !dlg.hasPassword);
  check('warns that mail is unconfigured', /printed in the terminal/i.test(dlg.note), dlg.note.slice(0, 60));
  await p.screenshot({ path: SP + '/signin-dialog.png' });

  console.log('--- invalid address is reported ---');
  await p.fill('#signin-email', 'nope');
  await p.click('#btn-send-link');
  await p.waitForTimeout(900);
  const err = await p.evaluate(() => {
    const e = document.querySelector('#signin-error');
    return { shown: e && !e.hidden, text: e ? e.textContent : '' };
  });
  check('invalid email shows an inline error', err.shown, err.text);
  check('dialog stays open on error', await p.evaluate(() => !!document.querySelector('#signin-email')));

  console.log('--- request a real link ---');
  await p.fill('#signin-email', 'ui-test@example.com');
  await p.click('#btn-send-link');
  await p.waitForTimeout(1200);
  const inbox = await p.evaluate(() => document.body.innerText);
  check('shows the check-console state', /Check the server console/i.test(inbox));
  await p.screenshot({ path: SP + '/signin-sent.png' });

  console.log('--- follow the link ---');
  const link = execSync("grep -o 'http://localhost:8080/api/auth/verify?token=[A-Za-z0-9_-]*' /tmp/tfapi.log | tail -1")
    .toString().trim();
  check('server printed a sign-in link', link.length > 40, link.slice(0, 50));

  await p.goto(link, { waitUntil: 'load', timeout: 30000 });
  await p.waitForTimeout(2500);
  const inApp = await p.evaluate(() => ({
    url: location.search,
    label: document.querySelector('.account-label')?.textContent || '',
    signedIn: !!document.querySelector('.account-btn.signed-in')
  }));
  check('redirected back into the app', !/signin=/.test(inApp.url), inApp.url);
  check('navbar shows the signed-in account', inApp.signedIn, String(inApp.signedIn));
  check('shows the email', /ui-test@example\.com/.test(inApp.label), inApp.label);
  await hideMap(p);
  await p.screenshot({ path: SP + '/signin-done.png' });

  console.log('--- session survives a reload ---');
  await p.reload({ waitUntil: 'load', timeout: 30000 });
  await p.waitForTimeout(2500);
  check('still signed in after reload',
    await p.evaluate(() => !!document.querySelector('.account-btn.signed-in')));

  console.log('--- cookie is invisible to scripts ---');
  const cookieVisible = await p.evaluate(() => document.cookie.includes('tf_session'));
  check('HttpOnly cookie unreadable from JS', !cookieVisible);

  console.log('--- sign out ---');
  await hideMap(p);
  await p.click('#btn-account');
  await p.waitForTimeout(500);
  await p.click('#btn-signout');
  await p.waitForTimeout(1500);
  check('back to signed out',
    await p.evaluate(() => document.querySelector('#btn-account')?.textContent.trim() === 'Sign in'));

  // The deliberate invalid-email submission above produces an expected 400,
  // which the browser logs as a console error. Everything else must be clean.
  const unexpected = errs(p).filter(e => !/status of 400/.test(e));
  check('no unexpected page errors', unexpected.length === 0, unexpected.join(' | '));
  await b.close();
  summary();
})();
