const { chromium, ctx, page, hideMap, errs, check, summary, SP } = require('./lib');
(async()=>{
  const b=await chromium.launch(); const c=await ctx(b); const p=await page(c);
  await hideMap(p);
  console.log('--- default plan ---');
  const st=await p.evaluate(()=>{
    const pl=window.travelFixApp.planner;
    return {days:pl.getDays().length, plans:pl.getAllPlans().length, title:pl.plan.title,
            budget:pl.calculateBudget().total, scheduled:pl.getScheduledDays().length,
            range: pl.getTripRange()};
  });
  console.log(JSON.stringify(st));
  check('starts with no dates at all', st.days===0, String(st.days));
  check('no trip range until something is booked', st.range===null, JSON.stringify(st.range));
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
    calendar:!!document.querySelector('.tf-calendar'),
    slotChips:document.querySelectorAll('.slot-chip').length,
    activeSlot:document.querySelector('.slot-chip.active .slot-chip-name')?.textContent||''
  }));
  check('calendar offered', dlg.calendar);
  check('4 presets + custom', dlg.slotChips===5, String(dlg.slotChips));
  await p.screenshot({path:SP+'/sched-2-dialog.png'});

  // pick a specific date ten days out, plus an Evening slot
  const pick = await p.evaluate(()=>{
    const cells=[...document.querySelectorAll('.cal-day:not([disabled])')];
    const target=cells[Math.min(10, cells.length-1)];
    target.click();
    document.querySelector('.slot-chip[data-slot-id="evening"]').click();
    const d=target.dataset.date;
    document.querySelector('.btn-sched-confirm').click();
    return d;
  });
  await p.waitForTimeout(900);
  const after=await p.evaluate(()=>{
    const d=window.travelFixApp.planner.getDays();
    return {count:d.length, date:d[0]&&d[0].date,
            acts:d[0]?d[0].activities.map(a=>({slot:a.slot.label,start:a.slot.start})):[]};
  });
  check('one date created, the one chosen', after.count===1 && after.date===pick, `${after.date} vs ${pick}`);
  check('time slot recorded', after.acts[0] && after.acts[0].slot==='Evening' && after.acts[0].start==='17:00', JSON.stringify(after.acts));

  console.log('--- reschedule ---');
  await p.evaluate(()=>document.querySelector('.btn-reschedule[data-kind="activity"]').click());
  await p.waitForTimeout(700);
  const hasRemove=await p.evaluate(()=>!!document.querySelector('.btn-sched-remove'));
  check('reschedule dialog offers Remove', hasRemove);
  const moveTo = await p.evaluate(()=>{
    const cells=[...document.querySelectorAll('.cal-day:not([disabled])')];
    const target=cells[Math.min(25, cells.length-1)];
    target.click();
    document.querySelector('.slot-chip[data-slot-id="morning"]').click();
    const d=target.dataset.date;
    document.querySelector('.btn-sched-confirm').click();
    return d;
  });
  await p.waitForTimeout(900);
  const moved=await p.evaluate(()=>{const d=window.travelFixApp.planner.getDays();
    return {count:d.length, date:d[0]&&d[0].date, slot:d[0]&&d[0].activities[0].slot.label};});
  check('moved to the new date, old one cleaned up', moved.count===1 && moved.date===moveTo,
        `${moved.date} vs ${moveTo} (count ${moved.count})`);
  check('retimed to Morning', moved.slot==='Morning', String(moved.slot));

  console.log('--- stay with check-in time ---');
  await p.evaluate(()=>{
    const d=window.travelFixApp.ui.destinations.find(x=>x.id==='tokyo');
    window.travelFixApp.ui.promptAssignStayToDay(d.livingSpaces[0], d);
  });
  await p.waitForTimeout(600);
  const stayDate = await p.evaluate(()=>{
    const cells=[...document.querySelectorAll('.cal-day:not([disabled])')];
    const target=cells[Math.min(5, cells.length-1)];
    target.click();
    const d=target.dataset.date;
    document.querySelector('.btn-sched-confirm').click();
    return d;
  });
  await p.waitForTimeout(900);
  const stay=await p.evaluate((d)=>{const day=window.travelFixApp.planner.getDay(d);
    return {stay:!!(day&&day.stay), slot:day&&day.stay&&day.stay.slot.start,
            budget:window.travelFixApp.planner.calculateBudget().total};}, stayDate);
  check('stay assigned to the chosen date with a check-in time', stay.stay && stay.slot==='15:00', JSON.stringify(stay));
  check('budget reflects the stay', stay.budget>0, String(stay.budget));
  await p.screenshot({path:SP+'/sched-3-planned.png'});
  check('no page errors', errs(p).length===0, errs(p).join(' | '));
  await b.close(); summary();
})();
