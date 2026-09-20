/**
 * TravelFix Travel Plan & Itinerary Engine
 *
 * A plan is always a full week: Monday through Sunday, every day present
 * whether or not anything is scheduled on it. That keeps every weekday
 * available as a target at all times, so a stay or an activity can be moved
 * to any day without first having to create that day.
 *
 * Each scheduled item carries its own time slot, so the same day can hold a
 * morning hike and an evening dinner in a meaningful order.
 */

import { DESTINATIONS } from './data.js';

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/** Preset time blocks offered as quick picks, plus a custom start/end option. */
export const TIME_SLOT_PRESETS = [
  { id: 'morning',   label: 'Morning',   start: '08:00', end: '12:00' },
  { id: 'afternoon', label: 'Afternoon', start: '12:00', end: '17:00' },
  { id: 'evening',   label: 'Evening',   start: '17:00', end: '21:00' },
  { id: 'night',     label: 'Night',     start: '21:00', end: '23:30' }
];

/** Hotels are booked by the night; this is the default check-in time. */
export const DEFAULT_CHECK_IN = { id: 'checkin', label: 'Check-in', start: '15:00', end: '' };

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

/** Sort key so a day's items read in chronological order. */
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
    // v5: the day model gained per-item time slots and a fixed 7-day week,
    // so older saved plans are not compatible and are not migrated.
    this.plansStorageKey = 'travelfix_plans_library_v5';
    this.activeIdStorageKey = 'travelfix_active_plan_id_v5';
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
          return parsed.map(p => this.ensureFullWeek(p));
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
    const idx = this.plans.findIndex(p => p.id === this.plan.id);
    if (idx >= 0) this.plans[idx] = this.plan;
    else this.plans.push(this.plan);
    this.saveAll();
  }

  // ------------------------------------------------------------ plan shape

  /** Every plan holds exactly seven days, Monday first. */
  ensureFullWeek(plan) {
    const byName = new Map((plan.days || []).map(d => [d.dayName, d]));
    plan.days = WEEKDAYS.map(name => {
      const existing = byName.get(name);
      if (existing) {
        if (!Array.isArray(existing.activities)) existing.activities = [];
        existing.activities = existing.activities.map(a => ({
          activityId: a.activityId,
          slot: normaliseSlot(a.slot)
        }));
        if (existing.stay) existing.stay = { livingSpaceId: existing.stay.livingSpaceId, slot: normaliseSlot(existing.stay.slot) };
        else existing.stay = null;
        return existing;
      }
      return this.createEmptyDay(name);
    });
    return plan;
  }

  createEmptyDay(dayName) {
    return { dayName, destinationId: null, stay: null, activities: [], notes: '', transit: null };
  }

  createBlankPlanObject(title) {
    const id = 'plan-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    return {
      id,
      title,
      startDate: this.mondayOfThisWeek(),
      currency: 'USD',
      collaborators: [],
      days: WEEKDAYS.map(name => this.createEmptyDay(name))
    };
  }

  mondayOfThisWeek() {
    const now = new Date();
    const day = now.getDay();               // 0 = Sunday
    const offset = day === 0 ? -6 : 1 - day; // shift back to Monday
    now.setDate(now.getDate() + offset);
    return now.toISOString().split('T')[0];
  }

  /** Calendar date for a weekday index, derived from the plan's start date. */
  getDayDate(index) {
    if (!this.plan.startDate) return '';
    const d = new Date(this.plan.startDate + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return '';
    d.setDate(d.getDate() + index);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  setStartDate(isoDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate || '')) return false;
    this.plan.startDate = isoDate;
    this.savePlan();
    return true;
  }

  // ------------------------------------------------------------- plan CRUD

  getActivePlan() {
    const found = this.plans.find(p => p.id === this.activePlanId);
    if (found) return this.ensureFullWeek(found);
    if (this.plans.length > 0) {
      this.activePlanId = this.plans[0].id;
      return this.ensureFullWeek(this.plans[0]);
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
    this.plan = this.ensureFullWeek(target);
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
      this.plan = this.ensureFullWeek(this.plans[0]);
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

  /** Empty every day without removing the days themselves. */
  clearPlan() {
    this.plan.days = WEEKDAYS.map(name => this.createEmptyDay(name));
    this.savePlan();
  }

  clearDay(dayIndex) {
    const day = this.plan.days[dayIndex];
    if (!day) return;
    this.plan.days[dayIndex] = this.createEmptyDay(day.dayName);
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

  /** Look up a living space by id across the catalogue and generated places. */
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

  getDays() { return this.plan.days; }

  getDay(index) { return this.plan.days[index]; }

  dayIndexOf(dayName) { return WEEKDAYS.indexOf(dayName); }

  // ------------------------------------------------------------ scheduling

  /**
   * Put a stay on a day. One stay per day — assigning replaces whatever was
   * there. Returns the day it landed on.
   */
  setDayStay(dayIndex, livingSpaceId, slot = DEFAULT_CHECK_IN, destination = null) {
    const day = this.plan.days[dayIndex];
    if (!day) return null;
    if (destination) {
      this.registerDestination(destination);
      day.destinationId = destination.id;
    }
    day.stay = livingSpaceId ? { livingSpaceId, slot: normaliseSlot(slot) } : null;
    this.savePlan();
    return day;
  }

  removeDayStay(dayIndex) {
    const day = this.plan.days[dayIndex];
    if (!day) return;
    day.stay = null;
    this.savePlan();
  }

  /** Move a stay to a different day, optionally changing its time. */
  moveStay(fromDayIndex, toDayIndex, slot = null) {
    const from = this.plan.days[fromDayIndex];
    const to = this.plan.days[toDayIndex];
    if (!from || !to || !from.stay) return false;
    const moving = { ...from.stay };
    if (slot) moving.slot = normaliseSlot(slot);
    if (fromDayIndex !== toDayIndex) {
      from.stay = null;
      if (!to.destinationId) to.destinationId = from.destinationId;
    }
    to.stay = moving;
    this.savePlan();
    return true;
  }

  /** Add an activity to a day at a given time slot. */
  addActivityToDay(dayIndex, activityId, slot = null, destination = null) {
    const day = this.plan.days[dayIndex];
    if (!day || !activityId) return false;
    if (destination) {
      this.registerDestination(destination);
      if (!day.destinationId) day.destinationId = destination.id;
    }
    if (!Array.isArray(day.activities)) day.activities = [];
    if (day.activities.some(a => a.activityId === activityId)) return false;
    day.activities.push({ activityId, slot: normaliseSlot(slot) });
    this.sortDayActivities(day);
    this.savePlan();
    return true;
  }

  removeActivityFromDay(dayIndex, activityId) {
    const day = this.plan.days[dayIndex];
    if (!day || !day.activities) return;
    day.activities = day.activities.filter(a => a.activityId !== activityId);
    this.savePlan();
  }

  /** Move an activity to another day and/or retime it. */
  moveActivity(fromDayIndex, activityId, toDayIndex, slot = null) {
    const from = this.plan.days[fromDayIndex];
    const to = this.plan.days[toDayIndex];
    if (!from || !to) return false;
    const idx = (from.activities || []).findIndex(a => a.activityId === activityId);
    if (idx === -1) return false;

    const [moving] = from.activities.splice(idx, 1);
    if (slot) moving.slot = normaliseSlot(slot);

    if (to.activities.some(a => a.activityId === activityId)) {
      // Already scheduled on the target day; just retime the existing entry.
      const existing = to.activities.find(a => a.activityId === activityId);
      if (slot) existing.slot = normaliseSlot(slot);
    } else {
      to.activities.push(moving);
      if (!to.destinationId) to.destinationId = from.destinationId;
    }

    this.sortDayActivities(to);
    this.savePlan();
    return true;
  }

  setActivitySlot(dayIndex, activityId, slot) {
    const day = this.plan.days[dayIndex];
    if (!day) return false;
    const entry = (day.activities || []).find(a => a.activityId === activityId);
    if (!entry) return false;
    entry.slot = normaliseSlot(slot);
    this.sortDayActivities(day);
    this.savePlan();
    return true;
  }

  setStaySlot(dayIndex, slot) {
    const day = this.plan.days[dayIndex];
    if (!day || !day.stay) return false;
    day.stay.slot = normaliseSlot(slot);
    this.savePlan();
    return true;
  }

  sortDayActivities(day) {
    if (!day || !Array.isArray(day.activities)) return;
    day.activities.sort((a, b) => slotSortKey(a.slot) - slotSortKey(b.slot));
  }

  setDayDestination(dayIndex, destination) {
    const day = this.plan.days[dayIndex];
    if (!day || !destination) return;
    this.registerDestination(destination);
    day.destinationId = destination.id;
    this.savePlan();
  }

  setDayNotes(dayIndex, notes) {
    const day = this.plan.days[dayIndex];
    if (!day) return;
    day.notes = notes || '';
    this.savePlan();
  }

  /**
   * Days that currently hold anything — useful for summaries.
   * resolveItinerary() exposes the resolved stay as `livingSpace`, not `stay`,
   * so isEmpty is the correct thing to filter on here.
   */
  getScheduledDays() {
    return this.resolveItinerary().filter(d => !d.isEmpty);
  }

  // ---------------------------------------------------------------- output

  calculateBudget() {
    let livingSpacesCost = 0;
    let activitiesCost = 0;
    let transitCost = 0;

    this.plan.days.forEach(day => {
      if (day.stay && day.stay.livingSpaceId) {
        const found = this.findLivingSpace(day.stay.livingSpaceId);
        if (found) livingSpacesCost += found.stay.pricePerNight || 0;
      }
      (day.activities || []).forEach(entry => {
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
    return this.plan.days.map((day, idx) => {
      const destination = this.findDestination(day.destinationId);

      let livingSpace = null;
      if (day.stay && day.stay.livingSpaceId) {
        const found = this.findLivingSpace(day.stay.livingSpaceId);
        if (found) {
          livingSpace = found.stay;
          if (!destination) day.destinationId = found.destination.id;
        }
      }

      const activities = (day.activities || []).map(entry => {
        const found = this.findActivity(entry.activityId);
        return found ? { ...found.activity, slot: entry.slot } : null;
      }).filter(Boolean);

      return {
        index: idx,
        dayName: day.dayName,
        date: this.getDayDate(idx),
        destination: destination || this.findDestination(day.destinationId),
        livingSpace,
        staySlot: day.stay ? day.stay.slot : null,
        activities,
        transit: day.transit,
        notes: day.notes,
        isEmpty: !day.stay && !(day.activities || []).length && !day.transit
      };
    });
  }
}
