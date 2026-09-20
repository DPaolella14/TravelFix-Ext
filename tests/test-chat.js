const { chromium, ctx, page, hideMap, errs, check, summary, SP } = require('./lib');
(async()=>{
  const b=await chromium.launch(); const c=await ctx(b); const p=await page(c);
  await hideMap(p);
  await p.click('#tab-btn-chat'); await p.waitForTimeout(800);

  const st=await p.evaluate(()=>({
    collaborators: window.travelFixApp.chat.getCollaborators().length,
    messages: window.travelFixApp.chat.getMessages('group').length,
    dmChips: document.querySelectorAll('.dm-chip-btn').length,
    html: document.getElementById('docked-chat-messages').textContent
  }));
  check('no fabricated collaborators', st.collaborators===0, String(st.collaborators));
  check('no seeded messages', st.messages===0, String(st.messages));
  check('no DM chips for invented people', st.dmChips===0, String(st.dmChips));
  check('empty state says notes stay local', /stay in this browser/i.test(st.html), st.html.slice(0,100));
  const body=await p.evaluate(()=>document.body.innerText);
  check('Sarah/David/Elena gone from UI', !/Sarah Chen|David Kim|Elena Ramos/.test(body));
  await p.screenshot({path:SP+'/chat-empty.png'});

  console.log('--- sending still works, no fake replies ---');
  await p.fill('#docked-chat-input','Need to decide Tokyo vs Kyoto');
  await p.click('.btn-chat-send'); await p.waitForTimeout(4000);
  const after=await p.evaluate(()=>({n:window.travelFixApp.chat.getMessages('group').length,
    senders:window.travelFixApp.chat.getMessages('group').map(m=>m.sender.name)}));
  check('message saved', after.n===1, JSON.stringify(after));
  check('nobody replied', after.senders.every(x=>x==='You'), JSON.stringify(after.senders));

  console.log('--- invite is honest ---');
  await p.evaluate(()=>document.getElementById('btn-docked-invite').click());
  await p.waitForTimeout(700);
  const inv=await p.evaluate(()=>document.body.innerText);
  check('invite explains it needs a backend', /aren.t available yet/i.test(inv) && /BACKEND-SCOPE/.test(inv));
  check('no success claim', !/invited @|invite sent/i.test(inv));
  await p.screenshot({path:SP+'/chat-invite.png'});

  console.log('--- reaction toggles off ---');
  await p.evaluate(()=>{const m=window.travelFixApp.chat.getMessages('group')[0];
    window.travelFixApp.chat.toggleReaction('group',m.id,'❤️');
    window.travelFixApp.chat.toggleReaction('group',m.id,'❤️');});
  const react=await p.evaluate(()=>Object.keys(window.travelFixApp.chat.getMessages('group')[0].reactions||{}).length);
  check('reaction removed on second click', react===0, String(react));

  check('no page errors', errs(p).length===0, errs(p).join(' | '));
  await b.close(); summary();
})();
