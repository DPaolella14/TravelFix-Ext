// Regression smoke test: make sure the escaping pass did not break normal rendering.
const { chromium, ctx, page, hideMap, showMap, errs, check, summary, SP } = require('./lib');

(async () => {
  const b = await chromium.launch();
  const c = await ctx(b);
  const p = await page(c);

  console.log('--- normal rendering still intact ---');
  await hideMap(p);

  // planner
  const planner = await p.evaluate(() => {
    const el = document.getElementById('docked-planner-body');
    return { title: el.querySelector('.docked-title')?.textContent || '', rows: el.querySelectorAll('.timeline-day-card').length, html: el.innerHTML.length };
  });
  check('plan title renders', planner.title.includes('My Travel Plan') && !planner.title.includes('&amp;'), planner.title);
  check('all seven day cards render', planner.rows === 7, `rows=${planner.rows}`);

  // explorer with a real destination containing an ampersand
  await p.evaluate(() => {
    const d = window.travelFixApp.ui.destinations.find(x => x.id === 'tokyo');
    window.travelFixApp.ui.renderExplorer(d);
  });
  await p.waitForTimeout(600);
  const exp = await p.evaluate(() => {
    const el = document.getElementById('docked-explorer-body');
    return {
      title: el.querySelector('.explorer-hero-title')?.textContent || '',
      stays: el.querySelectorAll('.card-title').length,
      heroBg: el.querySelector('.explorer-hero')?.getAttribute('style') || '',
      imgs: [...el.querySelectorAll('img.card-media')].map(i => i.getAttribute('src')).filter(Boolean).length,
      amp: el.innerHTML.includes('&amp;amp;')
    };
  });
  check('explorer hero title correct', exp.title === 'Tokyo', exp.title);
  check('stay + activity cards render', exp.stays >= 5, `cards=${exp.stays}`);
  check('hero background url survived safeUrl', /unsplash/.test(exp.heroBg), exp.heroBg.slice(0, 90));
  check('card images survived safeUrl', exp.imgs >= 5, `imgs=${exp.imgs}`);
  check('no double-escaped ampersands', exp.amp === false);
  await p.screenshot({ path: SP + '/final-explorer.png' });

  // chat renders the seeded conversation
  await p.click('#tab-btn-chat');
  await p.waitForTimeout(700);
  const chatEmpty = await p.evaluate(() => !!document.querySelector('#docked-chat-messages .chat-empty-state'));
  check('chat shows its empty state', chatEmpty);

  // map popups still build
  await showMap(p);
  await p.waitForTimeout(800);
  const popupOk = await p.evaluate(() => {
    const d = window.travelFixApp.ui.destinations.find(x => x.id === 'tokyo');
    window.travelFixApp.regionalMap.focusDestination(d);
    return true;
  });
  await p.waitForTimeout(2500);
  const markers = await p.evaluate(() => document.querySelectorAll('.leaflet-marker-icon').length);
  check('map markers render after focus', markers > 0, `markers=${markers}`);

  // globe builds without error
  await p.click('#nav-mode-globe');
  await p.waitForTimeout(3000);
  const globeOk = await p.evaluate(() => !!(window.travelFixApp.globe && window.travelFixApp.globe.scene));
  check('3D globe initialises', globeOk);

  check('no page errors across the whole run', errs(p).length === 0, errs(p).join(' | '));
  await b.close();
  summary();
})();
