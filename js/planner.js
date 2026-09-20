/**
 * TravelFix Travel Plan & Itinerary Engine
 * Manages multi-day schedules, accommodations, activities, budget tracking,
 * and custom showcase plans (e.g. Monday - NYC, Friday - Tokyo).
 */

import { NYC_TOKYO_SHOWCASE_PLAN, SHOWCASE_TRAVEL_PLANS, DESTINATIONS } from './data.js';

export class TravelPlanner {
  constructor(onChange) {
    this.onChange = onChange;
    this.plansStorageKey = 'travelfix_plans_library_v4';
    this.activeIdStorageKey = 'travelfix_active_plan_id_v4';
    this.dynamicDestinations = new Map();
    
    this.plans = this.loadAllPlans();
    this.activePlanId = this.loadActivePlanId();
    this.plan = this.getActivePlan();
  }

  loadAllPlans() {
    const saved = localStorage.getItem(this.plansStorageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Restore dynamic custom destinations from all plans
          parsed.forEach(p => {
            if (p.customDestinations) {
              p.customDestinations.forEach(d => this.dynamicDestinations.set(d.id, d));
            }
          });
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse saved plans library.');
      }
    }
    // Default initial library with showcase plans
    return [
      JSON.parse(JSON.stringify(NYC_TOKYO_SHOWCASE_PLAN)),
      JSON.parse(JSON.stringify(SHOWCASE_TRAVEL_PLANS['south-america']))
    ];
  }

  loadActivePlanId() {
    const savedId = localStorage.getItem(this.activeIdStorageKey);
    if (savedId && this.plans.some(p => p.id === savedId)) {
      return savedId;
    }
    return this.plans[0] ? this.plans[0].id : 'nyc-tokyo';
  }

  getActivePlan() {
    const found = this.plans.find(p => p.id === this.activePlanId);
    if (found) return found;
    if (this.plans.length > 0) {
      this.activePlanId = this.plans[0].id;
      return this.plans[0];
    }
    // If empty, create a blank plan
    const blank = this.createBlankPlanObject("My First Custom Plan");
    this.plans = [blank];
    this.activePlanId = blank.id;
    return blank;
  }

  saveAll() {
    const serialized = this.plans.map(p => ({
      ...p,
      customDestinations: Array.from(this.dynamicDestinations.values())
    }));
    localStorage.setItem(this.plansStorageKey, JSON.stringify(serialized));
    localStorage.setItem(this.activeIdStorageKey, this.activePlanId);
    if (this.onChange) this.onChange(this.plan);
  }

  savePlan() {
    // Update active plan in array
    const idx = this.plans.findIndex(p => p.id === this.plan.id);
    if (idx >= 0) {
      this.plans[idx] = this.plan;
    } else {
      this.plans.push(this.plan);
    }
    this.saveAll();
  }

  getAllPlans() {
    return this.plans;
  }

  switchPlan(planId) {
    const target = this.plans.find(p => p.id === planId);
    if (target) {
      this.activePlanId = planId;
      this.plan = target;
      this.saveAll();
      return true;
    }
    return false;
  }

  createNewPlan(title = "New Custom Travel Plan") {
    const newPlan = this.createBlankPlanObject(title);
    this.plans.push(newPlan);
    this.activePlanId = newPlan.id;
    this.plan = newPlan;
    this.saveAll();
    return newPlan;
  }

  createBlankPlanObject(title) {
    const id = 'plan-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    return {
      id: id,
      title: title,
      traveler: "Alex Morgan",
      startDate: new Date().toISOString().split('T')[0],
      currency: "USD",
      collaborators: [
        { username: "alex_traveler", name: "Alex Morgan", role: "Trip Organizer", avatar: "👨‍✈️", status: "online" }
      ],
      days: []
    };
  }

  deletePlan(planId) {
    this.plans = this.plans.filter(p => p.id !== planId);
    if (this.plans.length === 0) {
      const blank = this.createBlankPlanObject("My Custom Travel Plan");
      this.plans = [blank];
      this.activePlanId = blank.id;
      this.plan = blank;
    } else if (this.activePlanId === planId) {
      this.activePlanId = this.plans[0].id;
      this.plan = this.plans[0];
    }
    this.saveAll();
    return this.plan;
  }

  deleteActivePlan() {
    return this.deletePlan(this.activePlanId);
  }

  renamePlan(newTitle) {
    if (newTitle && newTitle.trim()) {
      this.plan.title = newTitle.trim();
      this.savePlan();
    }
  }

  loadTemplate(templateKey = 'nyc-tokyo') {
    if (SHOWCASE_TRAVEL_PLANS[templateKey]) {
      const tpl = JSON.parse(JSON.stringify(SHOWCASE_TRAVEL_PLANS[templateKey]));
      // Check if plan already exists or overwrite / add as active
      const existingIdx = this.plans.findIndex(p => p.id === tpl.id);
      if (existingIdx >= 0) {
        this.plans[existingIdx] = tpl;
      } else {
        this.plans.push(tpl);
      }
      this.activePlanId = tpl.id;
      this.plan = tpl;
      this.saveAll();
      return true;
    }
    return false;
  }

  clearPlan() {
    this.plan.days = [];
    this.savePlan();
  }

  registerDestination(dest) {
    if (dest && dest.id) {
      this.dynamicDestinations.set(dest.id, dest);
    }
  }

  getDays() {
    return this.plan.days;
  }

  getDay(index) {
    return this.plan.days[index];
  }

  addDay(dayName = 'Monday', destination = null) {
    const destId = destination ? destination.id : (DESTINATIONS[0] ? DESTINATIONS[0].id : 'new-york');
    if (destination) {
      this.registerDestination(destination);
    }

    const newDay = {
      dayName: dayName,
      date: 'Custom Date',
      destinationId: destId,
      livingSpaceId: destination && destination.livingSpaces && destination.livingSpaces[0] ? destination.livingSpaces[0].id : null,
      activityIds: destination && destination.activities && destination.activities[0] ? [destination.activities[0].id] : [],
      notes: `Exploring ${destination ? destination.name : 'new destination'}.`
    };

    this.plan.days.push(newDay);
    this.savePlan();
    return newDay;
  }

  removeDay(index) {
    if (index >= 0 && index < this.plan.days.length) {
      this.plan.days.splice(index, 1);
      this.savePlan();
      return true;
    }
    return false;
  }

  updateDayDestination(dayIndex, destination) {
    const day = this.plan.days[dayIndex];
    if (!day || !destination) return;

    this.registerDestination(destination);
    day.destinationId = destination.id;
    day.livingSpaceId = destination.livingSpaces && destination.livingSpaces[0] ? destination.livingSpaces[0].id : null;
    day.activityIds = destination.activities && destination.activities[0] ? [destination.activities[0].id] : [];
    this.savePlan();
  }

  setDayLivingSpace(dayIndex, livingSpaceId) {
    const day = this.plan.days[dayIndex];
    if (!day) return;
    day.livingSpaceId = livingSpaceId;
    this.savePlan();
  }

  addActivityToDay(dayIndex, activityId) {
    const day = this.plan.days[dayIndex];
    if (!day) return;
    if (!day.activityIds) day.activityIds = [];
    if (!day.activityIds.includes(activityId)) {
      day.activityIds.push(activityId);
      this.savePlan();
    }
  }

  removeActivityFromDay(dayIndex, activityId) {
    const day = this.plan.days[dayIndex];
    if (!day || !day.activityIds) return;
    day.activityIds = day.activityIds.filter(id => id !== activityId);
    this.savePlan();
  }

  findDestination(id) {
    return DESTINATIONS.find(d => d.id === id) || this.dynamicDestinations.get(id) || null;
  }

  calculateBudget() {
    let livingSpacesCost = 0;
    let activitiesCost = 0;
    let transitCost = 0;

    this.plan.days.forEach(day => {
      const dest = this.findDestination(day.destinationId);
      if (dest) {
        // Living space cost
        if (day.livingSpaceId && dest.livingSpaces) {
          const stay = dest.livingSpaces.find(s => s.id === day.livingSpaceId);
          if (stay) livingSpacesCost += stay.pricePerNight;
        }

        // Activities cost
        if (day.activityIds && dest.activities) {
          day.activityIds.forEach(actId => {
            const act = dest.activities.find(a => a.id === actId);
            if (act) activitiesCost += act.price;
          });
        }
      }

      // Transit cost if applicable
      if (day.transit && day.transit.estimatedCost) {
        transitCost += day.transit.estimatedCost;
      }
    });

    const total = livingSpacesCost + activitiesCost + transitCost;

    return {
      livingSpacesCost,
      activitiesCost,
      transitCost,
      total,
      currency: this.plan.currency || 'USD'
    };
  }

  resolveItinerary() {
    return this.plan.days.map((day, idx) => {
      const dest = this.findDestination(day.destinationId);
      let livingSpace = null;
      let activities = [];

      if (dest) {
        if (day.livingSpaceId && dest.livingSpaces) {
          livingSpace = dest.livingSpaces.find(s => s.id === day.livingSpaceId) || null;
        }
        if (day.activityIds && dest.activities) {
          activities = day.activityIds
            .map(id => dest.activities.find(a => a.id === id))
            .filter(Boolean);
        }
      }

      return {
        index: idx,
        dayName: day.dayName,
        date: day.date,
        destination: dest,
        livingSpace,
        activities,
        transit: day.transit,
        notes: day.notes
      };
    });
  }
}
