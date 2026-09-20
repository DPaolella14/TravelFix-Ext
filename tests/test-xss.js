const { chromium, ctx, page, hideMap, errs, check, summary, SP } = require('./lib');

const PAYLOAD = '<svg onload="window.__XSS=1"></svg>';
const IMGPAY = '"><svg onload="window.__XSS=1"></svg>';

(async () => {
  const b = await chromium.launch();
  const c = await ctx(b);
  const p = await page(c);
  await hideMap(p);

  console.log('--- 1. chat message (stored XSS) ---');
  await p.click('#tab-btn-chat');
  await p.waitForTimeout(600);
  await p.fill('#docked-chat-input', 'look ' + PAYLOAD + ' here');
  await p.click('.btn-chat-send');
  await p.waitForTimeout(1500);
  check('live chat message does not execute', !(await p.evaluate(() => !!window.__XSS)));
  const shown = await p.evaluate(() => document.querySelector('#docked-chat-messages .chat-message-row:last-child .msg-bubble, #docked-chat-messages .msg-bubble:last-of-type')?.textContent || '');
  check('payload displayed as literal text', shown.includes('<svg'), shown.slice(0, 80));

  console.log('--- 2. reload: persisted message re-render ---');
  await p.reload({ waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(3000);
  await hideMap(p);
  await p.click('#tab-btn-chat');
  await p.waitForTimeout(1000);
  check('stored chat message does not execute on reload', !(await p.evaluate(() => !!window.__XSS)));

  console.log('--- 3. hostile collaborator injected into state ---');
  await p.evaluate((pay) => {
    const chat = window.travelFixApp.chat;
    chat.state.collaborators.push({ username: 'evil' + pay, name: pay, avatar: pay, role: pay, status: 'online' });
    chat.state.messages.group.push({
      id: 'evil' + pay, sender: { username: 'evil', name: pay, avatar: pay, role: pay },
      text: pay, timestamp: pay, reactions: { [pay]: 1 }
    });
    window.travelFixApp.ui.renderChat();
  }, PAYLOAD);
  await p.waitForTimeout(800);
  check('hostile sender name / avatar / role do not execute', !(await p.evaluate(() => !!window.__XSS)));

  console.log('--- 4. hostile geocoder result in search dropdown ---');
  await p.evaluate((pay) => {
    window.travelFixApp.ui.renderSearchResults([
      { id: 'x', name: pay, country: pay, type: pay, image: 'javascript:alert(1)', lat: 0, lng: 0 },
      { id: 'y', name: 'ok', country: 'ok', type: 'ok', image: 'https://x/a.png" onerror="window.__XSS=1', lat: 0, lng: 0 }
    ]);
  }, IMGPAY);
  await p.waitForTimeout(800);
  check('hostile place name does not execute', !(await p.evaluate(() => !!window.__XSS)));
  const src = await p.evaluate(() => [...document.querySelectorAll('#search-dropdown img')].map(i => i.getAttribute('src')));
  check('javascript: image url rejected', !src.some(s => (s || '').startsWith('javascript:')), JSON.stringify(src));

  console.log('--- 5. hostile destination in explorer + booking ---');
  await p.evaluate((pay) => {
    const dest = {
      id: 'evil', name: pay, country: pay, tagline: pay, description: pay,
      image: "x');background:url('javascript:alert(1)", lat: 0, lng: 0,
      livingSpaces: [{ id: 's1', name: pay, type: pay, description: pay, address: pay,
        pricePerNight: 100, rating: 4.9, reviews: 10, image: pay, tags: [], amenities: [] }],
      activities: [{ id: 'a1', title: pay, category: pay, timeSlot: pay, price: 50,
        rating: 4.9, reviews: 10, duration: '2h', image: pay, tags: [], highlights: [] }]
    };
    window.travelFixApp.ui.renderExplorer(dest);
    window.travelFixApp.ui.openBookingModal(dest.livingSpaces[0], dest);
  }, PAYLOAD);
  await p.waitForTimeout(1000);
  check('hostile destination/stay/activity do not execute', !(await p.evaluate(() => !!window.__XSS)));

  console.log('--- 6. hostile plan title ---');
  await p.evaluate((pay) => {
    window.travelFixApp.planner.plan.title = pay;
    window.travelFixApp.ui.renderPlanner();
  }, PAYLOAD);
  await p.waitForTimeout(600);
  check('hostile plan title does not execute', !(await p.evaluate(() => !!window.__XSS)));

  console.log('--- 7. hostile map popup label ---');
  await p.evaluate((pay) => {
    const m = document.getElementById('map-view-wrapper'); if (m) m.style.display = '';
    window.travelFixApp.regionalMap.showClickedLocationPin(10, 10, pay);
  }, PAYLOAD);
  await p.waitForTimeout(1000);
  check('hostile map pin label does not execute', !(await p.evaluate(() => !!window.__XSS)));

  check('no unexpected page errors', errs(p).length === 0, errs(p).join(' | '));
  await hideMap(p);
  await p.waitForTimeout(400);
  await p.screenshot({ path: SP + '/fix3-xss.png' });
  await b.close();
  summary();
})();
