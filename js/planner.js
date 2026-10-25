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

    // Signed in, the server is the source of truth and localStorage keeps
    // only this browser's own signed-out plans. remoteUser is the email the
    // plans belong to; synced maps each server plan id to the body last
    // saved, so only plans that actually changed are sent.
    this.remoteUser = null;
    this.synced = null;
    this.roles = null;
    this.pushTimer = null;
    this.pushing = Promise.resolve();

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
    if (this.remoteUser) {
      try {
        localStorage.setItem(this.activeIdStorageKey, this.activePlanId);
      } catch (err) { /* ignore */ }
      this.schedulePush();
    } else {
      const serialized = this.plans.map(p => this.serialisePlan(p));
      try {
        localStorage.setItem(this.plansStorageKey, JSON.stringify(serialized));
        localStorage.setItem(this.activeIdStorageKey, this.activePlanId);
      } catch (err) {
        console.warn('TravelPlanner: could not save plans', err);
      }
    }
    if (this.onChange) this.onChange(this.plan);
  }

  serialisePlan(plan) {
    return {
      ...plan,
      customDestinations: Array.from(this.dynamicDestinations.values())
    };
  }

  // ------------------------------------------------------------ server sync

  async request(path, method = 'GET', body) {
    const res = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : { 'Accept': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, data };
  }

  /**
   * Called whenever the signed-in user changes. Signing in loads the
   * account's plans from the server; the first time an account is used, the
   * plans already in this browser are uploaded into it so nothing is lost.
   * Signing out goes back to this browser's own plans.
   */
  async useAccount(user) {
    const email = user ? user.email : null;
    if (email === this.remoteUser) return false;

    // Back to this browser's own plans first, so one account's plans can
    // never be uploaded into the next account to sign in here.
    if (this.remoteUser) {
      this.remoteUser = null;
      this.synced = null;
      this.roles = null;
      clearTimeout(this.pushTimer);
      this.plans = this.loadAllPlans();
      this.activePlanId = this.loadActivePlanId();
      this.plan = this.getActivePlan();
      if (!email && this.onChange) this.onChange(this.plan);
    }
    if (!email) return true;

    let rows;
    try {
      const res = await this.request('/api/plans');
      if (!res.ok) throw new Error(`GET /api/plans answered ${res.status}`);
      rows = res.data.plans || [];

      if (rows.length === 0) {
        const worthKeeping = this.plans.filter(p => p.days.length > 0 || p.title !== 'My Travel Plan');
        const toUpload = worthKeeping.length ? worthKeeping : [this.createBlankPlanObject('My Travel Plan')];
        for (const plan of toUpload) {
          const created = await this.request('/api/plans', 'POST', this.planBody(plan));
          if (!created.ok) throw new Error(`POST /api/plans answered ${created.status}`);
          if (plan.id === this.activePlanId) this.activePlanId = created.data.plan.id;
          rows.push(created.data.plan);
        }
      }
    } catch (err) {
      // Leave the local plans in place rather than showing an empty planner.
      console.warn('TravelPlanner: could not load plans from the server', err);
      return false;
    }

    this.remoteUser = email;
    this.applyServerPlans(rows);
    return true;
  }

  /** Replace the plan list with the server's, remembering each plan's role. */
  applyServerPlans(rows, preferId = null) {
    this.synced = new Map();
    this.roles = new Map();
    this.plans = rows.map(row => {
      (row.plan.customDestinations || []).forEach(d => this.dynamicDestinations.set(d.id, d));
      const plan = this.normalisePlan(row.plan);
      this.synced.set(plan.id, JSON.stringify(this.planBody(plan)));
      this.roles.set(plan.id, row.role);
      return plan;
    });
    if (preferId && this.plans.some(p => p.id === preferId)) {
      this.activePlanId = preferId;
    } else if (!this.plans.some(p => p.id === this.activePlanId)) {
      this.activePlanId = this.loadActivePlanId();
    }
    this.plan = this.getActivePlan();
    if (this.onChange) this.onChange(this.plan);
  }

  /** Reload from the server, e.g. after joining a plan. Unsent edits go first. */
  async reloadFromServer(preferId = null) {
    if (!this.remoteUser) return false;
    clearTimeout(this.pushTimer);
    await (this.pushing = this.pushing.then(() => this.pushChanges()));
    const res = await this.request('/api/plans');
    if (!res.ok) return false;
    this.applyServerPlans(res.data.plans || [], preferId);
    return true;
  }

  /** 'owner', 'editor' or 'viewer' for a server plan; null for a local one. */
  roleOf(planId = this.activePlanId) {
    return (this.roles && this.roles.get(planId)) || null;
  }

  /**
   * Why the active plan cannot be shared right now, or null if it can.
   * The server makes the final call (it also requires a verified address).
   */
  inviteBlocker() {
    if (!this.remoteUser) return 'signed_out';
    if (!this.synced || !this.synced.has(this.plan.id)) return 'not_saved';
    if (this.roleOf() !== 'owner') return 'not_owner';
    return null;
  }

  async invite(email, role) {
    return this.request(`/api/plans/${encodeURIComponent(this.plan.id)}/invites`, 'POST', { email, role });
  }

  /** Accept an invite token; on success the joined plan becomes the active one. */
  async acceptInvite(token) {
    const res = await this.request('/api/invites/accept', 'POST', { token });
    if (res.ok) await this.reloadFromServer(res.data.plan.id);
    return res;
  }

  planBody(plan) {
    const { id, title, ...rest } = this.serialisePlan(plan);
    return { title: title || 'Untitled plan', plan: rest };
  }

  schedulePush() {
    clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => {
      this.pushing = this.pushing.then(() => this.pushChanges());
    }, 400);
  }

  /** Send creates, edits and deletes made since the last push. */
  async pushChanges() {
    if (!this.remoteUser || !this.synced) return;
    const user = this.remoteUser;
    try {
      const liveIds = new Set(this.plans.map(p => p.id));
      for (const id of Array.from(this.synced.keys())) {
        if (liveIds.has(id)) continue;
        const res = await this.request(`/api/plans/${encodeURIComponent(id)}`, 'DELETE');
        if (res.ok || res.status === 404) this.synced.delete(id);
      }

      for (const plan of this.plans) {
        if (user !== this.remoteUser) return;
        const body = this.planBody(plan);
        const snapshot = JSON.stringify(body);

        if (!this.synced.has(plan.id)) {
          // Created in this tab: the server assigns the real id.
          const res = await this.request('/api/plans', 'POST', body);
          if (!res.ok) throw new Error(`POST /api/plans answered ${res.status}`);
          const localId = plan.id;
          plan.id = res.data.plan.id;
          if (this.activePlanId === localId) this.activePlanId = plan.id;
          this.synced.set(plan.id, snapshot);
          continue;
        }

        if (this.synced.get(plan.id) === snapshot) continue;
        if (this.roleOf(plan.id) === 'viewer') {
          // The server would refuse it; put the plan back rather than show
          // edits that will never be saved.
          const saved = JSON.parse(this.synced.get(plan.id));
          Object.assign(plan, this.normalisePlan({ ...saved.plan, id: plan.id, title: saved.title }));
          if (this.onNotice) this.onNotice('You can view this plan but not change it.');
          if (this.onChange && plan === this.plan) this.onChange(this.plan);
          continue;
        }
        const res = await this.request(`/api/plans/${encodeURIComponent(plan.id)}`, 'PUT', body);
        if (!res.ok) throw new Error(`PUT /api/plans/${plan.id} answered ${res.status}`);
        this.synced.set(plan.id, snapshot);
      }
    } catch (err) {
      // Unsent changes stay unsynced and go with the next save.
      console.warn('TravelPlanner: could not save plans to the server', err);
    }
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
