/**
 * TravelFix UI Engine & Interaction Manager
 * Controls Universal Search Autocomplete, Side-by-Side Split Dashboard,
 * Travel Planner Schedule, Social Trip Chat & Direct Messaging,
 * Destination Explorer (Living Spaces & Activities), and Booking Checkout.
 */

import { UniversalSearchEngine, GLOBAL_GEO_INDEX } from './geo-search.js';
import { esc, safeUrl } from './escape.js';
import {
  WEEKDAYS, TIME_SLOT_PRESETS, DEFAULT_CHECK_IN,
  formatTime, describeSlot, normaliseSlot
} from './planner.js';

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

  closeSidePanel() {
    this.isPanelCollapsed = true;
    this.mainWorkspace.classList.add('panel-collapsed');
    this.navTabSplit.classList.remove('active');
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
        <img src="${safeUrl(item.image) || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=120&q=80'}" class="search-thumb" alt="${esc(item.name)}" />
        <div class="search-info">
          <div class="search-title">${esc(item.name)}</div>
          <div class="search-sub">${esc(item.country || 'Global Territory')} &bull; <span class="search-tag">${esc(item.type)}</span></div>
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
          <div class="ocean-quick-pick" data-dest="hawaii" data-label="Hawaii" style="cursor: pointer; background: rgba(11, 17, 30, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; transition: all 0.2s;">
            <div style="font-weight: 600; color: #fff; font-size: 13px;">🌺 Hawaii</div>
            <div style="font-size: 11px; color: #00f2fe;">United States</div>
          </div>
          <div class="ocean-quick-pick" data-dest="bali" data-label="Bali" style="cursor: pointer; background: rgba(11, 17, 30, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; transition: all 0.2s;">
            <div style="font-weight: 600; color: #fff; font-size: 13px;">🌴 Bali</div>
            <div style="font-size: 11px; color: #00f2fe;">Indonesia</div>
          </div>
          <div class="ocean-quick-pick" data-dest="santorini" data-label="Santorini" style="cursor: pointer; background: rgba(11, 17, 30, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; transition: all 0.2s;">
            <div style="font-weight: 600; color: #fff; font-size: 13px;">🏛️ Santorini</div>
            <div style="font-size: 11px; color: #00f2fe;">Greece</div>
          </div>
          <div class="ocean-quick-pick" data-dest="cape-town" data-label="Cape Town" style="cursor: pointer; background: rgba(11, 17, 30, 0.85); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; transition: all 0.2s;">
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
        this.selectQuickPick(el.dataset.dest, el.dataset.label || el.dataset.dest);
      });
    });
  }

  /**
   * Open a quick-pick destination. Catalogued destinations open directly;
   * anything not in the catalogue (Santorini, Cape Town) falls through to the
   * search box, which resolves it the same way a map click would.
   */
  selectQuickPick(destId, label) {
    if (!destId) return;
    const key = destId.toLowerCase();
    const catalogue = this.destinations || [];
    const found = catalogue.find(d =>
      d.id.toLowerCase() === key || d.name.toLowerCase().includes(key)
    );

    if (found) {
      if (this.onSelectDestination) this.onSelectDestination(found);
      return;
    }

    const term = (label || destId).replace(/-/g, ' ');
    if (this.searchInput) {
      this.searchInput.value = term;
      this.handleSearch(term);
      this.searchInput.focus();
    }
  }

  renderExplorer(dest) {
    if (!dest || !this.dockedExplorerBody) return;

    const stays = dest.livingSpaces || [];
    const acts = dest.activities || [];

    this.dockedExplorerBody.innerHTML = `
      <!-- Cover Banner -->
      <div class="explorer-hero" style="background-image: url('${safeUrl(dest.image)}');">
        <div class="hero-overlay"></div>
        <div class="hero-content">
          <span class="badge badge-cyan">${dest.continent || 'Global'} &bull; ${dest.tier ? dest.tier.toUpperCase() : 'DESTINATION'}</span>
          <h2 class="explorer-hero-title">${esc(dest.name)}</h2>
          <p class="explorer-hero-tagline">${esc(dest.tagline || dest.country || '')}</p>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div class="explorer-metrics-row">
        <div class="metric-box">
          <span class="m-icon">📍</span>
          <div>
            <span class="m-lbl">Country / Region</span>
            <span class="m-val">${esc(dest.country)}</span>
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
            <h4>About ${esc(dest.name)}</h4>
            <p>${esc(dest.description)}</p>
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
      addStopBtn.addEventListener('click', () => this.promptPickDayForDestination(dest));
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
                <img src="${safeUrl(stay.image)}" alt="${esc(stay.name)}" class="card-media" loading="lazy" />
                <span class="card-rating-badge">⭐ ${stay.rating || 4.9}</span>
              </div>
              <div class="card-body">
                <div class="card-type-tag">${esc(stay.type)}</div>
                <h4 class="card-title">${esc(stay.name)}</h4>
                <p class="card-desc">${esc(stay.description)}</p>
                
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
                <img src="${safeUrl(act.image)}" alt="${esc(act.title)}" class="card-media" loading="lazy" />
                <span class="card-rating-badge">⭐ ${act.rating || 4.95}</span>
                <span class="card-duration-badge">⏱️ ${act.duration || '3 Hours'}</span>
              </div>
              <div class="card-body">
                <div class="card-type-tag">${esc(act.category || 'Excursion')} &bull; ${esc(act.timeSlot || 'Flexible')}</div>
                <h4 class="card-title">${esc(act.title)}</h4>
                
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

  // ==========================================
  // SCHEDULING DIALOG (DAY + TIME SLOT)
  // ==========================================

  /** "05:30 AM - 10:30 AM" -> { start: '05:30', end: '10:30' }, or null. */
  parseSuggestedSlot(text) {
    if (!text) return null;
    const m = String(text).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*[-–—]\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!m) return null;
    const to24 = (h, min, period) => {
      let hour = parseInt(h, 10);
      if (period) {
        const p = period.toUpperCase();
        if (p === 'PM' && hour !== 12) hour += 12;
        if (p === 'AM' && hour === 12) hour = 0;
      }
      return `${String(hour).padStart(2, '0')}:${min}`;
    };
    return { start: to24(m[1], m[2], m[3]), end: to24(m[4], m[5], m[6]) };
  }

  /**
   * One dialog for every scheduling decision: adding a stay or activity, and
   * moving or retiming one that is already on the plan.
   *
   * kind          'stay' | 'activity'
   * item          the living space or activity object
   * destination   where it belongs (may be null when rescheduling)
   * fromDayIndex  set when the item is already scheduled (enables move/remove)
   */
  openScheduleDialog({ kind, item, destination = null, fromDayIndex = null }) {
    const isReschedule = fromDayIndex !== null;
    const days = this.planner.getDays();
    const title = kind === 'stay' ? item.name : item.title;
    const price = kind === 'stay' ? `$${item.pricePerNight}/night` : `$${item.price}`;

    // Preselect: the day it is already on, else the first day at this
    // destination, else the first day with nothing scheduled, else Monday.
    let selectedDay = isReschedule ? fromDayIndex : days.findIndex(d => destination && d.destinationId === destination.id);
    if (selectedDay < 0) selectedDay = days.findIndex(d => !d.stay && !(d.activities || []).length);
    if (selectedDay < 0) selectedDay = 0;

    // Preselect a time: whatever it already has, else the activity's own
    // suggested slot, else a sensible default for the kind.
    let currentSlot = null;
    if (isReschedule) {
      const day = days[fromDayIndex];
      currentSlot = kind === 'stay'
        ? (day.stay && day.stay.slot)
        : ((day.activities || []).find(a => a.activityId === item.id) || {}).slot;
    }
    if (!currentSlot && kind === 'activity') {
      const suggested = this.parseSuggestedSlot(item.timeSlot);
      if (suggested) currentSlot = { id: 'custom', label: 'Suggested', ...suggested };
    }
    if (!currentSlot) currentSlot = kind === 'stay' ? { ...DEFAULT_CHECK_IN } : { ...TIME_SLOT_PRESETS[0] };

    let selectedSlot = normaliseSlot(currentSlot);

    const dayChips = days.map((d, idx) => {
      const busy = (d.activities || []).length + (d.stay ? 1 : 0);
      return `
        <button type="button" class="day-chip ${idx === selectedDay ? 'active' : ''}" data-day-index="${idx}">
          <span class="day-chip-name">${esc(d.dayName.slice(0, 3))}</span>
          <span class="day-chip-date">${esc(this.planner.getDayDate(idx))}</span>
          ${busy ? `<span class="day-chip-count">${busy}</span>` : ''}
        </button>`;
    }).join('');

    const presetChips = TIME_SLOT_PRESETS.map(sl => `
      <button type="button" class="slot-chip ${selectedSlot.id === sl.id ? 'active' : ''}" data-slot-id="${esc(sl.id)}">
        <span class="slot-chip-name">${esc(sl.label)}</span>
        <span class="slot-chip-time">${esc(formatTime(sl.start))} – ${esc(formatTime(sl.end))}</span>
      </button>`).join('');

    const isCustom = !TIME_SLOT_PRESETS.some(sl => sl.id === selectedSlot.id);

    const container = document.createElement('div');
    container.innerHTML = `
      <div class="quick-modal-overlay tf-schedule-overlay">
        <div class="quick-modal-content schedule-dialog">
          <h3>${isReschedule ? 'Reschedule' : (kind === 'stay' ? 'Add Living Space to Plan' : 'Add Activity to Plan')}</h3>
          <p class="schedule-subject">
            <b>${esc(title)}</b>
            <span class="schedule-price">${esc(price)}</span>
            ${destination ? `<span class="schedule-dest">${esc(destination.name)}</span>` : ''}
          </p>

          <div class="schedule-section">
            <label class="schedule-label">Which day?</label>
            <div class="day-chip-row">${dayChips}</div>
          </div>

          <div class="schedule-section">
            <label class="schedule-label">${kind === 'stay' ? 'Check-in time' : 'Time slot'}</label>
            <div class="slot-chip-row">
              ${presetChips}
              <button type="button" class="slot-chip slot-chip-custom ${isCustom ? 'active' : ''}" data-slot-id="custom">
                <span class="slot-chip-name">Custom</span>
                <span class="slot-chip-time">Set exact times</span>
              </button>
            </div>
            <div class="custom-time-row" ${isCustom ? '' : 'hidden'}>
              <label>Start <input type="time" class="sched-start" value="${esc(selectedSlot.start)}"></label>
              <label>End <input type="time" class="sched-end" value="${esc(selectedSlot.end)}"></label>
            </div>
          </div>

          <div class="quick-modal-buttons">
            <button type="button" class="btn btn-secondary btn-sched-cancel">Cancel</button>
            ${isReschedule ? '<button type="button" class="btn btn-danger btn-sched-remove">Remove from plan</button>' : ''}
            <button type="button" class="btn btn-primary btn-sched-confirm">
              ${isReschedule ? 'Save changes' : 'Add to plan'}
            </button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(container);

    const customRow = container.querySelector('.custom-time-row');
    const startInput = container.querySelector('.sched-start');
    const endInput = container.querySelector('.sched-end');
    const close = () => container.remove();

    container.querySelectorAll('.day-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        container.querySelectorAll('.day-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedDay = parseInt(chip.dataset.dayIndex, 10);
      });
    });

    container.querySelectorAll('.slot-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        container.querySelectorAll('.slot-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const id = chip.dataset.slotId;
        if (id === 'custom') {
          customRow.hidden = false;
          selectedSlot = { id: 'custom', label: 'Custom', start: startInput.value, end: endInput.value };
        } else {
          customRow.hidden = true;
          selectedSlot = { ...TIME_SLOT_PRESETS.find(s => s.id === id) };
        }
      });
    });

    [startInput, endInput].forEach(input => {
      input.addEventListener('change', () => {
        selectedSlot = { id: 'custom', label: 'Custom', start: startInput.value, end: endInput.value };
      });
    });

    container.querySelector('.btn-sched-cancel').addEventListener('click', close);
    container.querySelector('.tf-schedule-overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('tf-schedule-overlay')) close();
    });

    const removeBtn = container.querySelector('.btn-sched-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (kind === 'stay') this.planner.removeDayStay(fromDayIndex);
        else this.planner.removeActivityFromDay(fromDayIndex, item.id);
        close();
        this.renderPlanner();
        this.showToast(`Removed ${title} from your plan`, 'info');
      });
    }

    container.querySelector('.btn-sched-confirm').addEventListener('click', () => {
      const dayName = this.planner.getDay(selectedDay).dayName;

      if (kind === 'stay') {
        if (isReschedule) this.planner.moveStay(fromDayIndex, selectedDay, selectedSlot);
        else this.planner.setDayStay(selectedDay, item.id, selectedSlot, destination);
      } else {
        if (isReschedule) this.planner.moveActivity(fromDayIndex, item.id, selectedDay, selectedSlot);
        else this.planner.addActivityToDay(selectedDay, item.id, selectedSlot, destination);
      }

      close();
      this.renderPlanner();
      this.showToast(
        `${isReschedule ? 'Moved' : 'Added'} ${title} — ${dayName}, ${describeSlot(selectedSlot)}`,
        'success'
      );
    });
  }

  promptAssignStayToDay(stay, dest) {
    this.openScheduleDialog({ kind: 'stay', item: stay, destination: dest });
  }

  /**
   * "Add as a stop" from the explorer: pick which day this destination
   * belongs to, without committing to a specific hotel or activity yet.
   */
  promptPickDayForDestination(dest) {
    if (!dest) return;
    const container = document.createElement('div');
    const chips = this.planner.getDays().map((d, idx) => `
      <button type="button" class="day-chip" data-day-index="${idx}">
        <span class="day-chip-name">${esc(d.dayName.slice(0, 3))}</span>
        <span class="day-chip-date">${esc(this.planner.getDayDate(idx))}</span>
      </button>`).join('');

    container.innerHTML = `
      <div class="quick-modal-overlay tf-schedule-overlay">
        <div class="quick-modal-content schedule-dialog">
          <h3>Add Stop to Plan</h3>
          <p class="schedule-subject"><b>${esc(dest.name)}</b>
            <span class="schedule-dest">${esc(dest.country || '')}</span></p>
          <div class="schedule-section">
            <label class="schedule-label">Which day are you here?</label>
            <div class="day-chip-row">${chips}</div>
          </div>
          <div class="quick-modal-buttons">
            <button type="button" class="btn btn-secondary btn-sched-cancel">Cancel</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(container);

    const close = () => container.remove();
    container.querySelector('.btn-sched-cancel').addEventListener('click', close);
    container.querySelector('.tf-schedule-overlay').addEventListener('click', (e) => {
      if (e.target.classList.contains('tf-schedule-overlay')) close();
    });
    container.querySelectorAll('.day-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const idx = parseInt(chip.dataset.dayIndex, 10);
        this.planner.setDayDestination(idx, dest);
        close();
        this.renderPlanner();
        this.showToast(`${dest.name} set as ${this.planner.getDay(idx).dayName}'s stop`, 'success');
      });
    });
  }

  promptAddActivityToDay(act, dest) {
    this.openScheduleDialog({ kind: 'activity', item: act, destination: dest });
  }

  // ==========================================
  // TRAVEL PLANNER (MULTI-DAY ITINERARY)
  // ==========================================

  renderPlannerBadge() {
    const badge = document.getElementById('planner-count-badge');
    if (!badge) return;
    // The week is always seven days, so the useful number is how many of
    // them actually have something on them.
    const planned = this.planner.getScheduledDays().length;
    badge.textContent = planned ? `${planned}/7 Days` : 'Empty';
  }

  renderPlanner() {
    this.renderPlannerBadge();
    if (!this.dockedPlannerBody) return;

    const itinerary = this.planner.resolveItinerary();
    const budget = this.planner.calculateBudget();
    const allPlans = this.planner.getAllPlans();
    const activePlan = this.planner.plan;
    const scheduledCount = itinerary.filter(d => !d.isEmpty).length;

    this.dockedPlannerBody.innerHTML = `
      <!-- Header Summary Banner -->
      <div class="planner-docked-banner">
        <div class="planner-docked-title-row">
          <div>
            <span class="badge badge-cyan">TRIP SCHEDULE</span>
            <h3 class="docked-title">${esc(activePlan.title || 'World Journey')}</h3>
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
              <option value="${esc(p.id)}" ${p.id === activePlan.id ? 'selected' : ''}>${esc(p.title)}</option>
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

      <!-- Week start date -->
      <div class="planner-week-row">
        <label class="t-lbl" for="input-plan-start">Week starting</label>
        <input type="date" id="input-plan-start" class="plan-date-input" value="${esc(activePlan.startDate || '')}">
        <span class="planner-week-hint">${scheduledCount} of 7 days planned</span>
      </div>

      <!-- Action Buttons -->
      <div class="planner-docked-actions">
        <button class="btn btn-outline btn-sm" id="btn-docked-invite-top">\u{1F465} Invite Collaborators</button>
        <button class="btn btn-secondary btn-sm" id="btn-docked-clear">\u2715 Clear Plan</button>
        <button class="btn btn-secondary btn-sm" id="btn-docked-print">\u{1F5A8}\u{FE0F} Print</button>
      </div>

      <!-- Timeline Days List: always the full week -->
      <div class="docked-timeline-list">
        ${itinerary.map(item => this.renderItineraryDayCard(item)).join('')}
      </div>

      ${scheduledCount === 0 ? `
        <div class="empty-timeline-card">
          <div style="font-size: 30px; margin-bottom: 6px;">\u{1F5FA}\u{FE0F}</div>
          <h4>Nothing scheduled yet</h4>
          <p>Search a destination or click anywhere on the map, then add a stay or an activity. You will be asked which day and what time.</p>
        </div>
      ` : ''}
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

    // Week start date
    const inputStart = this.dockedPlannerBody.querySelector('#input-plan-start');
    if (inputStart) {
      inputStart.addEventListener('change', (e) => {
        if (this.planner.setStartDate(e.target.value)) {
          this.renderPlanner();
        }
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

    // Clear a single day (the day itself stays in the week)
    this.dockedPlannerBody.querySelectorAll('.btn-clear-day').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const dayName = this.planner.getDay(idx).dayName;
        this.planner.clearDay(idx);
        this.renderPlanner();
        this.showToast(`Cleared ${dayName}.`, 'info');
      });
    });

    // Move / retime an already-scheduled stay or activity
    this.dockedPlannerBody.querySelectorAll('.btn-reschedule').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dayIdx = parseInt(btn.getAttribute('data-day-idx'), 10);
        const kind = btn.getAttribute('data-kind');
        const day = this.planner.getDay(dayIdx);
        if (!day) return;

        if (kind === 'stay') {
          const found = this.planner.findLivingSpace(day.stay && day.stay.livingSpaceId);
          if (found) {
            this.openScheduleDialog({
              kind: 'stay', item: found.stay, destination: found.destination, fromDayIndex: dayIdx
            });
          }
        } else {
          const found = this.planner.findActivity(btn.getAttribute('data-act-id'));
          if (found) {
            this.openScheduleDialog({
              kind: 'activity', item: found.activity, destination: found.destination, fromDayIndex: dayIdx
            });
          }
        }
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
    const destName = dest ? dest.name : (item.isEmpty ? 'Nothing planned' : 'En Route / Transit');

    return `
      <div class="timeline-day-card ${item.isEmpty ? 'day-empty' : ''}">
        <div class="day-badge-col">
          <div class="day-name-title">${esc(item.dayName)}</div>
          <div class="day-date-sub">${esc(item.date || '')}</div>
          ${dest ? `<button class="btn-flyto-dest" data-dest-id="${esc(dest.id)}" title="Focus on map">\u{1F5FA}\u{FE0F} Explore</button>` : ''}
          ${!item.isEmpty ? `<button class="btn-share-day-chat" data-day-idx="${item.index}" title="Share this day in chat">\u{1F4AC} Share</button>` : ''}
        </div>

        <div class="day-content-col">
          <div class="day-content-header">
            <div>
              <h4 class="day-dest-title">${esc(destName)} ${dest ? `<span class="dest-flag">${esc(dest.country)}</span>` : ''}</h4>
              <div class="day-notes">${esc(item.notes || '')}</div>
            </div>
            ${!item.isEmpty ? `<button class="btn-clear-day" data-index="${item.index}" title="Clear this day">\u2715</button>` : ''}
          </div>

          ${item.transit ? `
            <div class="itinerary-transit-box">
              <span>\u2708\u{FE0F} <b>${esc(item.transit.type)}</b>: ${esc(item.transit.from)} &rarr; ${esc(item.transit.to)} (${esc(item.transit.duration)})</span>
              <span class="transit-price">+$${item.transit.estimatedCost}</span>
            </div>
          ` : ''}

          <div class="itinerary-item-row stay-row">
            <div class="item-icon">\u{1F3E8}</div>
            <div class="item-details">
              <div class="item-label">Living Space</div>
              ${item.livingSpace ? `
                <div class="item-title">${esc(item.livingSpace.name)}</div>
                <div class="item-sub">${esc(item.livingSpace.type)} &bull; \u2B50 ${esc(item.livingSpace.rating)}</div>
                <div class="item-slot">\u{1F552} ${esc(describeSlot(item.staySlot))}</div>
              ` : `
                <div class="item-empty">No stay booked for this day.</div>
              `}
            </div>
            ${item.livingSpace ? `
              <div class="item-actions-col">
                <div class="item-cost">$${item.livingSpace.pricePerNight} <small>/ nt</small></div>
                <button class="btn-reschedule" data-kind="stay" data-day-idx="${item.index}" title="Change day or time">Move</button>
              </div>
            ` : ''}
          </div>

          <div class="itinerary-item-row act-row">
            <div class="item-icon">\u{1F9ED}</div>
            <div class="item-details">
              <div class="item-label">Activities &amp; Sights</div>
              ${item.activities.length ? `
                <div class="itinerary-acts-list">
                  ${item.activities.map(act => `
                    <div class="act-sub-item">
                      <div class="act-sub-info">
                        <b>${esc(act.title)}</b>
                        <span class="act-sub-slot">\u{1F552} ${esc(describeSlot(act.slot))}</span>
                        <span>\u23F1\u{FE0F} ${esc(act.duration || '3 Hours')}</span>
                      </div>
                      <div class="act-sub-right">
                        <span class="act-price-badge">$${act.price}</span>
                        <button class="btn-reschedule" data-kind="activity" data-day-idx="${item.index}" data-act-id="${esc(act.id)}" title="Change day or time">Move</button>
                        <button class="btn-remove-act-from-day" data-day-idx="${item.index}" data-act-id="${esc(act.id)}" title="Remove activity">\u2715</button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              ` : `
                <div class="item-empty">Nothing scheduled.</div>
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

  /**
   * True when the Trip Chat tab is the active view in the docked panel
   * and the panel itself is not collapsed.
   */
  isChatPanelVisible() {
    const panel = document.getElementById('panel-content-chat');
    if (!panel || !panel.classList.contains('active')) return false;
    const workspace = document.getElementById('main-workspace');
    return !(workspace && workspace.classList.contains('panel-collapsed'));
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
        <button class="dm-chip-btn ${this.chat.activeChannel === c.username ? 'active' : ''}" data-channel="${esc(c.username)}">
          <span class="dm-avatar-mini">${esc(c.avatar || '🧑')}</span>
          <span class="dm-username">@${esc(c.username)}</span>
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
            <span class="sys-bubble">${esc(msg.text)}</span>
          </div>
        `;
      }

      return `
        <div class="chat-message-row ${isSelf ? 'msg-self' : 'msg-other'}" data-msg-id="${esc(msg.id)}">
          <div class="msg-avatar">${esc(msg.sender.avatar || '🧑')}</div>
          <div class="msg-content-block">
            <div class="msg-header">
              <span class="msg-author">${esc(msg.sender.name)}</span>
              <span class="msg-role-tag">${esc(msg.sender.role)}</span>
              <span class="msg-time">${esc(msg.timestamp)}</span>
            </div>
            
            ${msg.text ? `<div class="msg-bubble">${esc(msg.text)}</div>` : ''}

            <!-- Render Embedded Card if present -->
            ${msg.card ? this.renderChatCard(msg.card) : ''}

            <!-- Reaction Pills -->
            <div class="msg-reactions-row">
              ${Object.entries(msg.reactions || {}).map(([emoji, count]) => `
                <button class="reaction-pill" data-emoji="${esc(emoji)}" data-msg-id="${esc(msg.id)}">
                  ${emoji} <small>${count}</small>
                </button>
              `).join('')}
              <div class="quick-react-actions">
                <button class="btn-react-add" data-emoji="❤️" data-msg-id="${esc(msg.id)}">❤️</button>
                <button class="btn-react-add" data-emoji="👍" data-msg-id="${esc(msg.id)}">👍</button>
                <button class="btn-react-add" data-emoji="✈️" data-msg-id="${esc(msg.id)}">✈️</button>
                <button class="btn-react-add" data-emoji="🔥" data-msg-id="${esc(msg.id)}">🔥</button>
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
          <h4 class="chat-card-title">${esc(card.title)}</h4>
          <div class="chat-card-stay">🏨 <b>Living Space:</b> ${esc(card.livingSpaceName)}</div>
          ${card.activityTitles && card.activityTitles.length ? `
            <div class="chat-card-acts">🧭 <b>Activities:</b> ${card.activityTitles.map(esc).join(' &bull; ')}</div>
          ` : ''}
          ${card.notes ? `<div class="chat-card-notes">"${esc(card.notes)}"</div>` : ''}
          <div class="chat-card-footer">
            ${card.destinationId ? `
              <button class="btn btn-outline btn-xs btn-chat-card-view" data-dest-id="${esc(card.destinationId)}">
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
          <h4 class="chat-card-title">${esc(card.title)}</h4>
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
    const days = this.planner.getScheduledDays();
    if (!days.length) {
      this.showToast('Nothing scheduled yet — add a stay or activity first.', 'info');
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
        <div class="booking-left-media" style="background-image: url('${safeUrl(stay.image)}');">
          <div class="booking-badge-overlay">
            <span class="badge badge-cyan">${esc(dest.name)}, ${esc(dest.country)}</span>
            <span class="badge badge-emerald">⭐ ${stay.rating || 4.9}</span>
          </div>
          <div class="booking-quote">"${esc(stay.description)}"</div>
        </div>

        <div class="booking-right-form">
          <h2 class="booking-heading">Reserve Living Space</h2>
          <div class="booking-hotel-name">${esc(stay.name)}</div>
          <div class="booking-hotel-type">${esc(stay.type)} &bull; ${esc(stay.address || dest.name)}</div>

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
        // Booking is not a real reservation, so the useful outcome is putting
        // the stay on the plan — which still needs a day and a check-in time.
        this.openScheduleDialog({ kind: 'stay', item: stay, destination: dest });
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
