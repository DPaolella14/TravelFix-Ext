// Data integrity + budget arithmetic.
// The showcase plans these once relied on were removed, so this now builds a
// plan through the public API instead of asserting on seeded data.
const { chromium, ctx, page, hideMap, errs, check, summary, SP } = require('./lib');

(async () => {
  const b = await chromium.launch();
  const c = await ctx(b);
  const p = await page(c);

  console.log('--- catalogue integrity ---');
  const cat = await p.evaluate(() => {
    const dests = window.travelFixApp.ui.destinations;
    const ids = [];
    dests.forEach(d => {
      ids.push(d.id);
      (d.livingSpaces || []).forEach(s => ids.push(s.id));
      (d.activities || []).forEach(a => ids.push(a.id));
    });
    const seen = {};
    ids.forEach(i => { seen[i] = (seen[i] || 0) + 1; });
    const tokyo = dests.filter(d => d.id === 'tokyo');
    return {
      dups: Object.entries(seen).filter(([, v]) => v > 1).map(([k]) => k),
      tokyoCount: tokyo.length,
      tokyoStays: tokyo[0] ? tokyo[0].livingSpaces.map(s => s.id) : [],
      tokyoActs: tokyo[0] ? tokyo[0].activities.map(a => a.id) : []
    };
  });
  check('no duplicate ids anywhere in the catalogue', cat.dups.length === 0, cat.dups.join(', '));
  check('exactly one Tokyo', cat.tokyoCount === 1, String(cat.tokyoCount));
  check('Tokyo kept both stays', cat.tokyoStays.length === 2, cat.tokyoStays.join(', '));
  check('Tokyo kept all three activities', cat.tokyoActs.length === 3, cat.tokyoActs.join(', '));

  console.log('--- budget arithmetic ---');
  const budget = await p.evaluate(() => {
    const app = window.travelFixApp;
    const tokyo = app.ui.destinations.find(d => d.id === 'tokyo');
    const pl = app.planner;
    pl.clearPlan();
    // Two nights at the same hotel, two activities on different dates.
    const d0 = new Date(); d0.setDate(d0.getDate() + 30);
    const pad = n => String(n).padStart(2, '0');
    const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const day1 = iso(d0);
    const d1 = new Date(d0); d1.setDate(d1.getDate() + 1);
    const day2 = iso(d1);
    pl.setStayRange(day1, 2, tokyo.livingSpaces[0].id, null, tokyo);
    pl.addActivityToDay(day1, tokyo.activities[0].id, null, tokyo);
    pl.addActivityToDay(day2, tokyo.activities[1].id, null, tokyo);
    return {
      actual: pl.calculateBudget(),
      expectedStays: tokyo.livingSpaces[0].pricePerNight * 2,
      expectedActs: tokyo.activities[0].price + tokyo.activities[1].price,
      scheduled: pl.getScheduledDays().length
    };
  });
  check('stays summed across days', budget.actual.livingSpacesCost === budget.expectedStays,
    `${budget.actual.livingSpacesCost} vs ${budget.expectedStays}`);
  check('activities summed across days', budget.actual.activitiesCost === budget.expectedActs,
    `${budget.actual.activitiesCost} vs ${budget.expectedActs}`);
  check('total adds up', budget.actual.total === budget.expectedStays + budget.expectedActs,
    `${budget.actual.total}`);
  check('two dates counted as scheduled', budget.scheduled === 2, String(budget.scheduled));

  console.log('--- a cleared plan costs nothing ---');
  const cleared = await p.evaluate(() => {
    window.travelFixApp.planner.clearPlan();
    return {
      total: window.travelFixApp.planner.calculateBudget().total,
      days: window.travelFixApp.planner.getDays().length,
      scheduled: window.travelFixApp.planner.getScheduledDays().length
    };
  });
  check('cleared plan totals zero', cleared.total === 0, String(cleared.total));
  check('clearing removes every date', cleared.days === 0, String(cleared.days));
  check('nothing marked scheduled', cleared.scheduled === 0, String(cleared.scheduled));

  check('no page errors', errs(p).length === 0, errs(p).join(' | '));
  await hideMap(p);
  await p.waitForTimeout(400);
  await p.screenshot({ path: SP + '/plan.png' });
  await b.close();
  summary();
})();
