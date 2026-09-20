/**
 * TravelFix UI Engine & Interaction Manager
 * Controls Universal Search Autocomplete, Side-by-Side Split Dashboard,
 * Travel Planner Schedule, Social Trip Chat & Direct Messaging,
 * Destination Explorer (Living Spaces & Activities), and Booking Checkout.
 */

import { UniversalSearchEngine, GLOBAL_GEO_INDEX } from './geo-search.js';

export class TravelFixUI {
  constructor(options) {
    this.destinations = options.destinations;
    this.planner = options.planner;
    this.chat = options.chat;
    this.onSelectDestination = options.onSelectDestination;
    this.onToggleMapMode = options.onToggleMapMode;
    this.onSetMapLayer = options.onSetMapLayer;
    this.onResetView = options.onResetView;
    this.onToggleAutoRotate = options.onToggleAutoRotate;
    this.onZoom = options.onZoom;
    this.onToggleHotspots = options.onToggleHotspots;

    this.searchEngine = new UniversalSearchEngine();
    this.activeTab = 'all'; // 'all', 'stays', 'activities'
    this.activePanelTab = 'planner'; // 'planner', 'chat', 'explorer'
    this.isPanelCollapsed = false;
    this.isPanelExpanded = false;
    this.currentDestination = null;
    this.currentViewMode = 'map'; // 'map' (2D) or 'globe' (3D)

    this.initElements();
    this.bindEvents();
    this.renderPlanner();
    this.renderChat();
    this.updateChatBadge();
  }

  initElements() {
    // Search Elements
    this.searchInput = document.getElementById('search-input');
    this.searchDropdown = document.getElementById('search-dropdown');

    // Workspace & Side Dashboard Panel
    this.mainWorkspace = document.getElementById('main-workspace');
    this.sidePanel = document.getElementById('side-dashboard-panel');
    this.tabBtnPlanner = document.getElementById('tab-btn-planner');
    this.tabBtnChat = document.getElementById('tab-btn-chat');
    this.tabBtnExplorer = document.getElementById('tab-btn-explorer');

    this.panelContentPlanner = document.getElementById('panel-content-planner');
    this.panelContentChat = document.getElementById('panel-content-chat');
    this.panelContentExplorer = document.getElementById('panel-content-explorer');

    this.dockedPlannerBody = document.getElementById('docked-planner-body');
    this.dockedExplorerBody = document.getElementById('docked-explorer-body');
    this.dockedChatMessages = document.getElementById('docked-chat-messages');
    this.dockedChatInput = document.getElementById('docked-chat-input');
    this.dockedChatForm = document.getElementById('docked-chat-form');
    this.dockedDmSubnav = document.getElementById('docked-dm-subnav');

    // Panel Window Controls
    this.btnToggleExpand = document.getElementById('btn-toggle-panel-expand');
    this.btnToggleCollapse = document.getElementById('btn-toggle-panel-collapse');

    // Nav Workspace Buttons
    this.navTabPlanner = document.getElementById('nav-tab-planner');
    this.navTabChat = document.getElementById('nav-tab-chat');
    this.navTabSplit = document.getElementById('nav-tab-split');

    // 2D Map / 3D Globe Mode Buttons
    this.navModeMap = document.getElementById('nav-mode-map');
    this.navModeGlobe = document.getElementById('nav-mode-globe');

    // Modals
    this.bookingModal = document.getElementById('booking-modal');
    this.bookingModalBody = document.getElementById('booking-modal-body');
    this.closeBookingBtn = document.getElementById('btn-close-booking');

    this.inviteModal = document.getElementById('invite-modal');
    this.closeInviteBtn = document.getElementById('btn-close-invite');
    this.cancelInviteBtn = document.getElementById('btn-cancel-invite');
    this.formInviteUser = document.getElementById('form-invite-user');
    this.btnDockedInvite = document.getElementById('btn-docked-invite');

    // HUD controls
    this.btnGlobeMode = document.getElementById('hud-mode-globe');
    this.btnMapMode = document.getElementById('hud-mode-map');
    this.hudMapLayers = document.getElementById('hud-map-layers');
    this.hudGlobeTools = document.getElementById('hud-globe-tools');
    this.btnResetCam = document.getElementById('hud-reset-cam');
    this.btnAutoRotate = document.getElementById('hud-toggle-rotate');
    this.btnZoomIn = document.getElementById('hud-zoom-in');
    this.btnZoomOut = document.getElementById('hud-zoom-out');
    this.btnToggleHotspots = document.getElementById('hud-toggle-hotspots');
    this.altitudeBadge = document.getElementById('hud-altitude-indicator');

    // Layer Buttons
    this.layerDarkBtn = document.getElementById('hud-layer-dark');
    this.layerSatelliteBtn = document.getElementById('hud-layer-satellite');
    this.layerStreetsBtn = document.getElementById('hud-layer-streets');

    // Quick Chat Action Buttons
    this.btnDockedShareDay = document.getElementById('btn-docked-share-day');
    this.btnDockedSharePlan = document.getElementById('btn-docked-share-plan');

    // Toast
    this.toastEl = document.getElementById('travelfix-toast');
  }

  bindEvents() {
    // 1. Search Autocomplete
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
      this.searchInput.addEventListener('focus', (e) => {
        if (e.target.value.trim()) this.handleSearch(e.target.value);
      });
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
          this.searchDropdown.classList.add('hidden');
        }
      });
    }

    // 2. View Mode Switchers (2D Map vs 3D Globe)
    if (this.navModeMap) {
      this.navModeMap.addEventListener('click', () => this.switchViewMode('map'));
    }
    if (this.navModeGlobe) {
      this.navModeGlobe.addEventListener('click', () => this.switchViewMode('globe'));
    }

    // 3. 2D Map Layer Buttons
    if (this.layerDarkBtn) {
      this.layerDarkBtn.addEventListener('click', () => this.setMapLayer('dark', this.layerDarkBtn));
    }
    if (this.layerSatelliteBtn) {
      this.layerSatelliteBtn.addEventListener('click', () => this.setMapLayer('satellite', this.layerSatelliteBtn));
    }
    if (this.layerStreetsBtn) {
      this.layerStreetsBtn.addEventListener('click', () => this.setMapLayer('streets', this.layerStreetsBtn));
    }

    // 4. Panel Tab Switchers
    if (this.tabBtnPlanner) {
      this.tabBtnPlanner.addEventListener('click', () => this.switchPanelTab('planner'));
    }
    if (this.tabBtnChat) {
      this.tabBtnChat.addEventListener('click', () => this.switchPanelTab('chat'));
    }
    if (this.tabBtnExplorer) {
      this.tabBtnExplorer.addEventListener('click', () => this.switchPanelTab('explorer'));
    }

    // Nav Bar shortcuts to Panel Tabs
    if (this.navTabPlanner) {
      this.navTabPlanner.addEventListener('click', () => {
        this.openSidePanel();
        this.switchPanelTab('planner');
      });
    }
    if (this.navTabChat) {
      this.navTabChat.addEventListener('click', () => {
        this.openSidePanel();
        this.switchPanelTab('chat');
      });
    }
    if (this.navTabSplit) {
      this.navTabSplit.addEventListener('click', () => {
        this.toggleSplitView();
      });
    }

    // 5. Panel Expand / Collapse
    if (this.btnToggleExpand) {
      this.btnToggleExpand.addEventListener('click', () => this.togglePanelExpand());
    }
    if (this.btnToggleCollapse) {
      this.btnToggleCollapse.addEventListener('click', () => this.togglePanelCollapse());
    }

    // 6. Camera & Orbit HUD Tools
    if (this.btnZoomIn) {
      this.btnZoomIn.addEventListener('click', () => {
        if (this.onZoom) this.onZoom(-30);
      });
    }
    if (this.btnZoomOut) {
      this.btnZoomOut.addEventListener('click', () => {
        if (this.onZoom) this.onZoom(30);
      });
    }
    if (this.btnResetCam) {
      this.btnResetCam.addEventListener('click', () => {
        if (this.onResetView) this.onResetView();
      });
    }
    if (this.btnAutoRotate) {
      this.btnAutoRotate.addEventListener('click', () => {
        this.btnAutoRotate.classList.toggle('active');
        const active = this.btnAutoRotate.classList.contains('active');
        if (this.onToggleAutoRotate) this.onToggleAutoRotate(active);
        this.showToast(active ? 'Auto-Orbit rotation enabled' : 'Auto-Orbit paused', 'info');
      });
    }
    if (this.btnToggleHotspots) {
      this.btnToggleHotspots.addEventListener('click', () => {
        this.btnToggleHotspots.classList.toggle('active');
        if (this.onToggleHotspots) {
          const visible = this.onToggleHotspots();
          const label = this.btnToggleHotspots.querySelector('.hotspot-label');
          if (label) label.textContent = visible ? 'Hotspots: On' : 'Hotspots: Off';
          this.showToast(visible ? 'Popular travel hotspots visible' : 'Pristine view (hotspots hidden)', 'info');
        }
      });
    }

    // 7. Chat Form & Quick Actions
    if (this.dockedChatForm) {
      this.dockedChatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSendChatMessage();
      });
    }
    if (this.btnDockedShareDay) {
      this.btnDockedShareDay.addEventListener('click', () => {
        this.shareCurrentItineraryDayToChat();
      });
    }
    if (this.btnDockedSharePlan) {
      this.btnDockedSharePlan.addEventListener('click', () => {
        if (this.chat) {
          this.chat.shareItineraryCard(this.planner.plan, 'plan');
          this.renderChat();
          this.showToast('Shared Master Itinerary into trip chat!', 'success');
        }
      });
    }

    // Group chat button in docked subnav
    const groupSubnavBtn = document.querySelector('.chat-subnav-btn[data-channel="group"]');
    if (groupSubnavBtn) {
      groupSubnavBtn.addEventListener('click', () => {
        this.switchChatChannel('group');
      });
    }

    // 8. Invite Modal Events
    if (this.btnDockedInvite) {
      this.btnDockedInvite.addEventListener('click', () => this.openInviteModal());
    }
    if (this.closeInviteBtn) {
      this.closeInviteBtn.addEventListener('click', () => this.closeInviteModal());
    }
    if (this.cancelInviteBtn) {
      this.cancelInviteBtn.addEventListener('click', () => this.closeInviteModal());
    }
    if (this.formInviteUser) {
      this.formInviteUser.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleInviteUserSubmit();
      });
    }

    // 9. Booking Modal Close
    if (this.closeBookingBtn) {
      this.closeBookingBtn.addEventListener('click', () => {
        this.bookingModal.classList.add('hidden');
      });
    }
  }

  // ==========================================
  // PANEL & WORKSPACE CONTROLS
  // ==========================================

  switchPanelTab(tabName) {
    this.activePanelTab = tabName;

    // Update tab button active states
    [this.tabBtnPlanner, this.tabBtnChat, this.tabBtnExplorer].forEach(btn => {
      if (btn) btn.classList.toggle('active', btn.getAttribute('data-panel-tab') === tabName);
    });

    // Update views
    [this.panelContentPlanner, this.panelContentChat, this.panelContentExplorer].forEach(v => {
      if (v) v.classList.remove('active');
    });

    if (tabName === 'planner' && this.panelContentPlanner) {
      this.panelContentPlanner.classList.add('active');
      this.renderPlanner();
    } else if (tabName === 'chat' && this.panelContentChat) {
      this.panelContentChat.classList.add('active');
      this.renderChat();
      this.updateChatBadge();
    } else if (tabName === 'explorer' && this.panelContentExplorer) {
      this.panelContentExplorer.classList.add('active');
      if (this.currentDestination) {
        this.renderExplorer(this.currentDestination);
      }
    }
  }

  openSidePanel() {
    this.isPanelCollapsed = false;
    this.mainWorkspace.classList.remove('panel-collapsed');
    this.navTabSplit.classList.add('active');
    if (window.travelFixApp && window.travelFixApp.regionalMap) {
      window.travelFixApp.regionalMap.invalidateSize();
    }
  }

  togglePanelCollapse() {
    this.isPanelCollapsed = !this.isPanelCollapsed;
    this.mainWorkspace.classList.toggle('panel-collapsed', this.isPanelCollapsed);
    this.navTabSplit.classList.toggle('active', !this.isPanelCollapsed);
    if (window.travelFixApp && window.travelFixApp.regionalMap) {
      window.travelFixApp.regionalMap.invalidateSize();
    }
    this.showToast(this.isPanelCollapsed ? 'Map Expanded (Panel hidden)' : 'Split View restored', 'info');
  }

  togglePanelExpand() {
    this.isPanelExpanded = !this.isPanelExpanded;
    this.mainWorkspace.classList.toggle('panel-expanded-max', this.isPanelExpanded);
    this.btnToggleExpand.textContent = this.isPanelExpanded ? '⤡' : '⤢';
    if (window.travelFixApp && window.travelFixApp.regionalMap) {
      window.travelFixApp.regionalMap.invalidateSize();
    }
  }

  toggleSplitView() {
    this.togglePanelCollapse();
  }

  setMapLayer(layerName, activeBtn) {
    [this.layerDarkBtn, this.layerSatelliteBtn, this.layerStreetsBtn].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });
    if (activeBtn) activeBtn.classList.add('active');

    if (this.onSetMapLayer) {
      this.onSetMapLayer(layerName);
    }
    this.showToast(`Switched map layer to ${layerName.toUpperCase()}`, 'info');
  }

  switchViewMode(mode) {
    this.currentViewMode = mode;
    if (mode === 'map') {
      this.navModeMap.classList.add('active');
      this.navModeGlobe.classList.remove('active');
      if (this.hudMapLayers) this.hudMapLayers.style.display = 'flex';
      if (this.hudGlobeTools) this.hudGlobeTools.style.display = 'none';
      this.updateAltitudeIndicator({ tier: '2D Map Explorer', distance: 'Global' });
    } else {
      this.navModeGlobe.classList.add('active');
      this.navModeMap.classList.remove('active');
      if (this.hudMapLayers) this.hudMapLayers.style.display = 'none';
      if (this.hudGlobeTools) this.hudGlobeTools.style.display = 'flex';
      this.updateAltitudeIndicator({ tier: '3D Earth Globe', distance: 280 });
    }

    if (this.onToggleMapMode) {
      this.onToggleMapMode(mode);
    }
  }

  updateAltitudeIndicator(tierInfo) {
    if (!this.altitudeBadge) return;
    const dot = this.altitudeBadge.querySelector('.alt-dot');
    const text = this.altitudeBadge.querySelector('.alt-text');

    if (this.currentViewMode === 'map') {
      if (dot) dot.className = 'alt-dot dot-orbit';
      if (text) text.innerHTML = `<b>2D World Explorer</b> &bull; Clean Cartography`;
    } else {
      if (dot) dot.className = 'alt-dot dot-orbit';
      if (text) text.innerHTML = `<b>3D Earth Orbit</b> &bull; Popular Hotspots Active`;
    }
  }

  // ==========================================
  // SEARCH AUTOCOMPLETE
  // ==========================================

  handleSearch(query) {
    this.searchEngine.search(query, (results) => {
      this.renderSearchResults(results);
    });
  }

  renderSearchResults(results) {
    if (!results || !results.length) {
      this.searchDropdown.innerHTML = `
        <div class="search-empty-state">
          <span>⌕</span> No locations found. Try searching any country, state, city, or coordinates.
        </div>
      `;
      this.searchDropdown.classList.remove('hidden');
      return;
    }

    this.searchDropdown.innerHTML = results.map(item => `
      <div class="search-result-item" data-item-id="${item.id}">
        <img src="${item.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=120&q=80'}" class="search-thumb" alt="${item.name}" />
        <div class="search-info">
          <div class="search-title">${item.name}</div>
          <div class="search-sub">${item.country || 'Global Territory'} &bull; <span class="search-tag">${item.type}</span></div>
        </div>
      </div>
    `).join('');

    this.searchDropdown.classList.remove('hidden');

    this.searchDropdown.querySelectorAll('.search-result-item').forEach(el => {
      el.addEventListener('click', () => {
        const itemId = el.getAttribute('data-item-id');
        const found = results.find(r => r.id === itemId);
        if (found) {
          const destObj = this.searchEngine.createDynamicDestination(found);
          this.searchDropdown.classList.add('hidden');
          this.searchInput.value = '';
          if (this.onSelectDestination) {
            this.onSelectDestination(destObj);
          }
        }
      });
    });
  }

  // ==========================================
  // DESTINATION EXPLORER (LIVING SPACES & ACTIVITIES)
  // ==========================================

  openDestination(destination) {
    this.currentDestination = destination;
    this.openSidePanel();
    this.switchPanelTab('explorer');
    this.renderExplorer(destination);
  }

  /**
   * Displays an interactive, luxurious Ocean Information panel when clicking in open water
   */
  showOceanPanel(lat, lng) {
    this.openSidePanel();
    this.switchPanelTab('explorer');
    if (!this.dockedExplorerBody) return;

    this.showToast('🌊 Open Ocean selected — no bookable stays here.', 'info');

    this.dockedExplorerBody.innerHTML = `
      <!-- Ocean Cover Banner -->
      <div class="explorer-hero ocean-hero" style="background-image: url('https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80');">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <span class="badge badge-cyan">MARITIME &bull; OPEN WATERS</span>
          <h2 class="explorer-hero-title">Open Ocean</h2>
          <p class="explorer-hero-tagline">Coordinates: ${lat.toFixed(4)}°, ${lng.toFixed(4)}°</p>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="explorer-metrics-row">
        <div class="metric-box">
          <span class="m-icon">🌊</span>
          <div>
            <span class="m-lbl">Territory</span>
            <span class="m-val">International Waters</span>
          </div>
        </div>
        <div class="metric-box">
          <span class="m-icon">🧭</span>
          <div>
            <span class="m-lbl">Booking Status</span>
            <span class="m-val" style="color: #ff9f43;">Uninhabited</span>
          </div>
        </div>
        <div class="metric-box">
          <span class="m-icon">🚢</span>
          <div>
            <span class="m-lbl">Access</span>
            <span class="m-val">Vessel / Sea Only</span>
          </div>
        </div>
      </div>

      <!-- Ocean Information Card -->
      <div class="ocean-info-card" style="margin: 20px; padding: 22px; background: rgba(15, 23, 42, 0.75); border: 1px solid rgba(0, 242, 254, 0.25); border-radius: 14px; text-align: center;">
        <div style="font-size: 40px; margin-bottom: 12px;">🌊</div>
        <h3 style="color: #fff; font-size: 18px; margin-bottom: 8px; font-weight: 600;">No Bookable Destination Here</h3>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">
          You clicked in open ocean with no registered hotels or land activities.
          Try clicking on a nearby coastline, port, island, or search for any world city in the search bar above!
        </p>
        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-primary btn-sm" id="btn-ocean-explore-islands" style="padding: 9px 18px;">
            🏝️ Explore Island Getaways
          </button>
          <button class="btn btn-secondary btn-sm" id="btn-ocean-close" style="padding: 9px 18px;">
            Close Explorer
          </button>
        </div>
      </div>

      <!-- Recommended Coastal & Island Hubs -->
      <div style="padding: 0 20px 24px;">
        <h4 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 14px;">
          Popular Coastal & Island Destinations
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div class="ocean-quick-pick" data-dest="hawaii" style="cursor: pointer; background: rgba(11, 17, 30, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; transition: all 0.2s;">
            <div style="font-weight: 600; color: #fff; font-size: 13px;">🌺 Hawaii</div>
            <div style="font-size: 11px; color: #00f2fe;">United States</div>
          </div>
          <div class="ocean-quick-pick" data-dest="bali" style="cursor: pointer; background: rgba(11, 17, 30, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; transition: all 0.2s;">
            <div style="font-weight: 600; color: #fff; font-size: 13px;">🌴 Bali</div>
            <div style="font-size: 11px; color: #00f2fe;">Indonesia</div>
          </div>
          <div class="ocean-quick-pick" data-dest="santorini" style="cursor: pointer; background: rgba(11, 17, 30, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; transition: all 0.2s;">
            <div style="font-weight: 600; color: #fff; font-size: 13px;">🏛️ Santorini</div>
            <div style="font-size: 11px; color: #00f2fe;">Greece</div>
          </div>
          <div class="ocean-quick-pick" data-dest="cape-town" style="cursor: pointer; background: rgba(11, 17, 30, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; transition: all 0.2s;">
            <div style="font-weight: 600; color: #fff; font-size: 13px;">🌊 Cape Town</div>
            <div style="font-size: 11px; color: #00f2fe;">South Africa</div>
          </div>
        </div>
      </div>
    `;

    // Wire buttons
    const btnClose = this.dockedExplorerBody.querySelector('#btn-ocean-close');
    if (btnClose) {
      btnClose.addEventListener('click', () => {
        this.closeSidePanel();
      });
    }

    const btnIslands = this.dockedExplorerBody.querySelector('#btn-ocean-explore-islands');
    if (btnIslands) {
      btnIslands.addEventListener('click', () => {
        if (this.searchInput) {
          this.searchInput.value = 'Hawaii';
          this.handleSearch('Hawaii');
          this.searchInput.focus();
        }
      });
    }

    // Quick pick clicks
    this.dockedExplorerBody.querySelectorAll('.ocean-quick-pick').forEach(el => {
      el.addEventListener('click', () => {
        const destId = el.dataset.dest;
        const found = DESTINATIONS.find(d => d.id.toLowerCase() === destId || d.name.toLowerCase().includes(destId));
        if (found && this.onSelectDestination) {
          this.onSelectDestination(found);
        }
      });
    });
  }

  renderExplorer(dest) {
    if (!dest || !this.dockedExplorerBody) return;

    const stays = dest.livingSpaces || [];
    const acts = dest.activities || [];

    this.dockedExplorerBody.innerHTML = `
      <!-- Cover Banner -->
      <div class="explorer-hero" style="background-image: url('${dest.image}');">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <span class="badge badge-cyan">${dest.continent || 'Global'} &bull; ${dest.tier ? dest.tier.toUpperCase() : 'DESTINATION'}</span>
          <h2 class="explorer-hero-title">${dest.name}</h2>
          <p class="explorer-hero-tagline">${dest.tagline || dest.country || ''}</p>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="explorer-metrics-row">
        <div class="metric-box">
          <span class="m-icon">📍</span>
          <div>
            <span class="m-lbl">Country / Region</span>
            <span class="m-val">${dest.country}</span>
          </div>
        </div>
        <div class="metric-box">
          <span class="m-icon">⛅</span>
          <div>
            <span class="m-lbl">Weather</span>
            <span class="m-val">${dest.weather || '22°C Clear'}</span>
          </div>
        </div>
        <div class="metric-box">
          <span class="m-icon">💵</span>
          <div>
            <span class="m-lbl">Currency</span>
            <span class="m-val">${dest.currency || 'USD'}</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Buttons -->
      <div class="explorer-action-row">
        <button id="btn-docked-add-dest" class="btn btn-primary btn-sm">
          + Add Stop to Travel Plan
        </button>
        <button id="btn-docked-share-dest" class="btn btn-outline btn-sm">
          💬 Discuss with Trip Crew
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="explorer-subtabs">
        <button class="subtab-btn ${this.activeTab === 'all' ? 'active' : ''}" data-tab="all">
          Overview & All (${stays.length + acts.length})
        </button>
        <button class="subtab-btn ${this.activeTab === 'stays' ? 'active' : ''}" data-tab="stays">
          🏨 Stays (${stays.length})
        </button>
        <button class="subtab-btn ${this.activeTab === 'activities' ? 'active' : ''}" data-tab="activities">
          🧭 Activities (${acts.length})
        </button>
      </div>

      <!-- Sections -->
      <div class="explorer-content-sections">
        ${(this.activeTab === 'all' || this.activeTab === 'overview') ? `
          <div class="explorer-desc-box">
            <h4>About ${dest.name}</h4>
            <p>${dest.description}</p>
          </div>
        ` : ''}

        <!-- Living Spaces -->
        ${(this.activeTab === 'all' || this.activeTab === 'stays') ? this.renderLivingSpacesSection(stays, dest) : ''}

        <!-- Activities -->
        ${(this.activeTab === 'all' || this.activeTab === 'activities') ? this.renderActivitiesSection(acts, dest) : ''}
      </div>
    `;

    // Subtab clicks
    this.dockedExplorerBody.querySelectorAll('.subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeTab = btn.getAttribute('data-tab');
        this.renderExplorer(dest);
      });
    });

    // Action buttons
    const addStopBtn = this.dockedExplorerBody.querySelector('#btn-docked-add-dest');
    if (addStopBtn) {
      addStopBtn.addEventListener('click', () => this.promptAddDestinationToDay(dest));
    }

    const shareDestBtn = this.dockedExplorerBody.querySelector('#btn-docked-share-dest');
    if (shareDestBtn) {
      shareDestBtn.addEventListener('click', () => {
        this.switchPanelTab('chat');
        if (this.chat) {
          const firstStay = dest.livingSpaces ? dest.livingSpaces[0]?.name : '';
          const firstAct = dest.activities ? dest.activities[0]?.title : '';
          this.chat.sendMessage(`🌍 Exploring **${dest.name}, ${dest.country}**! Top Living Space: ${firstStay || 'Luxury Stay'}, Activity: ${firstAct || 'Guided Experience'}. Should we add it to the schedule?`);
          this.renderChat();
        }
      });
    }

    this.bindDrawerActions(dest);
  }

  renderLivingSpacesSection(stays, dest) {
    if (!stays || !stays.length) {
      return `
        <div class="explorer-section">
          <h4 class="section-title">🏨 Living Spaces & Luxury Accommodations</h4>
          <p class="empty-notice">Discovering boutique accommodations...</p>
        </div>
      `;
    }

    return `
      <div class="explorer-section">
        <div class="section-title-row">
          <h4 class="section-title">🏨 Living Spaces & Luxury Accommodations</h4>
          <span class="count-pill">${stays.length} Available</span>
        </div>

        <div class="cards-list">
          ${stays.map(stay => `
            <div class="tf-experience-card" data-stay-id="${stay.id}">
              <div class="card-media-wrapper">
                <img src="${stay.image}" alt="${stay.name}" class="card-media" loading="lazy" />
                <span class="card-rating-badge">⭐ ${stay.rating || 4.9}</span>
              </div>
              <div class="card-body">
                <div class="card-type-tag">${stay.type}</div>
                <h4 class="card-title">${stay.name}</h4>
                <p class="card-desc">${stay.description}</p>
                
                <ul class="amenities-pills">
                  ${(stay.amenities || []).slice(0, 3).map(a => `<li>${a}</li>`).join('')}
                </ul>

                <div class="card-footer-row">
                  <div class="price-block">
                    <span class="price-val">$${stay.pricePerNight}</span>
                    <span class="price-period">/ night</span>
                  </div>
                  <div class="card-actions-group">
                    <button class="btn btn-outline btn-sm btn-assign-stay" data-stay-id="${stay.id}">
                      + Add to Day
                    </button>
                    <button class="btn btn-primary btn-sm btn-book-stay" data-stay-id="${stay.id}">
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderActivitiesSection(acts, dest) {
    if (!acts || !acts.length) {
      return `
        <div class="explorer-section">
          <h4 class="section-title">🧭 Curated Activities & Sights</h4>
          <p class="empty-notice">Loading local cultural excursions...</p>
        </div>
      `;
    }

    return `
      <div class="explorer-section">
        <div class="section-title-row">
          <h4 class="section-title">🧭 Curated Activities & Sights</h4>
          <span class="count-pill">${acts.length} Curated</span>
        </div>

        <div class="cards-list">
          ${acts.map(act => `
            <div class="tf-experience-card" data-act-id="${act.id}">
              <div class="card-media-wrapper">
                <img src="${act.image}" alt="${act.title}" class="card-media" loading="lazy" />
                <span class="card-rating-badge">⭐ ${act.rating || 4.95}</span>
                <span class="card-duration-badge">⏱️ ${act.duration || '3 Hours'}</span>
              </div>
              <div class="card-body">
                <div class="card-type-tag">${act.category || 'Excursion'} &bull; ${act.timeSlot || 'Flexible'}</div>
                <h4 class="card-title">${act.title}</h4>
                
                <ul class="highlights-list">
                  ${(act.highlights || []).slice(0, 2).map(h => `<li>${h}</li>`).join('')}
                </ul>

                <div class="card-footer-row">
                  <div class="price-block">
                    <span class="price-val">$${act.price}</span>
                    <span class="price-period">/ guest</span>
                  </div>
                  <button class="btn btn-cyan btn-sm btn-add-act" data-act-id="${act.id}">
                    + Add to Day
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  bindDrawerActions(dest) {
    // Book Stay
    this.dockedExplorerBody.querySelectorAll('.btn-book-stay').forEach(btn => {
      btn.addEventListener('click', () => {
        const stayId = btn.getAttribute('data-stay-id');
        const stay = dest.livingSpaces.find(s => s.id === stayId);
        if (stay) this.openBookingModal(stay, dest);
      });
    });

    // Assign Stay to Day
    this.dockedExplorerBody.querySelectorAll('.btn-assign-stay').forEach(btn => {
      btn.addEventListener('click', () => {
        const stayId = btn.getAttribute('data-stay-id');
        const stay = dest.livingSpaces.find(s => s.id === stayId);
        if (stay) this.promptAssignStayToDay(stay, dest);
      });
    });

    // Add Activity to Day
    this.dockedExplorerBody.querySelectorAll('.btn-add-act').forEach(btn => {
      btn.addEventListener('click', () => {
        const actId = btn.getAttribute('data-act-id');
        const act = dest.activities.find(a => a.id === actId);
        if (act) this.promptAddActivityToDay(act, dest);
      });
    });
  }

  promptAssignStayToDay(stay, dest) {
    const days = this.planner.getDays();
    if (!days.length) {
      this.promptAddDestinationToDay(dest);
      return;
    }

    const optionsHtml = days.map((day, idx) => `
      <div class="plan-day-select-item" data-day-index="${idx}">
        <div class="select-day-header">
          <strong>${day.dayName}</strong> - ${day.date || 'Scheduled'}
        </div>
        <div class="select-day-dest">Stop: <span>${day.destinationId}</span></div>
      </div>
    `).join('');

    const modalHtml = `
      <div class="quick-modal-overlay">
        <div class="quick-modal-content">
          <h3>Set Living Space for Itinerary Day</h3>
          <p>Assign <b>${stay.name}</b> ($${stay.pricePerNight}/night) in ${dest.name}:</p>
          <div class="day-picker-list">${optionsHtml}</div>
          <div class="quick-modal-buttons">
            <button class="btn btn-secondary btn-cancel-assign">Cancel</button>
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = modalHtml;
    document.body.appendChild(container);

    container.querySelectorAll('.plan-day-select-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-day-index'), 10);
        this.planner.updateDayDestination(idx, dest);
        this.planner.setDayLivingSpace(idx, stay.id);
        this.showToast(`Assigned ${stay.name} to ${days[idx].dayName}!`, 'success');
        container.remove();
        this.renderPlanner();
      });
    });

    container.querySelector('.btn-cancel-assign').addEventListener('click', () => {
      container.remove();
    });
  }

  promptAddActivityToDay(act, dest) {
    const days = this.planner.getDays();
    if (!days.length) {
      this.promptAddDestinationToDay(dest);
      return;
    }

    const optionsHtml = days.map((day, idx) => `
      <div class="plan-day-select-item" data-day-index="${idx}">
        <div class="select-day-header">
          <strong>${day.dayName}</strong> (${day.date || 'Scheduled'})
        </div>
        <div class="select-day-dest">${day.destinationId === dest.id ? '✓ Matching Destination' : 'Will update stop to ' + dest.name}</div>
      </div>
    `).join('');

    const modalHtml = `
      <div class="quick-modal-overlay">
        <div class="quick-modal-content">
          <h3>Add Activity to Itinerary</h3>
          <p>Schedule <b>${act.title}</b> ($${act.price}):</p>
          <div class="day-picker-list">${optionsHtml}</div>
          <div class="quick-modal-buttons">
            <button class="btn btn-secondary btn-cancel-assign">Cancel</button>
          </div>
        </div>
      </div>
    `;

    const container = document.createElement('div');
    container.innerHTML = modalHtml;
    document.body.appendChild(container);

    container.querySelectorAll('.plan-day-select-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.getAttribute('data-day-index'), 10);
        if (days[idx].destinationId !== dest.id) {
          this.planner.updateDayDestination(idx, dest);
        }
        this.planner.addActivityToDay(idx, act.id);
        this.showToast(`Added ${act.title} to ${days[idx].dayName}!`, 'success');
        container.remove();
        this.renderPlanner();
      });
    });

    container.querySelector('.btn-cancel-assign').addEventListener('click', () => {
      container.remove();
    });
  }

  promptAddDestinationToDay(dest) {
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const daysCount = this.planner.getDays().length;
    const nextDayName = dayNames[daysCount % 7];

    this.planner.addDay(nextDayName, dest);
    this.showToast(`Added new stop for ${dest.name} on ${nextDayName}!`, 'success');
    this.renderPlanner();
  }

  // ==========================================
  // TRAVEL PLANNER (MULTI-DAY ITINERARY)
  // ==========================================

  renderPlannerBadge() {
    const badge = document.getElementById('planner-count-badge');
    if (!badge) return;
    const days = this.planner.getDays();
    badge.textContent = `${days.length} Days`;
  }

  renderPlanner() {
    this.renderPlannerBadge();
    if (!this.dockedPlannerBody) return;

    const itinerary = this.planner.resolveItinerary();
    const budget = this.planner.calculateBudget();
    const allPlans = this.planner.getAllPlans();
    const activePlan = this.planner.plan;

    this.dockedPlannerBody.innerHTML = `
      <!-- Header Summary Banner -->
      <div class="planner-docked-banner">
        <div class="planner-docked-title-row">
          <div>
            <span class="badge badge-cyan">TRIP SCHEDULE</span>
            <h3 class="docked-title">${activePlan.title || 'World Journey'}</h3>
          </div>
          <div class="docked-budget-badge">
            <span class="b-lbl">ESTIMATED BUDGET</span>
            <span class="b-val">$${budget.total.toLocaleString()}</span>
          </div>
        </div>

        <!-- Budget Pills Breakdown -->
        <div class="docked-budget-pills">
          <span>Stays: $${budget.livingSpacesCost.toLocaleString()}</span>
          <span>Activities: $${budget.activitiesCost.toLocaleString()}</span>
          ${budget.transitCost ? `<span>Flights: $${budget.transitCost.toLocaleString()}</span>` : ''}
        </div>
      </div>

      <!-- Plan Manager & Switcher Bar -->
      <div class="planner-manager-row">
        <div class="plan-select-wrapper">
          <span class="t-lbl">Active Plan:</span>
          <select id="select-active-plan" class="plan-select-dropdown" title="Switch active itinerary">
            ${allPlans.map(p => `
              <option value="${p.id}" ${p.id === activePlan.id ? 'selected' : ''}>${p.title}</option>
            `).join('')}
          </select>
        </div>
        <div class="plan-mgr-actions">
          <button class="btn-plan-action" id="btn-new-custom-plan" title="Create a brand new blank travel plan">
            ➕ New Plan
          </button>
          <button class="btn-plan-action" id="btn-rename-active-plan" title="Rename this plan">
            ✏️ Rename
          </button>
          <button class="btn-plan-action btn-action-delete" id="btn-delete-active-plan" title="Delete this plan permanently">
            🗑️ Delete
          </button>
        </div>
      </div>

      <!-- Quick Showcase Template Switcher -->
      <div class="planner-docked-templates">
        <span class="t-lbl">Showcase Templates:</span>
        <button class="btn-template-chip ${activePlan.id === 'nyc-tokyo' ? 'active' : ''}" id="btn-tpl-nyc-tokyo">
          🗽 NYC & 🗼 Tokyo
        </button>
        <button class="btn-template-chip ${activePlan.id === 'south-america' ? 'active' : ''}" id="btn-tpl-sa">
          🦙 Machu Picchu & 🇧🇷 São Paulo
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="planner-docked-actions">
        <button class="btn btn-primary btn-sm" id="btn-docked-add-day">+ Add Day to Plan</button>
        <button class="btn btn-outline btn-sm" id="btn-docked-invite-top">👥 Invite Collaborators</button>
        <button class="btn btn-secondary btn-sm" id="btn-docked-clear">✕ Clear All Days</button>
        <button class="btn btn-secondary btn-sm" id="btn-docked-print">🖨️ Print</button>
      </div>

      <!-- Timeline Days List -->
      <div class="docked-timeline-list">
        ${itinerary.length ? itinerary.map(item => this.renderItineraryDayCard(item)).join('') : `
          <div class="empty-timeline-card">
            <div style="font-size: 32px; margin-bottom: 8px;">🗺️</div>
            <h4>Your Travel Plan is Empty</h4>
            <p>Click any point or state on the map, or search a destination to add days, hotels, and activities.</p>
            <div style="display: flex; gap: 8px; justify-content: center; margin-top: 12px; flex-wrap: wrap;">
              <button class="btn btn-primary btn-sm" id="btn-empty-add-first-day">+ Add First Day</button>
              <button class="btn btn-secondary btn-sm" id="btn-docked-load-nyc">Load NYC & Tokyo Showcase</button>
            </div>
          </div>
        `}
      </div>
    `;

    // Plan dropdown switch
    const selectPlan = this.dockedPlannerBody.querySelector('#select-active-plan');
    if (selectPlan) {
      selectPlan.addEventListener('change', (e) => {
        const planId = e.target.value;
        this.planner.switchPlan(planId);
        this.renderPlanner();
        this.showToast(`Switched to "${this.planner.plan.title}"`, 'info');
      });
    }

    // Create New Plan
    const btnNewPlan = this.dockedPlannerBody.querySelector('#btn-new-custom-plan');
    if (btnNewPlan) {
      btnNewPlan.addEventListener('click', () => {
        const title = prompt('Enter a title for your new travel plan:', 'My Next Adventure');
        if (title && title.trim()) {
          this.planner.createNewPlan(title.trim());
          this.renderPlanner();
          this.showToast(`Created new plan: "${title.trim()}"!`, 'success');
        }
      });
    }

    // Rename Plan
    const btnRenamePlan = this.dockedPlannerBody.querySelector('#btn-rename-active-plan');
    if (btnRenamePlan) {
      btnRenamePlan.addEventListener('click', () => {
        const currentTitle = this.planner.plan.title || '';
        const newTitle = prompt('Rename this travel plan:', currentTitle);
        if (newTitle && newTitle.trim() && newTitle.trim() !== currentTitle) {
          this.planner.renamePlan(newTitle.trim());
          this.renderPlanner();
          this.showToast(`Plan renamed to "${newTitle.trim()}"`, 'success');
        }
      });
    }

    // Delete Plan
    const btnDeletePlan = this.dockedPlannerBody.querySelector('#btn-delete-active-plan');
    if (btnDeletePlan) {
      btnDeletePlan.addEventListener('click', () => {
        const title = this.planner.plan.title;
        if (confirm(`Are you sure you want to permanently delete "${title}"?`)) {
          this.planner.deleteActivePlan();
          this.renderPlanner();
          this.showToast(`Deleted "${title}"`, 'info');
        }
      });
    }

    // Template clicks
    const btnNyc = this.dockedPlannerBody.querySelector('#btn-tpl-nyc-tokyo');
    if (btnNyc) {
      btnNyc.addEventListener('click', () => {
        this.planner.loadTemplate('nyc-tokyo');
        this.renderPlanner();
        this.showToast('Loaded NYC & Tokyo showcase schedule!', 'success');
      });
    }

    const btnSa = this.dockedPlannerBody.querySelector('#btn-tpl-sa');
    if (btnSa) {
      btnSa.addEventListener('click', () => {
        this.planner.loadTemplate('south-america');
        this.renderPlanner();
        this.showToast('Loaded South America showcase schedule!', 'success');
      });
    }

    const btnEmptyAddFirst = this.dockedPlannerBody.querySelector('#btn-empty-add-first-day');
    if (btnEmptyAddFirst) {
      btnEmptyAddFirst.addEventListener('click', () => {
        this.planner.addDay('Monday');
        this.renderPlanner();
        this.showToast('Added Monday to itinerary!', 'success');
      });
    }

    const btnEmptyLoad = this.dockedPlannerBody.querySelector('#btn-docked-load-nyc');
    if (btnEmptyLoad) {
      btnEmptyLoad.addEventListener('click', () => {
        this.planner.loadTemplate('nyc-tokyo');
        this.renderPlanner();
      });
    }

    // Add Day
    const btnAddDay = this.dockedPlannerBody.querySelector('#btn-docked-add-day');
    if (btnAddDay) {
      btnAddDay.addEventListener('click', () => {
        const days = this.planner.getDays();
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const nextDay = dayNames[days.length % 7];
        this.planner.addDay(nextDay);
        this.renderPlanner();
        this.showToast(`Added ${nextDay} to schedule!`, 'success');
      });
    }

    // Invite
    const btnInvite = this.dockedPlannerBody.querySelector('#btn-docked-invite-top');
    if (btnInvite) {
      btnInvite.addEventListener('click', () => this.openInviteModal());
    }

    // Clear All Days
    const btnClear = this.dockedPlannerBody.querySelector('#btn-docked-clear');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        if (confirm('Clear all stops and days from this itinerary?')) {
          this.planner.clearPlan();
          this.renderPlanner();
          this.showToast('All stops cleared from itinerary.', 'info');
        }
      });
    }

    // Print
    const btnPrint = this.dockedPlannerBody.querySelector('#btn-docked-print');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => window.print());
    }

    // Day Actions (Remove Day)
    this.dockedPlannerBody.querySelectorAll('.btn-remove-day').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        this.planner.removeDay(idx);
        this.renderPlanner();
        this.showToast('Removed day from itinerary.', 'info');
      });
    });

    this.dockedPlannerBody.querySelectorAll('.btn-flyto-dest').forEach(btn => {
      btn.addEventListener('click', () => {
        const destId = btn.getAttribute('data-dest-id');
        const dest = this.planner.findDestination(destId);
        if (dest && this.onSelectDestination) {
          this.onSelectDestination(dest);
        }
      });
    });

    this.dockedPlannerBody.querySelectorAll('.btn-share-day-chat').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-day-idx'), 10);
        const day = itinerary[idx];
        if (day && this.chat) {
          this.switchPanelTab('chat');
          this.chat.shareItineraryCard({
            dayName: day.dayName,
            destinationName: day.destination ? day.destination.name : 'Transit',
            destinationId: day.destination ? day.destination.id : null,
            livingSpaceName: day.livingSpace ? day.livingSpace.name : 'No hotel selected',
            activityTitles: day.activities.map(a => a.title),
            notes: day.notes
          }, 'day');
          this.renderChat();
          this.showToast(`Shared ${day.dayName} schedule with trip crew!`, 'success');
        }
      });
    });

    this.dockedPlannerBody.querySelectorAll('.btn-remove-act-from-day').forEach(btn => {
      btn.addEventListener('click', () => {
        const dayIdx = parseInt(btn.getAttribute('data-day-idx'), 10);
        const actId = btn.getAttribute('data-act-id');
        this.planner.removeActivityFromDay(dayIdx, actId);
        this.renderPlanner();
      });
    });
  }

  renderItineraryDayCard(item) {
    const dest = item.destination;
    const destName = dest ? dest.name : 'En Route / Transit';

    return `
      <div class="timeline-day-card ${item.dayName === 'Monday' || item.dayName === 'Friday' ? 'showcase-highlight' : ''}">
        <div class="day-badge-col">
          <div class="day-name-title">${item.dayName}</div>
          <div class="day-date-sub">${item.date || 'Upcoming'}</div>
          ${dest ? `<button class="btn-flyto-dest" data-dest-id="${dest.id}" title="Focus on Map">🗺️ Explore</button>` : ''}
          <button class="btn-share-day-chat" data-day-idx="${item.index}" title="Share this day in chat">💬 Share</button>
        </div>

        <div class="day-content-col">
          <div class="day-content-header">
            <div>
              <h4 class="day-dest-title">${destName} ${dest ? `<span class="dest-flag">${dest.country}</span>` : ''}</h4>
              <div class="day-notes">${item.notes || ''}</div>
            </div>
            <button class="btn-remove-day" data-index="${item.index}" title="Remove this day">✕</button>
          </div>

          <!-- Transit Info -->
          ${item.transit ? `
            <div class="itinerary-transit-box">
              <span>✈️ <b>${item.transit.type}</b>: ${item.transit.from} &rarr; ${item.transit.to} (${item.transit.duration})</span>
              <span class="transit-price">+$${item.transit.estimatedCost}</span>
            </div>
          ` : ''}

          <!-- Chosen Living Space -->
          <div class="itinerary-item-row stay-row">
            <div class="item-icon">🏨</div>
            <div class="item-details">
              <div class="item-label">Living Space</div>
              ${item.livingSpace ? `
                <div class="item-title">${item.livingSpace.name}</div>
                <div class="item-sub">${item.livingSpace.type} &bull; ⭐ ${item.livingSpace.rating}</div>
              ` : `
                <div class="item-empty">No hotel selected yet.</div>
              `}
            </div>
            ${item.livingSpace ? `
              <div class="item-cost">$${item.livingSpace.pricePerNight} <small>/ nt</small></div>
            ` : ''}
          </div>

          <!-- Chosen Activities -->
          <div class="itinerary-item-row act-row">
            <div class="item-icon">🧭</div>
            <div class="item-details">
              <div class="item-label">Activities & Sights</div>
              ${item.activities.length ? `
                <div class="itinerary-acts-list">
                  ${item.activities.map(act => `
                    <div class="act-sub-item">
                      <div class="act-sub-info">
                        <b>${act.title}</b>
                        <span>⏱️ ${act.duration || '3 Hours'}</span>
                      </div>
                      <div class="act-sub-right">
                        <span class="act-price-badge">$${act.price}</span>
                        <button class="btn-remove-act-from-day" data-day-idx="${item.index}" data-act-id="${act.id}" title="Remove activity">✕</button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="item-empty">No activities scheduled yet.</div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // SOCIAL TRIP CHAT & DIRECT MESSAGING
  // ==========================================

  updateChatBadge() {
    if (!this.chat) return;
    const badge = document.getElementById('chat-unread-badge');
    if (!badge) return;

    const totalUnread = Object.values(this.chat.state.unreadCounts || {}).reduce((a, b) => a + b, 0);
    if (totalUnread > 0) {
      badge.textContent = totalUnread;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  switchChatChannel(channel) {
    if (!this.chat) return;
    this.chat.setActiveChannel(channel);
    this.renderChat();
    this.updateChatBadge();
  }

  renderChat() {
    if (!this.chat) return;
    const collaborators = this.chat.getCollaborators();

    // 1. Render DM chips in subheader
    if (this.dockedDmSubnav) {
      this.dockedDmSubnav.innerHTML = collaborators.map(c => `
        <button class="dm-chip-btn ${this.chat.activeChannel === c.username ? 'active' : ''}" data-channel="${c.username}">
          <span class="dm-avatar-mini">${c.avatar || '🧑'}</span>
          <span class="dm-username">@${c.username}</span>
          ${(this.chat.state.unreadCounts[c.username] || 0) > 0 ? `
            <span class="dm-unread-dot"></span>
          ` : ''}
        </button>
      `).join('');

      this.dockedDmSubnav.querySelectorAll('.dm-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const ch = btn.getAttribute('data-channel');
          this.switchChatChannel(ch);
        });
      });
    }

    // Update group button active state
    const groupBtn = document.querySelector('.chat-subnav-btn[data-channel="group"]');
    if (groupBtn) {
      groupBtn.classList.toggle('active', this.chat.activeChannel === 'group');
    }

    // 2. Render Message Stream
    if (!this.dockedChatMessages) return;
    const messages = this.chat.getMessages();

    if (!messages.length) {
      this.dockedChatMessages.innerHTML = `
        <div class="chat-empty-state">
          <span>💬</span>
          <h4>No messages in this channel yet</h4>
          <p>Send a message, discuss dates, or share your travel plan!</p>
        </div>
      `;
      return;
    }

    this.dockedChatMessages.innerHTML = messages.map(msg => {
      const isSelf = msg.sender.username === this.chat.currentUser.username;
      const isSys = msg.sender.username === 'system';

      if (isSys) {
        return `
          <div class="chat-sys-message">
            <span class="sys-bubble">${msg.text}</span>
          </div>
        `;
      }

      return `
        <div class="chat-message-row ${isSelf ? 'msg-self' : 'msg-other'}" data-msg-id="${msg.id}">
          <div class="msg-avatar">${msg.sender.avatar || '🧑'}</div>
          <div class="msg-content-block">
            <div class="msg-header">
              <span class="msg-author">${msg.sender.name}</span>
              <span class="msg-role-tag">${msg.sender.role}</span>
              <span class="msg-time">${msg.timestamp}</span>
            </div>
            
            ${msg.text ? `<div class="msg-bubble">${msg.text}</div>` : ''}

            <!-- Render Embedded Card if present -->
            ${msg.card ? this.renderChatCard(msg.card) : ''}

            <!-- Reaction Pills -->
            <div class="msg-reactions-row">
              ${Object.entries(msg.reactions || {}).map(([emoji, count]) => `
                <button class="reaction-pill" data-emoji="${emoji}" data-msg-id="${msg.id}">
                  ${emoji} <small>${count}</small>
                </button>
              `).join('')}
              <div class="quick-react-actions">
                <button class="btn-react-add" data-emoji="❤️" data-msg-id="${msg.id}">❤️</button>
                <button class="btn-react-add" data-emoji="👍" data-msg-id="${msg.id}">👍</button>
                <button class="btn-react-add" data-emoji="✈️" data-msg-id="${msg.id}">✈️</button>
                <button class="btn-react-add" data-emoji="🔥" data-msg-id="${msg.id}">🔥</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Scroll to bottom
    this.dockedChatMessages.scrollTop = this.dockedChatMessages.scrollHeight;

    // Reactions click events
    this.dockedChatMessages.querySelectorAll('.btn-react-add, .reaction-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const msgId = btn.getAttribute('data-msg-id');
        const emoji = btn.getAttribute('data-emoji');
        this.chat.toggleReaction(this.chat.activeChannel, msgId, emoji);
        this.renderChat();
      });
    });

    // Card Action clicks
    this.dockedChatMessages.querySelectorAll('.btn-chat-card-view').forEach(btn => {
      btn.addEventListener('click', () => {
        const destId = btn.getAttribute('data-dest-id');
        const dest = this.planner.findDestination(destId);
        if (dest && this.onSelectDestination) {
          this.onSelectDestination(dest);
        }
      });
    });
  }

  renderChatCard(card) {
    if (card.type === 'day_card') {
      return `
        <div class="chat-embedded-card">
          <div class="chat-card-tag">🗓️ SCHEDULED DAY</div>
          <h4 class="chat-card-title">${card.title}</h4>
          <div class="chat-card-stay">🏨 <b>Living Space:</b> ${card.livingSpaceName}</div>
          ${card.activityTitles && card.activityTitles.length ? `
            <div class="chat-card-acts">🧭 <b>Activities:</b> ${card.activityTitles.join(' &bull; ')}</div>
          ` : ''}
          ${card.notes ? `<div class="chat-card-notes">"${card.notes}"</div>` : ''}
          <div class="chat-card-footer">
            ${card.destinationId ? `
              <button class="btn btn-outline btn-xs btn-chat-card-view" data-dest-id="${card.destinationId}">
                🗺️ View on Map
              </button>
            ` : ''}
            <span class="chat-card-badge">Discussed in Crew</span>
          </div>
        </div>
      `;
    }

    if (card.type === 'plan_summary') {
      return `
        <div class="chat-embedded-card">
          <div class="chat-card-tag">🗺️ MASTER TRIP PLAN</div>
          <h4 class="chat-card-title">${card.title}</h4>
          <div class="chat-card-stay">📅 <b>Total Stops:</b> ${card.daysCount} Days scheduled</div>
          <div class="chat-card-footer">
            <button class="btn btn-cyan btn-xs" id="btn-jump-planner-tab">
              📅 View Full Itinerary
            </button>
          </div>
        </div>
      `;
    }

    return '';
  }

  handleSendChatMessage() {
    if (!this.chat || !this.dockedChatInput) return;
    const text = this.dockedChatInput.value.trim();
    if (!text) return;

    this.chat.sendMessage(text);
    this.dockedChatInput.value = '';
    this.renderChat();
  }

  shareCurrentItineraryDayToChat() {
    if (!this.chat) return;
    const days = this.planner.resolveItinerary();
    if (!days.length) {
      this.showToast('No days scheduled yet in your itinerary.', 'info');
      return;
    }

    const day = days[0];
    this.chat.shareItineraryCard({
      dayName: day.dayName,
      destinationName: day.destination ? day.destination.name : 'Transit',
      destinationId: day.destination ? day.destination.id : null,
      livingSpaceName: day.livingSpace ? day.livingSpace.name : 'No hotel selected',
      activityTitles: day.activities.map(a => a.title),
      notes: day.notes
    }, 'day');

    this.renderChat();
    this.showToast(`Shared ${day.dayName} schedule into chat!`, 'success');
  }

  // ==========================================
  // INVITE USER MODAL
  // ==========================================

  openInviteModal() {
    this.inviteModal.classList.remove('hidden');
    const input = document.getElementById('invite-username');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 100);
    }
  }

  closeInviteModal() {
    this.inviteModal.classList.add('hidden');
  }

  handleInviteUserSubmit() {
    const usernameInput = document.getElementById('invite-username');
    const nameInput = document.getElementById('invite-fullname');
    const roleSelect = document.getElementById('invite-role');

    if (!usernameInput || !usernameInput.value.trim()) return;

    const result = this.chat.inviteUser({
      username: usernameInput.value.trim(),
      name: nameInput ? nameInput.value.trim() : '',
      role: roleSelect ? roleSelect.value : 'Traveler'
    });

    if (result.success) {
      this.closeInviteModal();
      this.openSidePanel();
      this.switchPanelTab('chat');
      this.renderChat();
      this.updateChatBadge();
      this.showToast(`🎉 Invited @${result.collaborator.username} to your trip crew!`, 'success');
    } else {
      alert(result.message);
    }
  }

  // ==========================================
  // BOOKING MODAL
  // ==========================================

  openBookingModal(stay, dest) {
    this.bookingModal.classList.remove('hidden');

    this.bookingModalBody.innerHTML = `
      <div class="booking-dialog-container">
        <div class="booking-left-media" style="background-image: url('${stay.image}');">
          <div class="booking-badge-overlay">
            <span class="badge badge-cyan">${dest.name}, ${dest.country}</span>
            <span class="badge badge-emerald">⭐ ${stay.rating || 4.9}</span>
          </div>
          <div class="booking-quote">"${stay.description}"</div>
        </div>

        <div class="booking-right-form">
          <h2 class="booking-heading">Reserve Living Space</h2>
          <div class="booking-hotel-name">${stay.name}</div>
          <div class="booking-hotel-type">${stay.type} &bull; ${stay.address || dest.name}</div>

          <form id="booking-form" class="booking-form">
            <div class="form-row">
              <div class="form-group">
                <label>Check-In Date</label>
                <input type="date" class="form-control" value="2026-10-12" required />
              </div>
              <div class="form-group">
                <label>Check-Out Date</label>
                <input type="date" class="form-control" value="2026-10-15" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Guests</label>
                <select class="form-control">
                  <option>1 Guest</option>
                  <option selected>2 Guests</option>
                  <option>3 Guests</option>
                  <option>4+ Guests</option>
                </select>
              </div>
              <div class="form-group">
                <label>Room Tier</label>
                <select class="form-control">
                  <option selected>Signature Panoramic Suite</option>
                  <option>Executive Sky Villa (+$280/nt)</option>
                  <option>Presidential View Penthouse (+$600/nt)</option>
                </select>
              </div>
            </div>

            <div class="booking-price-breakdown">
              <div class="price-line">
                <span>$${stay.pricePerNight} x 3 nights</span>
                <span>$${stay.pricePerNight * 3}</span>
              </div>
              <div class="price-line">
                <span>Concierge & Hospitality Fee</span>
                <span>$85</span>
              </div>
              <div class="price-line">
                <span>Taxes & Regional Dues</span>
                <span>$115</span>
              </div>
              <div class="price-line total-line">
                <span>Total Due Now</span>
                <span class="grand-total-val">$${(stay.pricePerNight * 3 + 200).toLocaleString()} USD</span>
              </div>
            </div>

            <div class="booking-submit-actions">
              <button type="submit" class="btn btn-primary btn-block btn-lg">
                Confirm & Reserve Experience
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const form = this.bookingModalBody.querySelector('#booking-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.bookingModal.classList.add('hidden');
        this.showToast(`🎉 Reservation confirmed at ${stay.name}!`, 'success');
      });
    }
  }

  showToast(message, type = 'info') {
    if (!this.toastEl) return;
    this.toastEl.textContent = message;
    this.toastEl.className = `tf-toast show ${type}`;
    setTimeout(() => {
      this.toastEl.classList.remove('show');
    }, 3800);
  }
}
