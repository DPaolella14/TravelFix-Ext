// The hotel reservation form and the day/time picker are now one dialog.
const { chromium, ctx, page, hideMap, errs, check, summary, SP } = require('./lib');

(async () => {
  const b = await chromium.launch();
  const c = await ctx(b);
  const p = await page(c);
  await hideMap(p);

  const openStay = () => p.evaluate(() => {
    const d = window.travelFixApp.ui.destinations.find(x => x.id === 'tokyo');
    window.travelFixApp.ui.openBookingModal(d.livingSpaces[0], d);
  });

  console.log('--- hotels get the merged dialog ---');
  await openStay();
  await p.waitForTimeout(700);
  const dlg = await p.evaluate(() => ({
    oldModalGone: !document.getElementById('booking-modal'),
    isStayDialog: !!document.querySelector('.stay-dialog'),
    calendar: !!document.querySelector('.tf-calendar'),
    hasNights: !!document.querySelector('.nights-row'),
    hasGuests: !!document.querySelector('#sched-guests'),
    hasRoom: !!document.querySelector('#sched-room'),
    hasTotal: !!document.querySelector('.stay-total'),
    heading: document.querySelector('.schedule-dialog h3')?.textContent.trim()
  }));
  check('old booking modal removed from the DOM', dlg.oldModalGone);
  check('stay opens the stay-flavoured dialog', dlg.isStayDialog);
  check('calendar date picker present', dlg.calendar);
  check('nights control present', dlg.hasNights);
  check('guests present', dlg.hasGuests);
  check('room tier present', dlg.hasRoom);
  check('live total present', dlg.hasTotal);
  check('titled as a reservation', /Reserve Living Space/.test(dlg.heading || ''), dlg.heading);
  await p.screenshot({ path: SP + '/stay-dialog.png' });

  console.log('--- price reacts to nights and room tier ---');
  const priced = await p.evaluate(() => {
    const read = () => document.querySelector('.stay-total').textContent;
    const before = read();
    document.querySelector('.nights-step[data-step="1"]').click();
    document.querySelector('.nights-step[data-step="1"]').click();
    const threeNights = read();
    const sel = document.querySelector('#sched-room');
    sel.value = 'sky-villa';
    sel.dispatchEvent(new Event('change'));
    return { before, threeNights, upgraded: read(),
             rate: window.travelFixApp.ui.destinations.find(x => x.id === 'tokyo').livingSpaces[0].pricePerNight };
  });
  const n = s => parseInt(s.replace(/[^0-9]/g, ''), 10);
  check('one night = nightly rate', n(priced.before) === priced.rate, `${priced.before} vs ${priced.rate}`);
  check('three nights triples it', n(priced.threeNights) === priced.rate * 3, priced.threeNights);
  check('room upgrade adds $280/night', n(priced.upgraded) === (priced.rate + 280) * 3, priced.upgraded);

  console.log('--- booking writes consecutive nights ---');
  await p.evaluate(() => {
    const cells = [...document.querySelectorAll('.cal-day:not([disabled])')];
    cells[Math.min(3, cells.length - 1)].click();
    document.querySelector('#sched-guests').value = '3';
    document.querySelector('#sched-guests').dispatchEvent(new Event('change'));
    document.querySelector('.btn-sched-confirm').click();
  });
  await p.waitForTimeout(900);
  const booked = await p.evaluate(() => {
    const days = window.travelFixApp.planner.getDays();
    return {
      occupied: days.filter(d => d.stay).map(d => d.date),
      consecutive: days.length === 3,
      checkInFlags: days.filter(d => d.stay).map(d => d.stay.isCheckIn),
      guests: days[0].stay.guests,
      tier: days[0].stay.roomTierId,
      budget: window.travelFixApp.planner.calculateBudget().livingSpacesCost,
      rate: window.travelFixApp.ui.destinations.find(x => x.id === 'tokyo').livingSpaces[0].pricePerNight
    };
  });
  check('three consecutive dates occupied', booked.occupied.length === 3 && booked.consecutive,
    booked.occupied.join(','));
  check('only the first day is check-in', booked.checkInFlags.join(',') === 'true,false,false', booked.checkInFlags.join(','));
  check('guests stored', booked.guests === 3, String(booked.guests));
  check('room tier stored', booked.tier === 'sky-villa', booked.tier);
  check('budget includes the upgrade', booked.budget === (booked.rate + 280) * 3, String(booked.budget));
  await p.screenshot({ path: SP + '/stay-booked.png' });

  console.log('--- editing shortens the block cleanly ---');
  await p.evaluate(() => document.querySelector('.btn-reschedule[data-kind="stay"]').click());
  await p.waitForTimeout(700);
  const edit = await p.evaluate(() => ({
    heading: document.querySelector('.schedule-dialog h3')?.textContent.trim(),
    nights: document.querySelector('.nights-count')?.textContent,
    guests: document.querySelector('#sched-guests')?.value,
    tier: document.querySelector('#sched-room')?.value,
    hasCancel: !!document.querySelector('.btn-sched-remove')
  }));
  check('reopens as an edit', /Edit Reservation/.test(edit.heading || ''), edit.heading);
  check('remembers 3 nights', edit.nights === '3', edit.nights);
  check('remembers guests and room', edit.guests === '3' && edit.tier === 'sky-villa', `${edit.guests}/${edit.tier}`);
  check('offers to cancel the reservation', edit.hasCancel);

  await p.evaluate(() => {
    document.querySelector('.nights-step[data-step="-1"]').click();
    document.querySelector('.btn-sched-confirm').click();
  });
  await p.waitForTimeout(900);
  const shortened = await p.evaluate(() => window.travelFixApp.planner.getDays().filter(d => d.stay).map(d => d.date));
  check('shortening leaves no orphan nights', shortened.length === 2, shortened.join(','));

  console.log('--- activities are untouched ---');
  await p.evaluate(() => {
    const d = window.travelFixApp.ui.destinations.find(x => x.id === 'tokyo');
    window.travelFixApp.ui.promptAddActivityToDay(d.activities[0], d);
  });
  await p.waitForTimeout(700);
  const act = await p.evaluate(() => ({
    isStayDialog: !!document.querySelector('.stay-dialog'),
    hasNights: !!document.querySelector('.nights-row'),
    hasGuests: !!document.querySelector('#sched-guests'),
    hasCalendar: !!document.querySelector('.tf-calendar'),
    slots: document.querySelectorAll('.slot-chip').length,
    heading: document.querySelector('.schedule-dialog h3')?.textContent.trim()
  }));
  check('activity dialog is not the stay variant', !act.isStayDialog);
  check('activity dialog still has a calendar', act.hasCalendar);
  check('no nights control for activities', !act.hasNights);
  check('no guests control for activities', !act.hasGuests);
  check('still 4 presets + custom', act.slots === 5, String(act.slots));
  check('titled as an activity', /Add Activity/.test(act.heading || ''), act.heading);

  check('no page errors', errs(p).length === 0, errs(p).join(' | '));
  await b.close();
  summary();
})();
