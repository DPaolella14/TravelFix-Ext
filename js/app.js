/**
 * TravelFix Application Orchestrator
 * Connects 2D World Map (Leaflet with reverse geocoding on click),
 * 3D Earth Globe (Three.js WebGL), Social Group & DM Chat Engine,
 * Travel Planner with Custom Schedules, and Luxury Dark UI.
 */

import { DESTINATIONS } from './data.js';
import { POPULAR_TRAVEL_HOTSPOTS } from './geo-search.js';
import { getTravelFixLogoSvg } from './logo.js';
import { TravelFixGlobe } from './globe.js';
import { TravelFixRegionalMap } from './map.js';
import { TravelPlanner } from './planner.js';
import { TravelFixChat } from './chat.js';
import { TravelFixUI } from './ui.js';
import { TravelFixAccount } from './account.js';

class TravelFixApp {
  constructor() {
    this.currentViewMode = 'map'; // 'map' (2D interactive world) or 'globe' (3D WebGL)
    this.activeDestination = null;

    this.init();
  }

  init() {
    // 1. Render Brand Logo
    const brandContainer = document.getElementById('navbar-brand-root');
    if (brandContainer) {
      brandContainer.innerHTML = getTravelFixLogoSvg(42, true);
      brandContainer.addEventListener('click', () => {
        if (this.currentViewMode === 'map') {
          this.regionalMap.resetView();
        } else {
          this.globe.resetView();
        }
      });
    }

    // 2. Initialize Travel Planner Engine
    this.planner = new TravelPlanner((updatedPlan) => {
      if (this.globe) {
        this.globe.renderFlightArcs(updatedPlan.days);
      }
      if (this.ui) {
        this.ui.renderPlannerBadge();
      }
      this.syncChatToPlan();
    });

    // 3. Initialize Social Group & DM Chat Engine
    this.chat = new TravelFixChat({
      onMessageReceived: (channel, msg) => {
        if (!this.ui) return;
        this.ui.updateChatBadge();
        // Only repaint the stream when the chat tab is actually on screen;
        // a message that arrives while it is on screen has been read.
        if (this.ui.isChatPanelVisible()) {
          this.chat.markRead();
          this.ui.renderChat();
        }
      },
      onUnreadCountChanged: (total) => {
        if (this.ui) {
          this.ui.updateChatBadge();
        }
      },
      onCollaboratorAdded: (collaborator) => {
        if (this.ui) {
          this.ui.renderChat();
        }
      }
    });

    // 4. Initialize 2D Interactive World Map (Primary default view)
    this.regionalMap = new TravelFixRegionalMap('regional-map-container', {
      onSelectDestination: (dest) => {
        this.handleSelectDestination(dest);
      },
      onSelectLivingSpace: (livingSpace, destination) => {
        this.ui.openBookingModal(livingSpace, destination);
      },
      onSelectActivity: (activity, destination) => {
        this.ui.promptAddActivityToDay(activity, destination);
      },
      onOceanClick: (lat, lng) => {
        if (this.ui) this.ui.showOceanPanel(lat, lng);
      }
    });

    // 5. Initialize 3D Three.js Globe with LOD Callback
    const globeContainer = document.getElementById('globe-canvas-container');
    this.globe = new TravelFixGlobe(
      globeContainer,
      (destination) => {
        this.handleSelectDestination(destination);
      },
      (tierInfo) => {
        if (this.ui && this.currentViewMode === 'globe') {
          this.ui.updateAltitudeIndicator(tierInfo);
        }
      }
    );

    // Populate globe hotspots and flight arcs
    this.globe.setDestinations(POPULAR_TRAVEL_HOTSPOTS);
    this.globe.renderFlightArcs(this.planner.getDays());

    // 6. Initialize UI Controller
    this.ui = new TravelFixUI({
      destinations: DESTINATIONS,
      planner: this.planner,
      chat: this.chat,
      onSelectDestination: (dest) => this.handleSelectDestination(dest),
      onToggleMapMode: (mode) => this.switchViewMode(mode),
      onSetMapLayer: (layerName) => {
        if (this.regionalMap) this.regionalMap.setLayer(layerName);
      },
      onResetView: () => {
        if (this.currentViewMode === 'map') {
          this.regionalMap.resetView();
        } else {
          this.globe.resetView();
        }
      },
      onToggleAutoRotate: (active) => {
        if (this.globe) this.globe.isAutoRotating = active;
      },
      onZoom: (delta) => {
        if (this.currentViewMode === 'map') {
          this.regionalMap.zoomBy(delta > 0 ? -1 : 1);
        } else {
          this.globe.zoomBy(delta);
        }
      },
      onToggleHotspots: () => {
        return this.globe.toggleHotspots();
      }
    });

    // 7. Sign-in (talks to the local API; degrades quietly if it is absent)
    // Signed in, plans come from the server; signed out, from this browser.
    this.pendingInvite = this.takeInviteFromUrl();
    this.planner.onNotice = (message) => { if (this.ui) this.ui.showToast(message, 'info'); };
    this.account = new TravelFixAccount({
      onChange: async (user) => {
        const changed = await this.planner.useAccount(user);
        if (changed && this.ui) this.ui.renderPlanner();
        await this.acceptPendingInvite(user);
      }
    });

    // Default to 2D Map mode view
    this.switchViewMode('map');
  }

  /**
   * An invite link arrives as /?invite=<token>. The token is a credential,
   * so it comes out of the address bar (and so out of history and any
   * Referer) at once, and is held for this tab until someone signed in can
   * accept it.
   */
  takeInviteFromUrl() {
    const key = 'travelfix_pending_invite';
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('invite');
    if (fromUrl) {
      params.delete('invite');
      const query = params.toString();
      window.history.replaceState({}, '', window.location.pathname + (query ? '?' + query : ''));
      try { sessionStorage.setItem(key, fromUrl); } catch (err) { /* this tab only */ }
      return fromUrl;
    }
    try { return sessionStorage.getItem(key); } catch (err) { return null; }
  }

  /**
   * The chat follows the active plan: a plan saved to the account has a
   * shared conversation; anything else is this browser's own notes.
   */
  syncChatToPlan() {
    if (!this.chat || !this.planner) return;
    const onServer = this.planner.remoteUser && this.planner.roleOf();
    if (onServer) this.chat.attachPlan(this.planner.plan.id);
    else this.chat.detach();
  }

  forgetPendingInvite() {
    this.pendingInvite = null;
    try { sessionStorage.removeItem('travelfix_pending_invite'); } catch (err) { /* ignore */ }
  }

  async acceptPendingInvite(user) {
    if (!this.pendingInvite || this.acceptingInvite) return;
    const toast = (message, type) => { if (this.ui) this.ui.showToast(message, type); };

    if (!user) {
      if (!this.invitePromptShown && !this.account.apiUnavailable) {
        this.invitePromptShown = true;
        toast('Log in or sign up with the address the invite was sent to, and you will join the plan.', 'info');
        this.account.openAuthDialog('signup');
      }
      return;
    }

    this.acceptingInvite = true;
    try {
      const res = await this.planner.acceptInvite(this.pendingInvite);
      if (res.ok) {
        this.forgetPendingInvite();
        if (this.ui) this.ui.renderPlanner();
        toast(`You joined "${res.data.plan.title}"`, 'success');
      } else if (res.status === 403) {
        // Wrong account or address not verified yet: the invite is still
        // good, so keep it for when that is put right.
        toast(res.data.message || 'This invite cannot be accepted by this account.', 'error');
      } else if (res.status !== 401) {
        this.forgetPendingInvite();
        toast(res.data.message || 'That invite could not be accepted.', 'error');
      }
    } catch (err) {
      toast('Could not reach the server to accept the invite.', 'error');
    } finally {
      this.acceptingInvite = false;
    }
  }

  handleSelectDestination(destination) {
    this.activeDestination = destination;

    // Register destination in planner dynamic cache
    this.planner.registerDestination(destination);

    // Focus on 2D map
    if (this.regionalMap) {
      this.regionalMap.focusDestination(destination);
    }

    // Also update 3D globe coordinates and pin
    if (this.globe) {
      this.globe.addCustomPin(destination);
      if (this.currentViewMode === 'globe') {
        this.globe.flyToLocation(destination);
      }
    }

    // Open side exploration drawer with living spaces and activities
    this.ui.openDestination(destination);
  }

  switchViewMode(mode) {
    this.currentViewMode = mode;
    const globeWrapper = document.getElementById('globe-view-wrapper');
    const mapWrapper = document.getElementById('map-view-wrapper');

    if (mode === 'map') {
      globeWrapper.classList.add('hidden-view');
      mapWrapper.classList.remove('hidden-view');
      if (this.activeDestination) {
        this.regionalMap.focusDestination(this.activeDestination);
      }
      this.regionalMap.invalidateSize();
    } else {
      mapWrapper.classList.add('hidden-view');
      globeWrapper.classList.remove('hidden-view');
      if (this.activeDestination) {
        this.globe.flyToLocation(this.activeDestination);
      } else {
        this.globe.resetView();
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.travelFixApp = new TravelFixApp();
});
