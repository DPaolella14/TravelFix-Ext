/**
 * TravelFix Social Collaboration & Messaging Engine
 * Handles Trip Group Chat, 1-on-1 Direct Messaging, User Invitations (@username),
 * Itinerary Card sharing in chat, reactions, and live simulated co-planner presence.
 */

export class TravelFixChat {
  constructor({ onMessageReceived, onUnreadCountChanged, onCollaboratorAdded }) {
    this.onMessageReceived = onMessageReceived;
    this.onUnreadCountChanged = onUnreadCountChanged;
    this.onCollaboratorAdded = onCollaboratorAdded;
    this.storageKey = 'travelfix_chat_state_v1';

    this.currentUser = {
      username: 'alex_traveler',
      name: 'Alex Morgan',
      role: 'Trip Organizer',
      avatar: '👨‍✈️'
    };

    this.activeChannel = 'group'; // 'group' or direct message recipient username like 'sarah_explorer'
    this.state = this.loadState();

    // Auto-update unread count
    this.notifyUnreadCount();
  }

  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.collaborators && parsed.messages) {
          return parsed;
        }
      } catch (e) {
        console.warn('Failed to parse saved chat state, using defaults.');
      }
    }

    return {
      collaborators: [
        { username: 'sarah_explorer', name: 'Sarah Chen', role: 'Co-Planner', avatar: '👩‍💼', status: 'online', bio: 'Architecture & foodie enthusiast' },
        { username: 'david_k', name: 'David Kim', role: 'Traveler', avatar: '🧑‍💻', status: 'online', bio: 'Night photography & skyline seeker' },
        { username: 'elena_guide', name: 'Elena Ramos', role: 'Local Specialist', avatar: '👩‍🏫', status: 'online', bio: 'Cultural preservation & museum guide' }
      ],
      messages: {
        'group': [
          {
            id: 'msg-1',
            sender: { username: 'sarah_explorer', name: 'Sarah Chen', avatar: '👩‍💼', role: 'Co-Planner' },
            text: "Hey everyone! 👋 Excited for our upcoming trip to New York City and Tokyo!",
            timestamp: "10:14 AM",
            reactions: { '🔥': 2, '✈️': 3 }
          },
          {
            id: 'msg-2',
            sender: { username: 'david_k', name: 'David Kim', avatar: '🧑‍💻', role: 'Traveler' },
            text: "Can't wait! The Plaza Hotel in NYC looks legendary, and the Shibuya Sky sunset is at the top of my list.",
            timestamp: "10:16 AM",
            reactions: { '❤️': 2 }
          },
          {
            id: 'msg-3',
            sender: { username: 'sarah_explorer', name: 'Sarah Chen', avatar: '👩‍💼', role: 'Co-Planner' },
            text: "Alex, could you share the latest itinerary draft so we can review Monday's schedule?",
            timestamp: "10:20 AM",
            reactions: {}
          }
        ],
        'sarah_explorer': [
          {
            id: 'dm-sarah-1',
            sender: { username: 'sarah_explorer', name: 'Sarah Chen', avatar: '👩‍💼', role: 'Co-Planner' },
            text: "Hey Alex! I saw you were looking at the Aman Tokyo and The Plaza in NYC. Both look spectacular for our dates.",
            timestamp: "09:45 AM",
            reactions: {}
          }
        ],
        'david_k': [
          {
            id: 'dm-david-1',
            sender: { username: 'david_k', name: 'David Kim', avatar: '🧑‍💻', role: 'Traveler' },
            text: "Hey Alex! Should we do the Tsukiji sushi masterclass on Friday morning? Heard it fills up fast!",
            timestamp: "09:50 AM",
            reactions: {}
          }
        ],
        'elena_guide': [
          {
            id: 'dm-elena-1',
            sender: { username: 'elena_guide', name: 'Elena Ramos', avatar: '👩‍🏫', role: 'Local Specialist' },
            text: "Hello Alex! I am here if you need any assistance with booking private curators or museum guides.",
            timestamp: "Yesterday",
            reactions: {}
          }
        ]
      },
      unreadCounts: {
        'group': 1,
        'sarah_explorer': 1,
        'david_k': 0,
        'elena_guide': 0
      }
    };
  }

  saveState() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    this.notifyUnreadCount();
  }

  notifyUnreadCount() {
    const totalUnread = Object.values(this.state.unreadCounts || {}).reduce((a, b) => a + b, 0);
    if (this.onUnreadCountChanged) {
      this.onUnreadCountChanged(totalUnread);
    }
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
   * Invite a new user by @username
   */
  inviteUser({ username, name, role = 'Traveler' }) {
    const cleanUsername = username.replace(/^@/, '').trim().toLowerCase();
    if (!cleanUsername) return { success: false, message: 'Invalid username' };

    // Check if already invited
    const exists = this.state.collaborators.find(c => c.username.toLowerCase() === cleanUsername);
    if (exists) {
      return { success: false, message: `@${cleanUsername} is already part of the trip crew!` };
    }

    const avatars = ['🧑‍🚀', '👩‍🎨', '🧑‍✈️', '👩‍💻', '🧑‍🌾', '👩‍🎤', '🧑‍🔬'];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const newCollaborator = {
      username: cleanUsername,
      name: name || `@${cleanUsername}`,
      role: role,
      avatar: randomAvatar,
      status: 'online',
      bio: 'Invited trip partner'
    };

    this.state.collaborators.push(newCollaborator);
    this.state.messages[cleanUsername] = [
      {
        id: `sys-${Date.now()}`,
        sender: { username: 'system', name: 'TravelFix System', avatar: '✨', role: 'System' },
        text: `You invited @${cleanUsername} to the trip! Start a direct conversation below.`,
        timestamp: this.getFormattedTime(),
        reactions: {}
      }
    ];
    this.state.unreadCounts[cleanUsername] = 0;

    // Post announcement in group chat
    this.state.messages['group'].push({
      id: `join-${Date.now()}`,
      sender: { username: 'system', name: 'TravelFix Bot', avatar: '🤖', role: 'System' },
      text: `🎉 @${this.currentUser.username} invited @${cleanUsername} (${role}) to the trip crew!`,
      timestamp: this.getFormattedTime(),
      reactions: { '🎉': 2 }
    });

    this.saveState();

    if (this.onCollaboratorAdded) {
      this.onCollaboratorAdded(newCollaborator);
    }

    // Trigger realistic acknowledgment reply after 2.5s
    setTimeout(() => {
      this.simulateCollaboratorReply(cleanUsername, `Thanks for the invite, Alex! Thrilled to join the trip plan.`);
    }, 2500);

    return { success: true, collaborator: newCollaborator };
  }

  /**
   * Send a text message to the active channel
   */
  sendMessage(text, cardData = null) {
    const cleanText = (text || '').trim();
    if (!cleanText && !cardData) return null;

    const channel = this.activeChannel;
    if (!this.state.messages[channel]) {
      this.state.messages[channel] = [];
    }

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: { ...this.currentUser },
      text: cleanText,
      card: cardData,
      timestamp: this.getFormattedTime(),
      reactions: {}
    };

    this.state.messages[channel].push(newMsg);
    this.saveState();

    if (this.onMessageReceived) {
      this.onMessageReceived(channel, newMsg);
    }

    // Auto-respond with contextual replies if applicable
    this.triggerSmartReplies(channel, cleanText, cardData);

    return newMsg;
  }

  /**
   * Share an Itinerary Day or Full Trip Plan directly into the chat stream
   */
  shareItineraryCard(dayOrPlan, type = 'day') {
    let cardData = null;
    let text = '';

    if (type === 'day') {
      text = `🗓️ Shared schedule for **${dayOrPlan.dayName || 'Trip Day'}** (${dayOrPlan.destinationName || 'Destination'}):`;
      cardData = {
        type: 'day_card',
        title: `${dayOrPlan.dayName || 'Day'} — ${dayOrPlan.destinationName || 'Location'}`,
        destinationId: dayOrPlan.destinationId,
        livingSpaceName: dayOrPlan.livingSpaceName || 'Hotel Selected',
        activityTitles: dayOrPlan.activityTitles || [],
        notes: dayOrPlan.notes || ''
      };
    } else {
      text = `🗺️ Shared our **${dayOrPlan.title || 'TravelFix Master Plan'}** (${dayOrPlan.days?.length || 0} Days):`;
      cardData = {
        type: 'plan_summary',
        title: dayOrPlan.title || 'Master Itinerary',
        daysCount: dayOrPlan.days?.length || 0,
        startDate: dayOrPlan.startDate || 'Upcoming',
        totalEstimate: dayOrPlan.totalEstimate || 0
      };
    }

    return this.sendMessage(text, cardData);
  }

  /**
   * Add or toggle reaction emoji on a message
   */
  toggleReaction(channel, messageId, emoji) {
    const list = this.state.messages[channel];
    if (!list) return;

    const msg = list.find(m => m.id === messageId);
    if (!msg) return;

    if (!msg.reactions) msg.reactions = {};
    if (msg.reactions[emoji]) {
      msg.reactions[emoji] += 1;
    } else {
      msg.reactions[emoji] = 1;
    }

    this.saveState();
  }

  /**
   * Simulate realistic, intelligent responses from travel companions
   */
  triggerSmartReplies(channel, userText, cardData) {
    if (cardData && cardData.type === 'day_card') {
      setTimeout(() => {
        const responders = ['sarah_explorer', 'david_k'];
        const chosen = responders[Math.floor(Math.random() * responders.length)];
        const collaborator = this.state.collaborators.find(c => c.username === chosen);
        
        const responses = [
          `This schedule for ${cardData.title} looks incredible! The activities are spot on. ❤️`,
          `Love the accommodation pick for ${cardData.title}! Adding my vote for this day. 👍`,
          `Looks amazing! I'll make sure our camera gear is ready for this day.`
        ];
        const replyText = responses[Math.floor(Math.random() * responses.length)];

        this.simulateCollaboratorReply(channel, replyText, collaborator);
      }, 2000);
      return;
    }

    const lower = (userText || '').toLowerCase();
    if (lower.includes('tokyo') || lower.includes('japan') || lower.includes('sushi')) {
      setTimeout(() => {
        const sarah = this.state.collaborators.find(c => c.username === 'sarah_explorer');
        this.simulateCollaboratorReply(channel, "I've heard the Tsukiji sushi tasting is phenomenal! Let's definitely do it.", sarah);
      }, 2200);
    } else if (lower.includes('hotel') || lower.includes('stay') || lower.includes('plaza') || lower.includes('booking')) {
      setTimeout(() => {
        const david = this.state.collaborators.find(c => c.username === 'david_k');
        this.simulateCollaboratorReply(channel, "The hotel location is perfect—within walking distance of everything!", david);
      }, 2400);
    } else if (channel !== 'group') {
      // Direct message reply
      setTimeout(() => {
        const recipient = this.state.collaborators.find(c => c.username === channel);
        if (recipient) {
          const dmReplies = [
            `Sounds great, Alex! Let's coordinate the timing on that.`,
            `Got it! I'm reviewing the details now.`,
            `Agreed! Let me know if you want me to book anything on my end.`
          ];
          const reply = dmReplies[Math.floor(Math.random() * dmReplies.length)];
          this.simulateCollaboratorReply(channel, reply, recipient);
        }
      }, 2000);
    }
  }

  simulateCollaboratorReply(channel, replyText, customSender = null) {
    const sender = customSender || this.state.collaborators.find(c => c.username === channel) || this.state.collaborators[0];

    const replyMsg = {
      id: `msg-${Date.now()}`,
      sender: {
        username: sender.username,
        name: sender.name,
        avatar: sender.avatar,
        role: sender.role
      },
      text: replyText,
      timestamp: this.getFormattedTime(),
      reactions: {}
    };

    if (!this.state.messages[channel]) {
      this.state.messages[channel] = [];
    }
    this.state.messages[channel].push(replyMsg);

    if (this.activeChannel !== channel) {
      this.state.unreadCounts[channel] = (this.state.unreadCounts[channel] || 0) + 1;
    }

    this.saveState();

    if (this.onMessageReceived) {
      this.onMessageReceived(channel, replyMsg);
    }
  }

  getFormattedTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  }
}
