const { chromium, ctx, page, hideMap, errs, check, summary, SP } = require('./lib');

(async () => {
  const b = await chromium.launch();
  const c = await ctx(b);
  const p = await page(c);

  console.log('--- Trip Chat send ---');
  await hideMap(p);
  await p.click('#tab-btn-chat');
  await p.waitForTimeout(800);

  const before = await p.evaluate(() => document.querySelectorAll('#docked-chat-messages .chat-message-row').length);

  await p.fill('#docked-chat-input', 'What time is the Shibuya Sky sunset booking?');
  await p.click('.btn-chat-send');
  await p.waitForTimeout(1200);

  const afterSend = await p.evaluate(() => ({
    rows: document.querySelectorAll('#docked-chat-messages .chat-message-row').length,
    inputValue: document.getElementById('docked-chat-input').value,
    lastText: document.querySelector('#docked-chat-messages .chat-message-row:last-child .msg-bubble')?.textContent?.trim() || ''
  }));

  check('no page errors on send', errs(p).length === 0, errs(p).join(' | '));
  check('message row added', afterSend.rows === before + 1, `before=${before} after=${afterSend.rows}`);
  check('input cleared after send', afterSend.inputValue === '', `got "${afterSend.inputValue}"`);
  check('sent text rendered', afterSend.lastText.includes('Shibuya Sky'), afterSend.lastText);

  // simulated reply arrives ~2s later and must render without a manual tab switch
  await p.waitForTimeout(4000);
  const afterReply = await p.evaluate(() => document.querySelectorAll('#docked-chat-messages .chat-message-row').length);
  check('auto-reply rendered live', afterReply > afterSend.rows, `rows=${afterReply}`);
  check('still no page errors', errs(p).length === 0, errs(p).join(' | '));

  await p.screenshot({ path: SP + '/fix1-chat.png' });

  // A broken UI subscriber must not break message delivery any more.
  console.log('--- subscriber isolation ---');
  await p.evaluate(() => { window.travelFixApp.chat.onMessageReceived = () => { throw new Error('boom'); }; });
  const delivered = await p.evaluate(() => {
    const n = window.travelFixApp.chat.getMessages('group').length;
    window.travelFixApp.chat.sendMessage('probe');
    return window.travelFixApp.chat.getMessages('group').length > n;
  });
  check('message still delivered when a handler throws', delivered);

  await b.close();
  summary();
})();
