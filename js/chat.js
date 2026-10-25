/**
 * TravelFix Trip Chat
 *
 * Two modes, and the UI says which one it is in:
 *
 *  - Shared: signed in, on a plan saved to the account. The conversation is
 *    the plan's, stored on the server (/api/plans/<id>/messages), seen by
 *    everyone the plan is shared with, and new messages arrive by polling.
 *    Nothing from it is written to this browser's storage.
 *  - Local: signed out, or on a plan that only exists in this browser. Notes
 *    stay in localStorage and nobody else sees them.
 *
 * Either way this module never invents collaborators or replies: everything
 * on screen was written by someone.
 */

export const CHAT_IS_LOCAL_ONLY = false;

export const CHAT_POLL_MS = 3000;

const ROLE_LABELS = { owner: 'Owner', editor: 'Co-Planner', viewer: 'Traveler' };

export class TravelFixChat {
  constructor({ onMessageReceived, onUnreadCountChanged, onCollaboratorAdded }) {
    this.onMessageReceived = onMessageReceived;
    this.onUnreadCountChanged = onUnreadCountChanged;
    this.onCollaboratorAdded = onCollaboratorAdded;
    this.storageKey = 'travelfix_chat_state_v2';

    this.currentUser = {
      username: 'you',
      name: 'You',
      role: 'Trip Organizer',
      avatar: '🧑‍✈️'
    };

    this.activeChannel = 'group';
    this.state = this.loadState();

    // Shared mode: the plan whose conversation is shown, the newest server
    // message id fetched so far, and the polling timer.
    this.planId = null;
    this.lastId = '0';
    this.pollTimer = null;
    this.polling = false;

    this.notifyUnreadCount();
  }

  isShared() {
    return this.planId !== null;
  }

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

  /** Show a server plan's conversation and start polling for new messages. */
  attachPlan(planId) {
    if (planId === this.planId) return;
    clearInterval(this.pollTimer);
    this.planId = planId;
    this.lastId = '0';
    this.activeChannel = 'group';
    this.state = { collaborators: [], messages: { group: [] }, unreadCounts: { group: 0 } };
    this.emit('onMessageReceived', 'group', null);
    this.notifyUnreadCount();
    this.poll(true);
    this.pollTimer = setInterval(() => this.poll(false), CHAT_POLL_MS);
  }

  /** Back to this browser's own notes. */
  detach() {
    if (!this.isShared()) return;
    clearInterval(this.pollTimer);
    this.pollTimer = null;
    this.planId = null;
    this.state = this.loadState();
    this.emit('onMessageReceived', 'group', null);
    this.notifyUnreadCount();
  }

  /**
   * Fetch messages newer than the last one seen. Only this advances lastId,
   * so a message someone else posts while ours is in flight is never skipped.
   */
  async poll(initial) {
    if (!this.isShared() || this.polling) return;
    if (!initial && typeof document !== 'undefined' && document.hidden) return;
    const planId = this.planId;
    this.polling = true;
    try {
      const res = await this.request(
        `/api/plans/${encodeURIComponent(planId)}/messages?after=${encodeURIComponent(this.lastId)}`);
      if (planId !== this.planId || !res.ok) return;
      const list = this.state.messages.group;
      let added = 0;
      for (const raw of res.data.messages || []) {
        this.lastId = raw.id;
        if (list.some(m => m.id === raw.id)) continue;
        const msg = this.fromServer(raw);
        list.push(msg);
        added += 1;
        if (!initial && !raw.author.self) {
          this.state.unreadCounts.group = (this.state.unreadCounts.group || 0) + 1;
        }
      }
      if (added) {
        this.emit('onMessageReceived', 'group', list[list.length - 1]);
        this.notifyUnreadCount();
      }
    } catch (err) {
      console.warn('TravelFixChat: could not fetch messages', err);
    } finally {
      this.polling = false;
    }
  }

  fromServer(raw) {
    const author = raw.author || {};
    return {
      id: raw.id,
      sender: author.self
        ? { ...this.currentUser }
        : {
            username: author.email,
            name: author.displayName || author.email,
            role: ROLE_LABELS[author.role] || 'Left the plan',
            avatar: '🧳'
          },
      text: raw.text || '',
      card: raw.card || null,
      timestamp: this.formatTime(new Date(raw.createdAt * 1000)),
      reactions: {}
    };
  }

  markRead(channel = this.activeChannel) {
    if (this.state.unreadCounts[channel]) {
      this.state.unreadCounts[channel] = 0;
      this.notifyUnreadCount();
    }
  }

  loadState() {
    let saved = null;
    try {
      saved = localStorage.getItem(this.storageKey);
    } catch (err) {
      console.warn('TravelFixChat: localStorage unavailable', err);
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.messages) {
          return {
            collaborators: parsed.collaborators || [],
            messages: parsed.messages,
            unreadCounts: parsed.unreadCounts || {}
          };
        }
      } catch (e) {
        console.warn('TravelFixChat: could not parse saved chat state.');
      }
    }

    // Empty by default. No seeded people, no seeded conversation.
    return {
      collaborators: [],
      messages: { group: [] },
      unreadCounts: { group: 0 }
    };
  }

  /**
   * Invoke a UI callback without letting a rendering error break message
   * delivery. The chat engine owns the data; the UI is a subscriber, and a
   * broken subscriber must not take the engine down with it.
   */
  emit(handlerName, ...args) {
    const handler = this[handlerName];
    if (typeof handler !== 'function') return;
    try {
      handler(...args);
    } catch (err) {
      console.error(`TravelFixChat: ${handlerName} handler failed`, err);
    }
  }

  saveState() {
    // A shared conversation belongs to the server, not to this browser.
    if (this.isShared()) {
      this.notifyUnreadCount();
      return;
    }
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (err) {
      // Private browsing or a full quota must not break the conversation.
      console.warn('TravelFixChat: could not persist chat state', err);
    }
    this.notifyUnreadCount();
  }

  notifyUnreadCount() {
    const totalUnread = Object.values(this.state.unreadCounts || {}).reduce((a, b) => a + b, 0);
    this.emit('onUnreadCountChanged', totalUnread);
  }

  getCollaborators() {
    return this.state.collaborators;
  }

  getMessages(channel = this.activeChannel) {
    return this.state.messages[channel] || [];
  }

  setActiveChannel(channel) {
    this.activeChannel = channel;
    if (this.state.unreadCounts[channel]) {
      this.state.unreadCounts[channel] = 0;
      this.saveState();
    }
  }

  sendMessage(text, cardData = null) {
    const cleanText = (text || '').trim();
    if (!cleanText && !cardData) return null;

    const channel = this.activeChannel;
    if (!this.state.messages[channel]) this.state.messages[channel] = [];

    const newMsg = {
      // Local id only; a shared message takes the server's id once stored.
      id: `local-${Date.now()}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}`,
      sender: { ...this.currentUser },
      text: cleanText,
      card: cardData,
      timestamp: this.getFormattedTime(),
      reactions: {}
    };

    this.state.messages[channel].push(newMsg);
    this.saveState();
    this.emit('onMessageReceived', channel, newMsg);
    if (this.isShared()) this.deliver(newMsg);
    return newMsg;
  }

  /** Send a message shown as pending; swap in the stored copy when it lands. */
  async deliver(pending) {
    const planId = this.planId;
    pending.pending = true;
    try {
      const res = await this.request(`/api/plans/${encodeURIComponent(planId)}/messages`, 'POST',
        { text: pending.text, card: pending.card || undefined });
      if (planId !== this.planId) return;
      const list = this.state.messages.group;
      const at = list.indexOf(pending);
      if (!res.ok) {
        pending.pending = false;
        pending.failed = res.data.message || 'Not sent';
      } else if (list.some(m => m.id === res.data.message.id)) {
        // The poll already brought it back; drop the placeholder.
        if (at >= 0) list.splice(at, 1);
      } else if (at >= 0) {
        list[at] = this.fromServer(res.data.message);
      }
    } catch (err) {
      pending.pending = false;
      pending.failed = 'Not sent: no connection';
    }
    this.emit('onMessageReceived', 'group', null);
  }

  /** Put a day or the whole plan into the chat stream as a card. */
  shareItineraryCard(dayOrPlan, type = 'day') {
    let cardData = null;
    let text = '';

    if (type === 'day') {
      text = `Shared schedule for ${dayOrPlan.dayName || 'a trip day'} (${dayOrPlan.destinationName || 'destination'}):`;
      cardData = {
        type: 'day_card',
        title: `${dayOrPlan.dayName || 'Day'} — ${dayOrPlan.destinationName || 'Location'}`,
        destinationId: dayOrPlan.destinationId,
        livingSpaceName: dayOrPlan.livingSpaceName || 'No stay booked',
        activityTitles: dayOrPlan.activityTitles || [],
        notes: dayOrPlan.notes || ''
      };
    } else {
      text = `Shared the plan "${dayOrPlan.title || 'Travel Plan'}" (${dayOrPlan.daysCount || 0} days scheduled):`;
      cardData = {
        type: 'plan_summary',
        title: dayOrPlan.title || 'Travel Plan',
        daysCount: dayOrPlan.daysCount || 0,
        startDate: dayOrPlan.startDate || '',
        totalEstimate: dayOrPlan.totalEstimate || 0
      };
    }

    return this.sendMessage(text, cardData);
  }

  /** Toggle a reaction on or off. Repeated clicks used to only ever add. */
  toggleReaction(channel, messageId, emoji) {
    const list = this.state.messages[channel];
    if (!list) return;
    const msg = list.find(m => m.id === messageId);
    if (!msg) return;

    if (!msg.reactions) msg.reactions = {};
    if (msg.reactions[emoji]) delete msg.reactions[emoji];
    else msg.reactions[emoji] = 1;

    this.saveState();
  }

  /** Wipe the local conversation. */
  clearMessages(channel = this.activeChannel) {
    this.state.messages[channel] = [];
    this.state.unreadCounts[channel] = 0;
    this.saveState();
  }

  getFormattedTime() {
    return this.formatTime(new Date());
  }

  formatTime(now) {
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  }
}
