const { chromium, ctx, page, hideMap, errs, check, summary, SP } = require('./lib');

(async () => {
  const b = await chromium.launch();
  const c = await ctx(b);
  const p = await page(c);

  console.log('--- ocean panel ---');
  // Open the ocean panel the way a map click on open water would.
  await p.evaluate(() => window.travelFixApp.ui.showOceanPanel(-30.5, -140.2));
  await p.waitForTimeout(600);
  await hideMap(p);

  const rendered = await p.evaluate(() => document.querySelectorAll('.ocean-quick-pick').length);
  check('ocean panel rendered with quick picks', rendered === 4, `found ${rendered}`);
  await p.screenshot({ path: SP + '/fix4-ocean.png' });

  // catalogued pick
  await p.evaluate(() => document.querySelector('.ocean-quick-pick[data-dest="bali"]').click());
  await p.waitForTimeout(1500);
  const bali = await p.evaluate(() => window.travelFixApp.activeDestination?.name || null);
  check('Bali quick pick selects a destination', /bali/i.test(bali || ''), String(bali));
  check('no errors on catalogued pick', errs(p).length === 0, errs(p).join(' | '));

  // un-catalogued pick must fall back to search, not throw
  await p.evaluate(() => window.travelFixApp.ui.showOceanPanel(-30.5, -140.2));
  await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('.ocean-quick-pick[data-dest="cape-town"]').click());
  await p.waitForTimeout(1500);
  const searchVal = await p.evaluate(() => document.getElementById('search-input').value);
  check('Cape Town falls back to search', searchVal === 'Cape Town', `search box = "${searchVal}"`);
  check('no errors on un-catalogued pick', errs(p).length === 0, errs(p).join(' | '));

  // Close Explorer button
  await p.evaluate(() => window.travelFixApp.ui.showOceanPanel(-30.5, -140.2));
  await p.waitForTimeout(600);
  await p.evaluate(() => document.getElementById('btn-ocean-close').click());
  await p.waitForTimeout(600);
  const collapsed = await p.evaluate(() => document.getElementById('main-workspace').classList.contains('panel-collapsed'));
  check('Close Explorer collapses the panel', collapsed === true);
  check('no errors on close', errs(p).length === 0, errs(p).join(' | '));

  await b.close();
  summary();
})();
