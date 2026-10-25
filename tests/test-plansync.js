// Server-side plans: a plan made on one device is there on another, and
// signing out goes back to this browser's own plans.
//
// Each browser context is a separate device: its own cookies and its own
// localStorage, so the only way a plan can cross between them is the server.
const { chromium, ctx, page, errs, check, summary } = require('./lib');

const EMAIL = `sync-${Date.now()}@example.com`;
const PASSWORD = 'a-reasonably-long-passphrase';

// Two WebGL pages at once can take longer than page()'s fixed wait.
const app = p => p.waitForFunction(() => !!(window.travelFixApp && window.travelFixApp.planner), null, { timeout: 30000 })
  .then(() => true, () => false);
const titles = p => p.evaluate(() => window.travelFixApp.planner.getAllPlans().map(pl => pl.title));
const settle = p => p.waitForTimeout(1500);  // debounced push is 400 ms

async function auth(p, path, body) {
  return p.evaluate(async ({ path, body }) => {
    const res = await fetch(path, {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
    await window.travelFixApp.account.refresh();
    return res.status;
  }, { path, body });
}

(async () => {
  const b = await chromium.launch();

  console.log('--- device 1: plans made before signing up ---');
  const c1 = await ctx(b);
  const p1 = await page(c1);
  check('app booted on device 1', await app(p1), errs(p1).join(' | '));
  await p1.evaluate(() => window.travelFixApp.planner.renamePlan('Made before signing up'));
  const localBefore = await p1.evaluate(() => localStorage.getItem('travelfix_plans_library_v6'));
  check('signed out, plans save to localStorage', /Made before signing up/.test(localBefore || ''));

  console.log('--- device 1: sign up ---');
  const signup = await auth(p1, '/api/auth/signup', { email: EMAIL, password: PASSWORD });
  check('sign up succeeds', signup === 201, String(signup));
  await settle(p1);
  const server1 = await p1.evaluate(async () => (await (await fetch('/api/plans')).json()).plans.map(pl => pl.title));
  check('the existing plan was uploaded into the new account',
    server1.includes('Made before signing up'), JSON.stringify(server1));

  await p1.evaluate(() => window.travelFixApp.planner.createNewPlan('Lisbon in June'));
  await settle(p1);
  const server2 = await p1.evaluate(async () => (await (await fetch('/api/plans')).json()).plans.map(pl => pl.title));
  check('a plan created while signed in reaches the server',
    server2.includes('Lisbon in June'), JSON.stringify(server2));
  const activeId = await p1.evaluate(() => window.travelFixApp.planner.activePlanId);
  check('the new plan took its server id', /^\d+$/.test(activeId), activeId);
  const localAfter = await p1.evaluate(() => localStorage.getItem('travelfix_plans_library_v6'));
  check('signed in, account plans are not written to localStorage', !/Lisbon in June/.test(localAfter || ''));

  console.log('--- device 2: a different browser ---');
  const c2 = await ctx(b);
  const p2 = await page(c2);
  check('app booted on device 2', await app(p2), errs(p2).join(' | '));
  check('device 2 starts without the plan', !(await titles(p2)).includes('Lisbon in June'));
  const login = await auth(p2, '/api/auth/login', { email: EMAIL, password: PASSWORD });
  check('log in on device 2', login === 200, String(login));
  await settle(p2);
  const t2 = await titles(p2);
  check('device 2 sees both plans', t2.includes('Lisbon in June') && t2.includes('Made before signing up'), JSON.stringify(t2));
  const shownInPanel = await p2.evaluate(() => (document.body.textContent || '').includes('Lisbon in June'));
  check('the planner panel re-rendered with the server plans', shownInPanel);

  console.log('--- edits go both ways ---');
  await p2.evaluate(() => {
    const planner = window.travelFixApp.planner;
    const lisbon = planner.getAllPlans().find(pl => pl.title === 'Lisbon in June');
    planner.switchPlan(lisbon.id);
    planner.renamePlan('Lisbon and Porto');
  });
  await settle(p2);
  await p1.reload({ waitUntil: 'load' });
  await app(p1);
  await settle(p1);
  const t1 = await titles(p1);
  check('device 1 sees the rename after a reload', t1.includes('Lisbon and Porto'), JSON.stringify(t1));

  await p1.evaluate(() => {
    const planner = window.travelFixApp.planner;
    planner.deletePlan(planner.getAllPlans().find(pl => pl.title === 'Made before signing up').id);
  });
  await settle(p1);
  const server3 = await p1.evaluate(async () => (await (await fetch('/api/plans')).json()).plans.map(pl => pl.title));
  check('deleting on device 1 deletes on the server', !server3.includes('Made before signing up'), JSON.stringify(server3));

  console.log('--- sign out ---');
  await auth(p2, '/api/auth/logout');
  await settle(p2);
  const t3 = await titles(p2);
  check('signed out, the account plans are gone from the planner', !t3.includes('Lisbon and Porto'), JSON.stringify(t3));

  check('no page errors on device 1', errs(p1).filter(e => /PAGEERROR/.test(e)).length === 0, errs(p1).join(' | '));
  check('no page errors on device 2', errs(p2).filter(e => /PAGEERROR/.test(e)).length === 0, errs(p2).join(' | '));

  await b.close();
  summary();
})();
