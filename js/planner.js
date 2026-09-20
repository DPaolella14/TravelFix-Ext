/**
 * TravelFix Travel Plan & Itinerary Engine
 *
 * A plan is a set of real calendar dates, not a fixed week. Days exist only
 * where something is scheduled, are keyed by 'YYYY-MM-DD', and are always
 * read back in chronological order. A trip can therefore run over a weekend,
 * across a month boundary, or two years from now.
 *
 * Each scheduled item carries its own time slot, so one date can hold a
 * morning hike and an evening dinner in a meaningful order.
 */

import { DESTINATIONS } from './data.js';
import {
  addDays, compareISO, daysBetween, formatLong, formatMedium, formatShort,
  isBookable, isValidISO, todayISO, weekdayLong,
} from './dates.js';

/** Preset time blocks offered as quick picks, plus a custom start/end option. */
export const TIME_SLOT_PRESETS = [
  { id: 'morning',   label: 'Morning',   start: '08:00', end: '12:00' },
  { id: 'afternoon', label: 'Afternoon', start: '12:00', end: '17:00' },
  { id: 'evening',   label: 'Evening',   start: '17:00', end: '21:00' },
  { id: 'night',     label: 'Night',     start: '21:00', end: '23:30' }
];

/** Hotels are booked by the night; this is the default check-in time. */
export const DEFAULT_CHECK_IN = { id: 'checkin', label: 'Check-in', start: '15:00', end: '' };

/** Room options offered when reserving a stay. Surcharge is per night. */
export const ROOM_TIERS = [
  { id: 'signature', label: 'Signature Suite', surcharge: 0 },
  { id: 'sky-villa', label: 'Executive Sky Villa', surcharge: 280 },
  { id: 'penthouse', label: 'Presidential Penthouse', surcharge: 600 }
];

export const GUEST_OPTIONS = [1, 2, 3, 4];

/** A stay may run this many nights at most. */
export const MAX_NIGHTS = 30;

export function roomTierById(id) {
  return ROOM_TIERS.find(t => t.id === id) || ROOM_TIERS[0];
}

/** "14:30" -> "2:30 PM". Returns '' for anything unparseable. */
export function formatTime(hhmm) {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return '';
  const [h, m] = hhmm.split(':').map(Number);
  if (h > 23 || m > 59) return '';
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

/** Human-readable slot label, e.g. "Morning · 8:00 AM – 12:00 PM". */
export function describeSlot(slot) {
  if (!slot) return 'Any time';
  const start = formatTime(slot.start);
  const end = formatTime(slot.end);
  const range = start && end ? `${start} – ${end}` : (start || '');
  if (slot.label && range) return `${slot.label} · ${range}`;
  return slot.label || range || 'Any time';
}

function slotSortKey(slot) {
  if (!slot || !slot.start) return 24 * 60;
  const [h, m] = slot.start.split(':').map(Number);
  return (h * 60) + (m || 0);
}

export function normaliseSlot(slot) {
  if (!slot) return null;
  const preset = TIME_SLOT_PRESETS.find(p => p.id === slot.id);
  if (preset) return { ...preset };
  return {
    id: slot.id || 'custom',
    label: slot.label || 'Custom',
    start: slot.start || '',
    end: slot.end || ''
  };
}

export class TravelPlanner {
  constructor(onChange) {
    this.onChange = onChange;
    // v6: days are keyed by real calendar dates instead of weekday names,
    // so v5 plans (a fixed Monday-to-Sunday week) cannot be migrated.
    this.plansStorageKey = 'travelfix_plans_library_v6';
    this.activeIdStorageKey = 'travelfix_active_plan_id_v6';
    this.dynamicDestinations = new Map();

    this.plans = this.loadAllPlans();
    this.activePlanId = this.loadActivePlanId();
    this.plan = this.getActivePlan();
  }

  // ---------------------------------------------------------------- storage

  loadAllPlans() {
    let saved = null;
    try {
      saved = localStorage.getItem(this.plansStorageKey);
    } catch (err) {
      console.warn('TravelPlanner: localStorage unavailable', err);
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          parsed.forEach(p => {
            if (p.customDestinations) {
              p.customDestinations.forEach(d => this.dynamicDestinations.set(d.id, d));
            }
          });
          return parsed.map(p => this.normalisePlan(p));
        }
      } catch (e) {
        console.warn('TravelPlanner: could not parse the saved plan library.');
      }
    }

    return [this.createBlankPlanObject('My Travel Plan')];
  }

  loadActivePlanId() {
    let savedId = null;
    try {
      savedId = localStorage.getItem(this.activeIdStorageKey);
    } catch (err) { /* ignore */ }
    if (savedId && this.plans.some(p => p.id === savedId)) return savedId;
    return this.plans[0] ? this.plans[0].id : null;
  }

  saveAll() {
    const serialized = this.plans.map(p => ({
      ...p,
      customDestinations: Array.from(this.dynamicDestinations.values())
    }));
    try {
      localStorage.setItem(this.plansStorageKey, JSON.stringify(serialized));
      localStorage.setItem(this.activeIdStorageKey, this.activePlanId);
    } catch (err) {
      console.warn('TravelPlanner: could not save plans', err);
    }
    if (this.onChange) this.onChange(this.plan);
  }

  savePlan() {
    this.pruneEmptyDays();
    this.sortDays();
    const idx = this.plans.findIndex(p => p.id === this.plan.id);
    if (idx >= 0) this.plans[idx] = this.plan;
    else this.plans.push(this.plan);
    this.saveAll();
  }

  // ------------------------------------------------------------ plan shape

  /** Drop anything malformed and put the days in date order. */
  normalisePlan(plan) {
    plan.days = (plan.days || [])
      .filter(day => isValidISO(day.date))
      .map(day => ({
        date: day.date,
        destinationId: day.destinationId || null,
        notes: day.notes || '',
        transit: day.transit || null,
        stay: day.stay ? {
          livingSpaceId: day.stay.livingSpaceId,
          slot: day.stay.slot ? normaliseSlot(day.stay.slot) : null,
          guests: day.stay.guests || 2,
          roomTierId: day.stay.roomTierId || ROOM_TIERS[0].id,
          isCheckIn: day.stay.isCheckIn !== false,
          nightIndex: day.stay.nightIndex || 0,
          nights: day.stay.nights || 1,
        } : null,
        activities: Array.isArray(day.activities)
          ? day.activities.map(a => ({ activityId: a.activityId, slot: normaliseSlot(a.slot) }))
          : [],
      }))
      .sort((a, b) => compareISO(a.date, b.date));
    return plan;
  }

  createEmptyDay(date) {
    return { date, destinationId: null, stay: null, activities: [], notes: '', transit: null };
  }

  createBlankPlanObject(title) {
    return {
      id: 'plan-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      title,
      currency: 'USD',
      collaborators: [],
      days: []
    };
  }

  sortDays() {
    this.plan.days.sort((a, b) => compareISO(a.date, b.date));
  }

  /** Remove days that ended up with nothing on them. */
  pruneEmptyDays() {
    this.plan.days = this.plan.days.filter(
      day => day.stay || (day.activities && day.activities.length) || day.transit || day.notes
    );
  }

  /** Find a day by date, creating it if needed. */
  ensureDay(date) {
    if (!isValidISO(date)) return null;
    let day = this.plan.days.find(d => d.date === date);
    if (!day) {
      day = this.createEmptyDay(date);
      this.plan.days.push(day);
      this.sortDays();
    }
    return day;
  }

  getDay(date) {
    return this.plan.days.find(d => d.date === date) || null;
  }

  getDays() {
    this.sortDays();
    return this.plan.days;
  }

  /** Dates that hold something — used to mark the calendar. */
  bookedDates() {
    return new Set(this.plan.days.map(d => d.date));
  }

  /** First and last dates in the plan, and the span between them. */
  getTripRange() {
    if (!this.plan.days.length) return null;
    this.sortDays();
    const start = this.plan.days[0].date;
    const end = this.plan.days[this.plan.days.length - 1].date;
    return { start, end, days: daysBetween(start, end) + 1 };
  }

  // ------------------------------------------------------------- plan CRUD

  getActivePlan() {
    const found = this.plans.find(p => p.id === this.activePlanId);
    if (found) return this.normalisePlan(found);
    if (this.plans.length > 0) {
      this.activePlanId = this.plans[0].id;
      return this.normalisePlan(this.plans[0]);
    }
    const blank = this.createBlankPlanObject('My Travel Plan');
    this.plans = [blank];
    this.activePlanId = blank.id;
    return blank;
  }

  getAllPlans() { return this.plans; }

  switchPlan(planId) {
    const target = this.plans.find(p => p.id === planId);
    if (!target) return false;
    this.activePlanId = planId;
    this.plan = this.normalisePlan(target);
    this.saveAll();
    return true;
  }

  createNewPlan(title = 'New Travel Plan') {
    const newPlan = this.createBlankPlanObject(title);
    this.plans.push(newPlan);
    this.activePlanId = newPlan.id;
    this.plan = newPlan;
    this.saveAll();
    return newPlan;
  }

  deletePlan(planId) {
    this.plans = this.plans.filter(p => p.id !== planId);
    if (this.plans.length === 0) {
      const blank = this.createBlankPlanObject('My Travel Plan');
      this.plans = [blank];
      this.activePlanId = blank.id;
      this.plan = blank;
    } else if (this.activePlanId === planId) {
      this.activePlanId = this.plans[0].id;
      this.plan = this.normalisePlan(this.plans[0]);
    }
    this.saveAll();
    return this.plan;
  }

  deleteActivePlan() { return this.deletePlan(this.activePlanId); }

  renamePlan(newTitle) {
    if (newTitle && newTitle.trim()) {
      this.plan.title = newTitle.trim();
      this.savePlan();
    }
  }

  clearPlan() {
    this.plan.days = [];
    this.savePlan();
  }

  clearDay(date) {
    this.plan.days = this.plan.days.filter(d => d.date !== date);
    this.savePlan();
  }

  // --------------------------------------------------------- destinations

  registerDestination(dest) {
    if (dest && dest.id) this.dynamicDestinations.set(dest.id, dest);
  }

  findDestination(id) {
    if (!id) return null;
    return DESTINATIONS.find(d => d.id === id) || this.dynamicDestinations.get(id) || null;
  }

  findLivingSpace(stayId) {
    if (!stayId) return null;
    const all = [...DESTINATIONS, ...this.dynamicDestinations.values()];
    for (const d of all) {
      const hit = (d.livingSpaces || []).find(s => s.id === stayId);
      if (hit) return { stay: hit, destination: d };
    }
    return null;
  }

  findActivity(activityId) {
    if (!activityId) return null;
    const all = [...DESTINATIONS, ...this.dynamicDestinations.values()];
    for (const d of all) {
      const hit = (d.activities || []).find(a => a.id === activityId);
      if (hit) return { activity: hit, destination: d };
    }
    return null;
  }

  // ------------------------------------------------------------ scheduling

  /**
   * Reserve a hotel across consecutive nights from a check-in date.
   * Only the first night carries the check-in time; the rest are
   * continuation nights.
   */
  setStayRange(startDate, nights, livingSpaceId, slot, destination = null, opts = {}) {
    if (!isBookable(startDate)) return false;
    const span = Math.max(1, Math.min(nights || 1, MAX_NIGHTS));
    if (destination) this.registerDestination(destination);

    for (let i = 0; i < span; i++) {
      const date = addDays(startDate, i);
      const day = this.ensureDay(date);
      if (!day) break;
      if (destination) day.destinationId = destination.id;
      day.stay = {
        livingSpaceId,
        slot: i === 0 ? normaliseSlot(slot) : null,
        guests: opts.guests || 2,
        roomTierId: opts.roomTierId || ROOM_TIERS[0].id,
        isCheckIn: i === 0,
        nightIndex: i,
        nights: span,
      };
    }
    this.savePlan();
    return true;
  }

  /** Back-compat single-night helper. */
  setDayStay(date, livingSpaceId, slot = DEFAULT_CHECK_IN, destination = null, opts = {}) {
    return this.setStayRange(date, 1, livingSpaceId, slot, destination, opts);
  }

  /**
   * The run of consecutive dates sharing one hotel booking, found from any
   * date inside it. Used so Edit and Cancel act on the whole reservation.
   */
  getStayBlock(date) {
    const day = this.getDay(date);
    if (!day || !day.stay) return null;
    const id = day.stay.livingSpaceId;

    let startDate = date;
    while (true) {
      const prevDate = addDays(startDate, -1);
      const prev = this.getDay(prevDate);
      if (prev && prev.stay && prev.stay.livingSpaceId === id) startDate = prevDate;
      else break;
    }

    let nights = 1;
    while (true) {
      const nextDate = addDays(startDate, nights);
      const next = this.getDay(nextDate);
      if (next && next.stay && next.stay.livingSpaceId === id) nights++;
      else break;
    }

    const first = this.getDay(startDate).stay;
    return {
      startDate,
      nights,
      endDate: addDays(startDate, nights),   // check-out morning
      livingSpaceId: id,
      slot: first.slot,
      guests: first.guests || 2,
      roomTierId: first.roomTierId || ROOM_TIERS[0].id,
    };
  }

  removeStayBlock(date) {
    const block = this.getStayBlock(date);
    if (!block) return false;
    for (let i = 0; i < block.nights; i++) {
      const day = this.getDay(addDays(block.startDate, i));
      if (day) day.stay = null;
    }
    this.savePlan();
    return true;
  }

  nightlyRate(stayEntry, livingSpace) {
    if (!livingSpace) return 0;
    const base = livingSpace.pricePerNight || 0;
    return base + roomTierById(stayEntry && stayEntry.roomTierId).surcharge;
  }

  addActivityToDay(date, activityId, slot = null, destination = null) {
    if (!isBookable(date) || !activityId) return false;
    const day = this.ensureDay(date);
    if (!day) return false;
    if (destination) {
      this.registerDestination(destination);
      if (!day.destinationId) day.destinationId = destination.id;
    }
    if (day.activities.some(a => a.activityId === activityId)) return false;
    day.activities.push({ activityId, slot: normaliseSlot(slot) });
    this.sortDayActivities(day);
    this.savePlan();
    return true;
  }

  removeActivityFromDay(date, activityId) {
    const day = this.getDay(date);
    if (!day) return;
    day.activities = day.activities.filter(a => a.activityId !== activityId);
    this.savePlan();
  }

  moveActivity(fromDate, activityId, toDate, slot = null) {
    const from = this.getDay(fromDate);
    if (!from || !isBookable(toDate)) return false;
    const idx = from.activities.findIndex(a => a.activityId === activityId);
    if (idx === -1) return false;

    const [moving] = from.activities.splice(idx, 1);
    if (slot) moving.slot = normaliseSlot(slot);

    const to = this.ensureDay(toDate);
    const existing = to.activities.find(a => a.activityId === activityId);
    if (existing) {
      if (slot) existing.slot = normaliseSlot(slot);
    } else {
      to.activities.push(moving);
      if (!to.destinationId) to.destinationId = from.destinationId;
    }

    this.sortDayActivities(to);
    this.savePlan();
    return true;
  }

  setActivitySlot(date, activityId, slot) {
    const day = this.getDay(date);
    if (!day) return false;
    const entry = day.activities.find(a => a.activityId === activityId);
    if (!entry) return false;
    entry.slot = normaliseSlot(slot);
    this.sortDayActivities(day);
    this.savePlan();
    return true;
  }

  sortDayActivities(day) {
    if (!day || !Array.isArray(day.activities)) return;
    day.activities.sort((a, b) => slotSortKey(a.slot) - slotSortKey(b.slot));
  }

  setDayDestination(date, destination) {
    if (!destination) return;
    const day = this.ensureDay(date);
    if (!day) return;
    this.registerDestination(destination);
    day.destinationId = destination.id;
    this.savePlan();
  }

  setDayNotes(date, notes) {
    const day = this.ensureDay(date);
    if (!day) return;
    day.notes = notes || '';
    this.savePlan();
  }

  getScheduledDays() {
    return this.resolveItinerary();
  }

  // ---------------------------------------------------------------- output

  calculateBudget() {
    let livingSpacesCost = 0;
    let activitiesCost = 0;
    let transitCost = 0;

    this.plan.days.forEach(day => {
      if (day.stay && day.stay.livingSpaceId) {
        const found = this.findLivingSpace(day.stay.livingSpaceId);
        if (found) livingSpacesCost += this.nightlyRate(day.stay, found.stay);
      }
      day.activities.forEach(entry => {
        const found = this.findActivity(entry.activityId);
        if (found) activitiesCost += found.activity.price || 0;
      });
      if (day.transit && day.transit.estimatedCost) transitCost += day.transit.estimatedCost;
    });

    return {
      livingSpacesCost,
      activitiesCost,
      transitCost,
      total: livingSpacesCost + activitiesCost + transitCost,
      currency: this.plan.currency || 'USD'
    };
  }

  resolveItinerary() {
    this.sortDays();
    return this.plan.days.map((day, idx) => {
      const destination = this.findDestination(day.destinationId);

      let livingSpace = null;
      if (day.stay && day.stay.livingSpaceId) {
        const found = this.findLivingSpace(day.stay.livingSpaceId);
        if (found) {
          livingSpace = found.stay;
          if (!day.destinationId) day.destinationId = found.destination.id;
        }
      }

      const activities = day.activities.map(entry => {
        const found = this.findActivity(entry.activityId);
        return found ? { ...found.activity, slot: entry.slot } : null;
      }).filter(Boolean);

      return {
        index: idx,
        date: day.date,
        dayName: weekdayLong(day.date),
        dateLabel: formatMedium(day.date),
        dateLong: formatLong(day.date),
        dateShort: formatShort(day.date),
        isPast: compareISO(day.date, todayISO()) < 0,
        destination: destination || this.findDestination(day.destinationId),
        livingSpace,
        staySlot: day.stay ? day.stay.slot : null,
        stayBooking: day.stay ? {
          guests: day.stay.guests || 2,
          roomTier: roomTierById(day.stay.roomTierId),
          isCheckIn: day.stay.isCheckIn !== false,
          nightIndex: day.stay.nightIndex || 0,
          nights: day.stay.nights || 1,
          nightlyRate: livingSpace ? this.nightlyRate(day.stay, livingSpace) : 0,
        } : null,
        activities,
        transit: day.transit,
        notes: day.notes,
        isEmpty: !day.stay && !day.activities.length && !day.transit,
      };
    });
  }
}
