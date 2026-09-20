/**
 * TravelFix 2D World & Regional Map Engine
 * Leaflet-powered interactive 2D map of Earth with:
 * - Worldwide zoom from planetary overview down to cities, towns, and street level
 * - Click-to-explore on ANY country, city, state, or territory worldwide with live reverse geocoding
 * - Dynamic generation and display of living spaces (hotels/villas) and activities
 * - High-resolution dark cartography, satellite imagery, and navigation layers
 * - Hotspot markers for popular travel locations
 */

import { UniversalSearchEngine, POPULAR_TRAVEL_HOTSPOTS } from './geo-search.js';
import { DESTINATIONS } from './data.js';
import { esc, safeUrl } from './escape.js';

export class TravelFixRegionalMap {
  constructor(mapContainerId, { onSelectDestination, onSelectLivingSpace, onSelectActivity, onMapClick, onOceanClick }) {
    this.containerId = mapContainerId;
    this.onSelectDestination = onSelectDestination;
    this.onSelectLivingSpace = onSelectLivingSpace;
    this.onSelectActivity = onSelectActivity;
    this.onMapClick = onMapClick;
    this.onOceanClick = onOceanClick;

    this.map = null;
    this.markersGroup = null;
    this.hotspotsGroup = null;
    this.clickMarker = null;
    this.activeLayer = 'dark'; // default to luxury dark theme
    this.currentDestination = null;
    this.searchEngine = new UniversalSearchEngine();
    this.isReverseGeocoding = false;

    this.init();
  }

  init() {
    if (!window.L) {
      console.warn('Leaflet library not yet loaded.');
      return;
    }

    // Initialize Leaflet Map centered on global view
    this.map = L.map(this.containerId, {
      zoomControl: false,
      attributionControl: false,
      minZoom: 2,
      maxZoom: 18,
      worldCopyJump: true
    }).setView([20, 0], 3);

    // Zoom control in top right
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // High quality, 100% clean Tile Layers (Zero watermarks, no API key required)
    const darkBase = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
    });
    const darkLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: ''
    });

    this.tileLayers = {
      dark: L.layerGroup([darkBase, darkLabels]),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP'
      }),
      streets: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, METI'
      })
    };

    // Add default dark layer
    this.tileLayers[this.activeLayer].addTo(this.map);

    // Marker feature groups
    this.hotspotsGroup = L.featureGroup().addTo(this.map);
    this.markersGroup = L.featureGroup().addTo(this.map);

    // Render global travel hotspots on the 2D map
    this.renderGlobalHotspots();

    // Map Click Listener - Click anywhere on Earth to explore living spaces & activities
    this.map.on('click', (e) => {
      this.handleMapClick(e.latlng.lat, e.latlng.lng);
    });
  }

  setLayer(layerName) {
    if (!this.map || !this.tileLayers[layerName]) return;
    this.activeLayer = layerName;

    Object.values(this.tileLayers).forEach(layer => {
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer);
      }
    });

    this.tileLayers[layerName].addTo(this.map);
  }

  /**
   * Render glowing hotspot markers across major worldwide travel hubs
   */
  renderGlobalHotspots() {
    if (!this.hotspotsGroup) return;
    this.hotspotsGroup.clearLayers();

    POPULAR_TRAVEL_HOTSPOTS.forEach(spot => {
      const icon = L.divIcon({
        className: 'tf-hotspot-pin-wrapper',
        html: `
          <div class="custom-hotspot-pin">
            <div class="hotspot-pulse"></div>
            <div class="hotspot-dot"></div>
            <div class="hotspot-title">${esc(spot.name)}</div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: icon }).addTo(this.hotspotsGroup);
      
      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        // Find matching curated destination or create dynamic one
        const dest = DESTINATIONS.find(d => d.id === spot.id || d.name.toLowerCase() === spot.name.toLowerCase()) ||
                     this.searchEngine.createDynamicDestination({
                       id: spot.id,
                       name: spot.name,
                       country: spot.country,
                       type: 'Global City',
                       lat: spot.lat,
                       lng: spot.lng,
                       image: spot.image
                     });
        
        if (this.onSelectDestination) {
          this.onSelectDestination(dest);
        }
      });
    });
  }

  /**
   * Handle user clicking any arbitrary point on Earth.
   * Detects ocean clicks and shows appropriate messaging or nearest land.
   */
  async handleMapClick(lat, lng) {
    if (this.isReverseGeocoding) return;
    this.isReverseGeocoding = true;

    // Show temporary pulsing pin at clicked coordinates
    this.showClickedLocationPin(lat, lng, 'Discovering Location...');

    try {
      // 1. Check if clicked near an existing curated destination (within ~30km)
      const nearbyCurated = DESTINATIONS.find(d => {
        const dLat = Math.abs(d.lat - lat);
        const dLng = Math.abs(d.lng - lng);
        return dLat < 0.25 && dLng < 0.25;
      });

      if (nearbyCurated) {
        this.isReverseGeocoding = false;
        if (this.onSelectDestination) {
          this.onSelectDestination(nearbyCurated);
        }
        return;
      }

      // 2. Reverse Geocode with OpenStreetMap Nominatim
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
      const response = await fetch(url, {
        headers: { 'Accept-Language': 'en-US,en;q=0.9' }
      });

      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const osmType = (data.type || '').toLowerCase();
        const osmClass = (data.class || '').toLowerCase();
        const displayName = (data.display_name || '').toLowerCase();

        // ---- OCEAN / WATER DETECTION ----
        // Treat as ocean only when no meaningful land address fields are present.
        const hasLandInfo = address.city || address.town || address.village || address.state || address.country || address.county || data.name;
        const isOcean = (
          !hasLandInfo && (
            osmClass === 'natural' && ['sea', 'ocean', 'water', 'bay', 'strait', 'sound'].includes(osmType) ||
            osmClass === 'waterway' ||
            osmType === 'ocean' || osmType === 'sea' ||
            displayName.includes('ocean') || displayName.includes(' sea') ||
            (data.error && data.error.toLowerCase().includes('unable to geocode'))
          )
        );

        if (isOcean) {
          // Try to find nearest land by searching outward
          await this.handleOceanClick(lat, lng, data.display_name || 'Open Ocean');
          return;
        }

        // If location is within a US state, check if we have a curated state entry
        if (address.country_code === 'us' && address.state) {
          const matchedState = DESTINATIONS.find(d => 
            d.tier === 'state' && (d.name.toLowerCase() === address.state.toLowerCase() || d.stateCode?.toLowerCase() === address.state.toLowerCase())
          );
          if (matchedState && !address.city && !address.town) {
            this.showClickedLocationPin(lat, lng, `${matchedState.name}, United States`);
            if (this.onSelectDestination) {
              this.onSelectDestination(matchedState);
            }
            return;
          }
        }

        const placeName = address.city || address.town || address.village || address.suburb || address.municipality || address.county || address.state || data.name || `Point (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;
        const country = address.country || 'Global Territory';
        const countryCode = address.country_code || '';
        const type = address.city ? 'City' : (address.town || address.village ? 'Town' : (address.state ? 'State / Region' : 'Location'));

        // Create basic dynamic destination first
        let dynamicDest = this.searchEngine.createDynamicDestination({
          id: `geo-${Math.abs(Math.round(lat * 100))}-${Math.abs(Math.round(lng * 100))}`,
          name: placeName,
          country: country,
          countryCode: countryCode,
          type: type,
          lat: lat,
          lng: lng,
          address: address
        });

        // Attempt to enrich with real hotels/activities via Overpass API
        if (this.searchEngine.enrichDynamicDestination) {
          dynamicDest = await this.searchEngine.enrichDynamicDestination(dynamicDest);
        }

        this.showClickedLocationPin(lat, lng, `${placeName}, ${country}`);

        if (this.onSelectDestination) {
          this.onSelectDestination(dynamicDest);
        }
      } else {
        throw new Error('Reverse geocoding response not ok');
      }
    } catch (err) {
      console.warn('Reverse geocoding network/parsing error:', err);
      // Fallback: Create dynamic coordinate destination for land point if network glitch
      const fallbackDest = this.searchEngine.createDynamicDestination({
        id: `coord-${Math.abs(Math.round(lat * 100))}-${Math.abs(Math.round(lng * 100))}`,
        name: `Location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`,
        country: 'Earth Explorer',
        type: 'Regional Point',
        lat: lat,
        lng: lng
      });

      this.showClickedLocationPin(lat, lng, `Location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`);

      if (this.onSelectDestination) {
        this.onSelectDestination(fallbackDest);
      }
    } finally {
      this.isReverseGeocoding = false;
    }
  }

  /**
   * Handles clicks that land in open ocean or unclaimed water.
   * Tries to find the nearest named landmass or island using a wider search.
   * If nothing useful is found, shows a friendly "no booking" message.
   */
  async handleOceanClick(lat, lng, originalLabel) {
    // Show ocean indicator
    this.showClickedLocationPin(lat, lng, '🌊 Open Ocean...');

    // Try zooming out to find nearest land via Nominatim at lower zoom
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=5&addressdetails=1`;
      const resp = await fetch(url, { headers: { 'Accept-Language': 'en-US,en;q=0.9' } });
      if (resp.ok) {
        const data = await resp.json();
        const address = data.address || {};
        const osmType = (data.type || '').toLowerCase();
        const osmClass = (data.class || '').toLowerCase();

        // If at zoom=5 we still get water, genuinely in the ocean
        const stillWater = osmClass === 'natural' && ['sea', 'ocean', 'water', 'bay', 'strait'].includes(osmType) ||
          (!address.country && !address.state);

        if (!stillWater && (address.country || address.state || data.name)) {
          const placeName = data.name || address.state || address.country || 'Nearby Territory';
          const country = address.country || 'Global Territory';
          const dynamicDest = this.searchEngine.createDynamicDestination({
            id: `geo-ocean-${Math.abs(Math.round(lat * 100))}-${Math.abs(Math.round(lng * 100))}`,
            name: placeName,
            country: country,
            type: 'Island / Coastal Territory',
            lat: parseFloat(data.lat) || lat,
            lng: parseFloat(data.lon) || lng,
            address: address
          });

          this.showClickedLocationPin(lat, lng, `Nearest: ${placeName}`);
          if (this.onSelectDestination) {
            this.onSelectDestination(dynamicDest);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Ocean nearest-land lookup failed:', e);
    }

    // Nothing found — show ocean "cannot book" panel
    this.showClickedLocationPin(lat, lng, '🌊 Open Ocean');
    if (this.onOceanClick) {
      this.onOceanClick(lat, lng);
    }
  }

  showClickedLocationPin(lat, lng, label) {
    if (this.clickMarker) {
      this.map.removeLayer(this.clickMarker);
    }

    const clickIcon = L.divIcon({
      className: 'tf-click-pin-wrapper',
      html: `
        <div class="custom-click-pin">
          <div class="click-ripple"></div>
          <div class="click-core">📍</div>
          <div class="click-bubble">${esc(label)}</div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    this.clickMarker = L.marker([lat, lng], { icon: clickIcon }).addTo(this.map);
  }

  focusDestination(destination) {
    if (!this.map) return;
    this.currentDestination = destination;

    const targetZoom = destination.tier === 'town' ? 14 : (destination.tier === 'city' ? 12 : 10);

    // Center map on destination with smooth flyTo animation
    this.map.flyTo([destination.lat, destination.lng], targetZoom, {
      duration: 1.4,
      easeLinearity: 0.25
    });

    this.renderMarkers(destination);
  }

  renderMarkers(destination) {
    if (!this.markersGroup) return;
    this.markersGroup.clearLayers();

    // 1. Destination Main Marker
    const mainIcon = L.divIcon({
      className: 'tf-main-marker',
      html: `
        <div class="custom-pin-root dest-center">
          <div class="pin-ring"></div>
          <div class="pin-core">★</div>
          <div class="pin-label">${esc(destination.name)}</div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    L.marker([destination.lat, destination.lng], { icon: mainIcon })
      .addTo(this.markersGroup)
      .bindPopup(`
        <div class="tf-popup">
          <div class="tf-popup-tag">Destination Center</div>
          <h4>${esc(destination.name)}, ${esc(destination.country)}</h4>
          <p>${esc(destination.tagline || '')}</p>
        </div>
      `);

    // 2. Living Spaces Markers
    if (destination.livingSpaces) {
      destination.livingSpaces.forEach((stay, index) => {
        const offsetLat = stay.lat || (destination.lat + (index === 0 ? 0.005 : -0.004));
        const offsetLng = stay.lng || (destination.lng + (index === 0 ? 0.006 : -0.005));

        const stayIcon = L.divIcon({
          className: 'tf-stay-marker',
          html: `
            <div class="custom-pin-root stay-pin">
              <div class="pin-badge">$${stay.pricePerNight}</div>
              <div class="pin-symbol">🏨</div>
            </div>
          `,
          iconSize: [48, 30],
          iconAnchor: [24, 15]
        });

        const stayMarker = L.marker([offsetLat, offsetLng], { icon: stayIcon })
          .addTo(this.markersGroup);

        stayMarker.bindPopup(`
          <div class="tf-popup stay-popup">
            <img src="${safeUrl(stay.image)}" alt="${esc(stay.name)}" class="popup-thumb" />
            <div class="tf-popup-tag">Living Space &bull; ⭐ ${stay.rating || 4.9}</div>
            <h4>${esc(stay.name)}</h4>
            <p class="popup-sub">${esc(stay.type)}</p>
            <div class="popup-price"><b>$${stay.pricePerNight}</b> <small>/ night</small></div>
            <button class="popup-btn popup-btn-book" data-stay-id="${esc(stay.id)}">Book / Add to Day</button>
          </div>
        `);
      });
    }

    // 3. Activities Markers
    if (destination.activities) {
      destination.activities.forEach((act, index) => {
        const offsetLat = act.lat || (destination.lat - (index === 0 ? 0.004 : 0.007));
        const offsetLng = act.lng || (destination.lng - (index === 0 ? 0.005 : -0.006));

        const actIcon = L.divIcon({
          className: 'tf-act-marker',
          html: `
            <div class="custom-pin-root act-pin">
              <div class="pin-badge">$${act.price}</div>
              <div class="pin-symbol">🧭</div>
            </div>
          `,
          iconSize: [48, 30],
          iconAnchor: [24, 15]
        });

        const actMarker = L.marker([offsetLat, offsetLng], { icon: actIcon })
          .addTo(this.markersGroup);

        actMarker.bindPopup(`
          <div class="tf-popup act-popup">
            <img src="${safeUrl(act.image)}" alt="${esc(act.title)}" class="popup-thumb" />
            <div class="tf-popup-tag">Activity &bull; ⏱️ ${act.duration || '3 Hours'}</div>
            <h4>${esc(act.title)}</h4>
            <div class="popup-price"><b>$${act.price}</b> <small>/ person</small></div>
            <button class="popup-btn popup-btn-act" data-act-id="${esc(act.id)}">Add to Trip Plan</button>
          </div>
        `);
      });
    }

    // Popup event delegations
    this.map.on('popupopen', (e) => {
      const popupNode = e.popup.getElement();
      if (!popupNode) return;

      const bookBtn = popupNode.querySelector('.popup-btn-book');
      if (bookBtn) {
        bookBtn.onclick = () => {
          const stayId = bookBtn.getAttribute('data-stay-id');
          const stay = destination.livingSpaces.find(s => s.id === stayId);
          if (stay && this.onSelectLivingSpace) this.onSelectLivingSpace(stay, destination);
        };
      }

      const actBtn = popupNode.querySelector('.popup-btn-act');
      if (actBtn) {
        actBtn.onclick = () => {
          const actId = actBtn.getAttribute('data-act-id');
          const act = destination.activities.find(a => a.id === actId);
          if (act && this.onSelectActivity) this.onSelectActivity(act, destination);
        };
      }
    });
  }

  zoomBy(delta) {
    if (this.map) {
      this.map.setZoom(this.map.getZoom() + delta);
    }
  }

  resetView() {
    if (this.map) {
      this.map.flyTo([20, 0], 3, { duration: 1.2 });
    }
  }

  invalidateSize() {
    if (this.map) {
      setTimeout(() => this.map.invalidateSize(), 100);
    }
  }
}
