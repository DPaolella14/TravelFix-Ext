// Booking on real calendar dates, up to two years out.
const { chromium, ctx, page, hideMap, errs, check, summary, SP } = require('./lib');

const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

(async () => {
  const b = await chromium.launch();
  const c = await ctx(b);
  const p = await page(c);
  await hideMap(p);

  const openStay = () => p.evaluate(() => {
    const d = window.travelFixApp.ui.destinations.find(x => x.id === 'tokyo');
    window.travelFixApp.ui.openBookingModal(d.livingSpaces[0], d);
  });
  const openActivity = () => p.evaluate(() => {
    const d = window.travelFixApp.ui.destinations.find(x => x.id === 'tokyo');
    window.travelFixApp.ui.promptAddActivityToDay(d.activities[0], d);
  });
  const closeDialog = () => p.evaluate(() => document.querySelector('.tf-schedule-overlay')?.remove());

  console.log('--- calendar replaces the seven-day strip ---');
  await openStay();
  await p.waitForTimeout(600);
  const cal = await p.evaluate(() => ({
    hasCalendar: !!document.querySelector('.tf-calendar'),
    oldChips: document.querySelectorAll('.day-chip').length,
    cells: document.querySelectorAll('.cal-day').length,
    weekdays: [...document.querySelectorAll('.cal-weekdays span')].map(s => s.textContent),
    months: document.querySelectorAll('.cal-jump option').length,
    selected: document.querySelector('.cal-day.cal-selected')?.dataset.date
  }));
  check('calendar is present', cal.hasCalendar);
  check('old 7-day chips are gone', cal.oldChips === 0, String(cal.oldChips));
  check('grid is a full 6 weeks', cal.cells === 42, String(cal.cells));
  check('week starts Monday', cal.weekdays.join('') === 'MoTuWeThFrSaSu', cal.weekdays.join(''));
  check('roughly 25 months selectable', cal.months >= 24 && cal.months <= 26, String(cal.months));
  check('opens on today', cal.selected === iso(new Date()), `${cal.selected} vs ${iso(new Date())}`);
  await p.screenshot({ path: SP + '/calendar-stay.png' });

  console.log('--- dialog fits the window ---');
  const fit = await p.evaluate(() => {
    const el = document.querySelector('.schedule-dialog');
    const r = el.getBoundingClientRect();
    const buttons = el.querySelector('.quick-modal-buttons').getBoundingClientRect();
    return {
      topVisible: r.top >= 0,
      withinHeight: r.height <= window.innerHeight,
      scrolls: el.scrollHeight > el.clientHeight,
      buttonsVisible: buttons.bottom <= window.innerHeight + 1
    };
  });
  check('dialog top is not cut off', fit.topVisible, JSON.stringify(fit));
  check('dialog fits the viewport height', fit.withinHeight, JSON.stringify(fit));
  check('confirm row stays reachable', fit.buttonsVisible, JSON.stringify(fit));

  console.log('--- past dates refused, future reachable ---');
  const bounds = await p.evaluate(() => {
    const days = [...document.querySelectorAll('.cal-day')];
    const today = document.querySelector('.cal-day.cal-today');
    const idx = days.indexOf(today);
    return {
      beforeTodayDisabled: idx > 0 ? days[idx - 1].disabled : true,
      todayEnabled: !today.disabled
    };
  });
  check('yesterday is disabled', bounds.beforeTodayDisabled);
  check('today is selectable', bounds.todayEnabled);

  console.log('--- navigate a year ahead and book ---');
  const target = new Date();
  target.setFullYear(target.getFullYear() + 1);
  target.setMonth(5); // June next year
  target.setDate(15);
  const targetISO = iso(target);
  const jumpValue = `${target.getFullYear()}-${pad(target.getMonth() + 1)}`;

  const jumped = await p.evaluate((v) => {
    const sel = document.querySelector('.cal-jump');
    const has = [...sel.options].some(o => o.value === v);
    if (!has) return { has };
    sel.value = v;
    sel.dispatchEvent(new Event('change'));
    return { has, label: sel.options[sel.selectedIndex].textContent };
  }, jumpValue);
  check('can jump a year ahead', jumped.has, jumpValue);

  const picked = await p.evaluate((d) => {
    const cell = document.querySelector(`.cal-day[data-date="${d}"]`);
    if (!cell || cell.disabled) return null;
    cell.click();
    return document.querySelector('.cal-day.cal-selected')?.dataset.date;
  }, targetISO);
  check('can select a date a year out', picked === targetISO, `${picked} vs ${targetISO}`);

  // three nights from there
  await p.evaluate(() => {
    document.querySelector('.nights-step[data-step="1"]').click();
    document.querySelector('.nights-step[data-step="1"]').click();
    document.querySelector('.btn-sched-confirm').click();
  });
  await p.waitForTimeout(1000);

  const booked = await p.evaluate(() => window.travelFixApp.planner.getDays().map(d => d.date));
  const expected = [0, 1, 2].map(n => {
    const d = new Date(target.getFullYear(), target.getMonth(), target.getDate() + n);
    return iso(d);
  });
  check('three consecutive dates booked', booked.join(',') === expected.join(','),
    `${booked.join(',')} vs ${expected.join(',')}`);
  await p.screenshot({ path: SP + '/calendar-booked.png' });

  console.log('--- stay spanning a month boundary ---');
  await p.evaluate(() => window.travelFixApp.planner.clearPlan());
  const endOfMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0); // last day of that month
  const eomISO = iso(endOfMonth);
  await openStay();
  await p.waitForTimeout(600);
  await p.evaluate((v) => {
    const sel = document.querySelector('.cal-jump');
    sel.value = v; sel.dispatchEvent(new Event('change'));
  }, jumpValue);
  await p.evaluate((d) => {
    const cell = document.querySelector(`.cal-day[data-date="${d}"]`);
    if (cell && !cell.disabled) cell.click();
    document.querySelector('.nights-step[data-step="1"]').click();
    document.querySelector('.nights-step[data-step="1"]').click();
    document.querySelector('.btn-sched-confirm').click();
  }, eomISO);
  await p.waitForTimeout(1000);

  const spanning = await p.evaluate(() => window.travelFixApp.planner.getDays().map(d => d.date));
  const spanExpected = [0, 1, 2].map(n => {
    const d = new Date(endOfMonth.getFullYear(), endOfMonth.getMonth(), endOfMonth.getDate() + n);
    return iso(d);
  });
  check('stay crosses into the next month cleanly',
    spanning.join(',') === spanExpected.join(','), `${spanning.join(',')} vs ${spanExpected.join(',')}`);
  check('the three dates are two different months',
    new Set(spanning.map(d => d.slice(0, 7))).size === 2, spanning.join(','));

  console.log('--- activities get the same calendar ---');
  await p.evaluate(() => window.travelFixApp.planner.clearPlan());
  await openActivity();
  await p.waitForTimeout(600);
  const actCal = await p.evaluate(() => ({
    hasCalendar: !!document.querySelector('.tf-calendar'),
    cells: document.querySelectorAll('.cal-day').length,
    hasNights: !!document.querySelector('.nights-row'),
    slots: document.querySelectorAll('.slot-chip').length
  }));
  check('activity dialog has the calendar too', actCal.hasCalendar && actCal.cells === 42,
    `${actCal.hasCalendar} ${actCal.cells}`);
  check('activities still have no nights control', !actCal.hasNights);
  check('activities keep their time slots', actCal.slots === 5, String(actCal.slots));

  const actTarget = iso(new Date(target.getFullYear(), target.getMonth(), 20));
  await p.evaluate((v) => {
    const sel = document.querySelector('.cal-jump');
    sel.value = v; sel.dispatchEvent(new Event('change'));
  }, jumpValue);
  await p.evaluate((d) => {
    document.querySelector(`.cal-day[data-date="${d}"]`)?.click();
    document.querySelector('.slot-chip[data-slot-id="evening"]').click();
    document.querySelector('.btn-sched-confirm').click();
  }, actTarget);
  await p.waitForTimeout(1000);
  const actDay = await p.evaluate(() => {
    const days = window.travelFixApp.planner.getDays();
    return days.length === 1 ? { date: days[0].date, slot: days[0].activities[0].slot.label } : null;
  });
  check('activity lands on the chosen date', actDay && actDay.date === actTarget,
    JSON.stringify(actDay));
  check('activity keeps its time slot', actDay && actDay.slot === 'Evening', JSON.stringify(actDay));

  console.log('--- days read in date order ---');
  await p.evaluate(() => {
    const app = window.travelFixApp;
    const tokyo = app.ui.destinations.find(d => d.id === 'tokyo');
    app.planner.clearPlan();
    const y = new Date().getFullYear() + 1;
    // deliberately added out of order
    app.planner.addActivityToDay(`${y}-12-05`, tokyo.activities[0].id, null, tokyo);
    app.planner.addActivityToDay(`${y}-03-02`, tokyo.activities[1].id, null, tokyo);
    app.planner.addActivityToDay(`${y}-07-19`, tokyo.activities[2].id, null, tokyo);
  });
  const ordered = await p.evaluate(() => window.travelFixApp.planner.getDays().map(d => d.date));
  check('sorted chronologically regardless of insertion order',
    ordered.join(',') === [...ordered].sort().join(','), ordered.join(','));

  const range = await p.evaluate(() => window.travelFixApp.planner.getTripRange());
  check('trip range spans first to last', range.start === ordered[0] && range.end === ordered[2],
    JSON.stringify(range));

  await p.waitForTimeout(400);
  await p.screenshot({ path: SP + '/calendar-plan.png' });
  check('no page errors', errs(p).length === 0, errs(p).join(' | '));
  await b.close();
  summary();
})();
