const { chromium, ctx, page, hideMap, errs, check, summary, SP } = require('./lib');

(async () => {
  const b = await chromium.launch();
  const c = await ctx(b);
  const p = await page(c);

  console.log('--- showcase itinerary resolves ---');
  const itin = await p.evaluate(() => window.travelFixApp.planner.resolveItinerary().map(d => ({
    day: d.dayName, dest: d.destination?.name || null,
    stay: d.livingSpace?.name || null, stayPrice: d.livingSpace?.pricePerNight || 0,
    acts: d.activities.map(a => a.price)
  })));
  const budget = await p.evaluate(() => window.travelFixApp.planner.calculateBudget());
  console.log(JSON.stringify(itin, null, 1));
  console.log('budget:', JSON.stringify(budget));

  const thu = itin.find(d => d.day === 'Thursday');
  const fri = itin.find(d => d.day === 'Friday');
  check('Thursday is Tokyo', thu.dest === 'Tokyo', thu.dest);
  check('Thursday has a hotel', !!thu.stay, String(thu.stay));
  check('Friday has a hotel', !!fri.stay, String(fri.stay));
  check('Friday has activities', fri.acts.length === 2, JSON.stringify(fri.acts));

  const expectedStays = 980 + 980 + 0 + 1350 + 1350;
  const expectedActs = 320 + 260 + 110 + 195;
  check('stays total correct', budget.livingSpacesCost === expectedStays, `${budget.livingSpacesCost} vs ${expectedStays}`);
  check('activities total correct', budget.activitiesCost === expectedActs, `${budget.activitiesCost} vs ${expectedActs}`);
  check('grand total correct', budget.total === expectedStays + expectedActs + 1100, `${budget.total} vs ${expectedStays + expectedActs + 1100}`);
  check('no page errors', errs(p).length === 0, errs(p).join(' | '));

  await hideMap(p);
  await p.waitForTimeout(500);
  await p.screenshot({ path: SP + '/fix2-planner.png' });
  await b.close();
  summary();
})();
