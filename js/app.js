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
    });

    // 3. Initialize Social Group & DM Chat Engine
    this.chat = new TravelFixChat({
      onMessageReceived: (channel, msg) => {
        if (this.ui) {
          this.ui.updateChatBadge();
          if (!this.ui.chatModal.classList.contains('hidden')) {
            this.ui.renderChatMessages();
            this.ui.renderChatSidebar();
          }
        }
      },
      onUnreadCountChanged: (total) => {
        if (this.ui) {
          this.ui.updateChatBadge();
        }
      },
      onCollaboratorAdded: (collaborator) => {
        if (this.ui) {
          this.ui.renderChatSidebar();
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

    // Default to 2D Map mode view
    this.switchViewMode('map');
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
