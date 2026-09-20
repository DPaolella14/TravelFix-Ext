const { chromium, ctx, page, hideMap, errs, check, summary, SP } = require('./lib');
(async()=>{
  const b=await chromium.launch(); const c=await ctx(b); const p=await page(c);
  await hideMap(p);
  console.log('--- default plan ---');
  const st=await p.evaluate(()=>{
    const pl=window.travelFixApp.planner;
    return {days:pl.getDays().map(d=>d.dayName), plans:pl.getAllPlans().length, title:pl.plan.title,
            budget:pl.calculateBudget().total, scheduled:pl.getScheduledDays().length};
  });
  console.log(JSON.stringify(st));
  check('7 days Mon-Sun', st.days.join(',')==='Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday', st.days.join(','));
  check('single blank plan', st.plans===1 && st.title==='My Travel Plan', `${st.plans} / ${st.title}`);
  check('nothing scheduled', st.scheduled===0 && st.budget===0);
  const showcase=await p.evaluate(()=>document.body.innerHTML);
  check('no showcase templates in DOM', !/Showcase Templates|NYC &|Machu Picchu &/.test(showcase));
  await p.screenshot({path:SP+'/sched-1-empty.png'});

  console.log('--- schedule dialog ---');
  await p.evaluate(()=>{
    const d=window.travelFixApp.ui.destinations.find(x=>x.id==='tokyo');
    window.travelFixApp.ui.promptAddActivityToDay(d.activities[0], d);
  });
  await p.waitForTimeout(600);
  const dlg=await p.evaluate(()=>({
    dayChips:document.querySelectorAll('.day-chip').length,
    slotChips:document.querySelectorAll('.slot-chip').length,
    activeSlot:document.querySelector('.slot-chip.active .slot-chip-name')?.textContent||''
  }));
  check('7 day chips offered', dlg.dayChips===7, String(dlg.dayChips));
  check('4 presets + custom', dlg.slotChips===5, String(dlg.slotChips));
  await p.screenshot({path:SP+'/sched-2-dialog.png'});

  // choose Thursday + Evening
  await p.evaluate(()=>{ document.querySelector('.day-chip[data-day-index="3"]').click();
                         document.querySelector('.slot-chip[data-slot-id="evening"]').click();
                         document.querySelector('.btn-sched-confirm').click(); });
  await p.waitForTimeout(900);
  const after=await p.evaluate(()=>{
    const d=window.travelFixApp.planner.getDays();
    return {thu:d[3].activities.map(a=>({id:a.activityId,slot:a.slot.label,start:a.slot.start})), mon:d[0].activities.length};
  });
  check('landed on Thursday, not Monday', after.thu.length===1 && after.mon===0, JSON.stringify(after));
  check('time slot recorded', after.thu[0] && after.thu[0].slot==='Evening' && after.thu[0].start==='17:00', JSON.stringify(after.thu));

  console.log('--- reschedule ---');
  await p.evaluate(()=>document.querySelector('.btn-reschedule[data-kind="activity"]').click());
  await p.waitForTimeout(700);
  const hasRemove=await p.evaluate(()=>!!document.querySelector('.btn-sched-remove'));
  check('reschedule dialog offers Remove', hasRemove);
  await p.evaluate(()=>{ document.querySelector('.day-chip[data-day-index="6"]').click();
                         document.querySelector('.slot-chip[data-slot-id="morning"]').click();
                         document.querySelector('.btn-sched-confirm').click(); });
  await p.waitForTimeout(900);
  const moved=await p.evaluate(()=>{const d=window.travelFixApp.planner.getDays();
    return {thu:d[3].activities.length, sun:d[6].activities.map(a=>a.slot.label)};});
  check('moved Thursday -> Sunday', moved.thu===0 && moved.sun[0]==='Morning', JSON.stringify(moved));

  console.log('--- stay with check-in time ---');
  await p.evaluate(()=>{
    const d=window.travelFixApp.ui.destinations.find(x=>x.id==='tokyo');
    window.travelFixApp.ui.promptAssignStayToDay(d.livingSpaces[0], d);
  });
  await p.waitForTimeout(600);
  await p.evaluate(()=>{ document.querySelector('.day-chip[data-day-index="2"]').click();
                         document.querySelector('.btn-sched-confirm').click(); });
  await p.waitForTimeout(900);
  const stay=await p.evaluate(()=>{const d=window.travelFixApp.planner.getDays()[2];
    return {stay:!!d.stay, slot:d.stay&&d.stay.slot.start, budget:window.travelFixApp.planner.calculateBudget().total};});
  check('stay assigned to Wednesday with check-in', stay.stay && stay.slot==='15:00', JSON.stringify(stay));
  check('budget reflects the stay', stay.budget>0, String(stay.budget));
  await p.screenshot({path:SP+'/sched-3-planned.png'});
  check('no page errors', errs(p).length===0, errs(p).join(' | '));
  await b.close(); summary();
})();
