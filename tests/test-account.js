// Account menu: download my data, and delete the account from the dialog.
const { chromium, ctx, page, errs, check, summary } = require('./lib');

const EMAIL = `acct-${Date.now()}@example.com`;
const PASSWORD = 'a-reasonably-long-passphrase';

const ready = p => p.waitForFunction(() => !!(window.travelFixApp && window.travelFixApp.planner), null, { timeout: 30000 })
  .then(() => true, () => false);
const settle = (p, ms = 1500) => p.waitForTimeout(ms);
const toast = p => p.evaluate(() => document.getElementById('travelfix-toast')?.textContent || '');

(async () => {
  const b = await chromium.launch();
  const c = await ctx(b, undefined, { acceptDownloads: true });
  const p = await page(c);
  check('app booted', await ready(p), errs(p).join(' | '));

  console.log('--- signed in with a saved plan ---');
  const signup = await p.evaluate(async ({ email, password }) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    await window.travelFixApp.account.refresh();
    return res.status;
  }, { email: EMAIL, password: PASSWORD });
  check('signed up', signup === 201, String(signup));
  await settle(p);
  await p.evaluate(() => window.travelFixApp.planner.renamePlan('Delete me later'));
  await settle(p);

  console.log('--- account menu ---');
  await p.evaluate(() => window.travelFixApp.account.openAccountMenu());
  await settle(p, 400);
  const menu = await p.evaluate(() => document.body.innerText);
  check('no longer claims plans are browser-only', !/still stored in this browser only/.test(menu));
  check('offers to download my data', !!(await p.$('#btn-export-data')));
  check('offers to delete the account', !!(await p.$('#btn-delete-account')));

  const [download] = await Promise.all([
    p.waitForEvent('download', { timeout: 15000 }).catch(() => null),
    p.click('#btn-export-data'),
  ]);
  check('the download starts', !!download);
  if (download) {
    check('as a dated .json file', /^travelfix-export-\d{4}-\d{2}-\d{2}\.json$/.test(download.suggestedFilename()),
      download.suggestedFilename());
    const fs = require('fs');
    const data = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
    check('it holds the account and its plan',
      data.account?.email === EMAIL && data.plans?.some(pl => pl.title === 'Delete me later'),
      JSON.stringify(data).slice(0, 200));
  }

  console.log('--- delete dialog ---');
  await p.click('#btn-delete-account');
  await settle(p, 400);
  const dialog = await p.evaluate(() => document.body.innerText);
  check('it says shared plans go for everyone', /including for anyone you shared them with/.test(dialog));
  check('the button is disabled until the address is typed',
    await p.evaluate(() => document.getElementById('btn-delete-submit').disabled));
  await p.fill('#delete-confirm', EMAIL.toUpperCase());
  check('typing the address enables it',
    !(await p.evaluate(() => document.getElementById('btn-delete-submit').disabled)));

  await p.fill('#delete-password', 'definitely-not-it');
  await p.click('#btn-delete-submit');
  await p.waitForFunction(() => !document.getElementById('delete-error').hidden, null, { timeout: 15000 }).catch(() => {});
  check('a wrong password is refused in the dialog',
    /not correct/.test(await p.evaluate(() => document.getElementById('delete-error').textContent)));
  check('and nothing was deleted',
    await p.evaluate(async () => !!(await (await fetch('/api/auth/me')).json()).user));

  await p.fill('#delete-password', PASSWORD);
  await p.click('#btn-delete-submit');
  await p.waitForFunction(() => window.travelFixApp.account.user === null, null, { timeout: 15000 }).catch(() => {});
  await settle(p);
  check('the user is told it is gone', /has been deleted/.test(await toast(p)), await toast(p));
  check('they are signed out', await p.evaluate(() => window.travelFixApp.account.user === null));
  check("the account's plan is gone from the planner",
    !(await p.evaluate(() => window.travelFixApp.planner.getAllPlans().map(pl => pl.title))).includes('Delete me later'));
  const login = await p.evaluate(async ({ email, password }) => (await fetch('/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
  })).status, { email: EMAIL, password: PASSWORD });
  check('the account no longer logs in', login === 401, String(login));
  check('no page errors', errs(p).filter(e => /PAGEERROR/.test(e)).length === 0, errs(p).join(' | '));

  await b.close();
  summary();
})();
