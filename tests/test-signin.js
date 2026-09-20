// Account UI: sign up with a password, log in, magic link, sign out.
const { chromium, ctx, page, hideMap, errs, check, summary, SP } = require('./lib');
const { execSync } = require('child_process');

const EMAIL = `ui-${Date.now()}@example.com`;
const PASSWORD = 'a-reasonably-long-passphrase';

(async () => {
  const b = await chromium.launch();
  const c = await ctx(b);
  const p = await page(c);
  await hideMap(p);

  console.log('--- logged out navbar ---');
  const out = await p.evaluate(() => {
    const btn = document.querySelector('#btn-account');
    return {
      text: btn?.textContent.replace(/\s+/g, ' ').trim(),
      isCta: btn?.classList.contains('account-cta'),
      bg: btn ? getComputedStyle(btn).backgroundImage : ''
    };
  });
  check('button offers both actions', /Log in \/ Sign up/.test(out.text || ''), String(out.text));
  check('button is the prominent filled style', out.isCta && /gradient/.test(out.bg), out.bg.slice(0, 40));

  console.log('--- dialog has both tabs ---');
  await p.evaluate(() => document.querySelector('#btn-account').click());
  await p.waitForTimeout(500);
  const dlg = await p.evaluate(() => ({
    tabs: [...document.querySelectorAll('.auth-tab')].map(t => t.textContent.trim()),
    active: document.querySelector('.auth-tab.active')?.textContent.trim(),
    hasPassword: !!document.querySelector('#auth-password'),
    hasMagic: !!document.querySelector('#btn-magic-link')
  }));
  check('Log in and Sign up tabs present', dlg.tabs.join(',') === 'Log in,Sign up', dlg.tabs.join(','));
  check('opens on Log in', dlg.active === 'Log in', String(dlg.active));
  check('has a password field', dlg.hasPassword);
  check('still offers the emailed link', dlg.hasMagic);
  await p.screenshot({ path: SP + '/auth-login.png' });

  console.log('--- switch to Sign up ---');
  await p.evaluate(() => document.querySelector('.auth-tab[data-mode="signup"]').click());
  await p.waitForTimeout(400);
  check('sign up tab active',
    await p.evaluate(() => document.querySelector('.auth-tab.active')?.textContent.trim() === 'Sign up'));
  await p.screenshot({ path: SP + '/auth-signup.png' });

  console.log('--- weak password refused ---');
  await p.fill('#auth-email', EMAIL);
  await p.fill('#auth-password', 'password123');
  await p.evaluate(() => document.querySelector('#btn-auth-submit').click());
  await p.waitForTimeout(1200);
  const weak = await p.evaluate(() => {
    const e = document.querySelector('#auth-error');
    return { shown: e && !e.hidden, text: e ? e.textContent : '' };
  });
  check('weak password shows an inline reason', weak.shown && /commonly used/i.test(weak.text), weak.text);

  console.log('--- password reveal toggle ---');
  const revealed = await p.evaluate(() => {
    document.querySelector('#btn-reveal').click();
    const t = document.querySelector('#auth-password').type;
    document.querySelector('#btn-reveal').click();
    return { shown: t, back: document.querySelector('#auth-password').type };
  });
  check('reveal shows then re-hides the password',
    revealed.shown === 'text' && revealed.back === 'password', JSON.stringify(revealed));

  console.log('--- sign up succeeds ---');
  await p.fill('#auth-password', PASSWORD);
  await p.evaluate(() => document.querySelector('#btn-auth-submit').click());
  await p.waitForTimeout(2500);
  const afterSignup = await p.evaluate(() => ({
    signedIn: !!document.querySelector('.account-btn.signed-in'),
    label: document.querySelector('.account-label')?.textContent || '',
    body: document.body.innerText
  }));
  check('signed in right after signing up', afterSignup.signedIn);
  check('navbar shows the account', afterSignup.label.includes(EMAIL), afterSignup.label);
  check('told where the verification link went', /server console|terminal/i.test(afterSignup.body));
  await p.evaluate(() => document.querySelector('[data-close]')?.click());
  await p.waitForTimeout(400);
  await hideMap(p);
  await p.screenshot({ path: SP + '/auth-signed-in.png' });

  console.log('--- unverified is shown honestly ---');
  await p.evaluate(() => document.querySelector('#btn-account').click());
  await p.waitForTimeout(500);
  const menu = await p.evaluate(() => document.body.innerText);
  check('account menu marks the email unverified', /Not verified/i.test(menu));
  check('offers to change the password', /Change password/i.test(menu));

  console.log('--- sign out, then log back in ---');
  await p.evaluate(() => document.querySelector('#btn-signout').click());
  await p.waitForTimeout(1500);
  check('signed out', await p.evaluate(() => !!document.querySelector('.account-cta')));

  await p.evaluate(() => document.querySelector('#btn-account').click());
  await p.waitForTimeout(500);
  await p.fill('#auth-email', EMAIL);
  await p.fill('#auth-password', 'the-wrong-passphrase');
  await p.evaluate(() => document.querySelector('#btn-auth-submit').click());
  await p.waitForTimeout(1500);
  const bad = await p.evaluate(() => document.querySelector('#auth-error')?.textContent || '');
  check('wrong password is refused', /incorrect/i.test(bad), bad);
  check('error does not say which field was wrong', !/no such|not found|unknown/i.test(bad), bad);

  await p.fill('#auth-password', PASSWORD);
  await p.evaluate(() => document.querySelector('#btn-auth-submit').click());
  await p.waitForTimeout(2000);
  check('correct password logs back in',
    await p.evaluate(() => !!document.querySelector('.account-btn.signed-in')));

  console.log('--- session survives a new page ---');
  // A second page in the same context shares the cookie jar, which proves
  // session persistence without paying to re-initialise the WebGL globe.
  const p2 = await c.newPage();
  await p2.goto(require('./lib').URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p2.waitForSelector('.account-btn.signed-in', { timeout: 20000 }).catch(() => {});
  check('still logged in on a fresh page',
    await p2.evaluate(() => !!document.querySelector('.account-btn.signed-in')));
  check('HttpOnly cookie unreadable from JS',
    !(await p2.evaluate(() => document.cookie.includes('tf_session'))));
  await p2.close();

  console.log('--- magic link still works ---');
  await hideMap(p);
  await p.evaluate(() => document.querySelector('#btn-account').click());
  await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelector('#btn-signout').click());
  await p.waitForTimeout(1500);
  await p.evaluate(() => document.querySelector('#btn-account').click());
  await p.waitForTimeout(400);
  await p.fill('#auth-email', EMAIL);
  await p.evaluate(() => document.querySelector('#btn-magic-link').click());
  await p.waitForTimeout(1500);
  check('link dialog shown', /Check the server console|Check your inbox/i.test(
    await p.evaluate(() => document.body.innerText)));

  const link = execSync("grep -o 'http://localhost:8080/api/auth/verify?token=[A-Za-z0-9_-]*' /tmp/tfapi.log | tail -1")
    .toString().trim();
  // Fresh page: the verify route redirects to '/', which re-initialises the
  // WebGL globe, and reusing a long-lived page for that is slow under
  // software rendering. 'commit' returns as soon as the navigation starts.
  const p3 = await c.newPage();
  await p3.goto(link, { waitUntil: 'commit', timeout: 60000 });
  await p3.waitForSelector('.account-btn.signed-in', { timeout: 30000 }).catch(() => {});
  check('emailed link logs you in',
    await p3.evaluate(() => !!document.querySelector('.account-btn.signed-in')));
  await p3.close();

  const unexpected = errs(p).filter(e => !/status of (400|401|409)/.test(e));
  check('no unexpected page errors', unexpected.length === 0, unexpected.join(' | '));
  await b.close();
  summary();
})();
