/**
 * TravelFix Trip Chat
 *
 * Local-only for now. Messages are kept in this browser's localStorage and go
 * nowhere else: there is no server, so nobody else can see them and nothing
 * arrives from anyone else.
 *
 * Group chat with other people, and invitations by email, need a backend
 * (accounts, a database, a mail provider and a realtime transport). That is
 * being scoped separately — see docs/BACKEND-SCOPE.md. Until it exists this
 * module deliberately does NOT invent collaborators or generate replies, so
 * nothing on screen implies a conversation that is not happening.
 */

export const CHAT_IS_LOCAL_ONLY = true;

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
    this.notifyUnreadCount();
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

  /**
   * Whether real invitations are possible. False until a backend exists; the
   * UI reads this rather than hardcoding the assumption in two places.
   */
  canInvite() {
    return !CHAT_IS_LOCAL_ONLY;
  }

  sendMessage(text, cardData = null) {
    const cleanText = (text || '').trim();
    if (!cleanText && !cardData) return null;

    const channel = this.activeChannel;
    if (!this.state.messages[channel]) this.state.messages[channel] = [];

    const newMsg = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sender: { ...this.currentUser },
      text: cleanText,
      card: cardData,
      timestamp: this.getFormattedTime(),
      reactions: {}
    };

    this.state.messages[channel].push(newMsg);
    this.saveState();
    this.emit('onMessageReceived', channel, newMsg);
    return newMsg;
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
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  }
}
