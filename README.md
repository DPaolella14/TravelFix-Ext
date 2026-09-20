# TravelFix — 3D Earth Travel Booking & Trip Planner

**TravelFix** is a cutting-edge, dark-themed travel discovery and booking platform inspired by Google Earth. It brings the magic of planetary exploration to trip planning, allowing travelers to zoom into global destinations, explore boutique living spaces and curated activities, and construct day-by-day itineraries with 3D flight route visualizations.

---

## Key Features

1. **Google Earth-Style 3D Globe**:
   - Built with Three.js WebGL rendering, featuring atmospheric Fresnel glow, procedural night-light clusters, and orbit controls.
   - Pulsing 3D destination beacons that smoothly fly the camera to any location across the globe.
   - Dynamic 3D curved flight arcs connecting consecutive stops in the traveler's itinerary with moving photon pulses.

2. **Regional Satellite & Dark Cartography**:
   - Seamlessly switch between global 3D Earth and high-resolution regional satellite / dark tiles (powered by Leaflet with Esri World Imagery and CartoDB Dark Matter).
   - Interactive local markers pinpointing exact hotel locations and excursion departure points.

3. **Living Spaces & Accommodations**:
   - Handpicked luxury historic lodges, cloud forest eco-casitas, clifftop villas, skyline suites, and ryokans.
   - Nightly pricing, verified amenities, high-resolution photography, guest ratings, and instant reservation simulation.

4. **Curated Regional Activities**:
   - Authentic excursions ranging from Incan Trail sunrise treks and high gastronomy tastings to alpine canoe expeditions and Arctic superjeep aurora chases.
   - Duration, time slots, pricing, highlights, and one-click scheduling.

5. **Multi-Day Travel Plan & Itinerary Engine**:
   - Pre-loaded with the showcase plan:
     - **Monday — Machu Picchu**: Belmond Sanctuary Lodge + Classic Inca Trail Sun Gate Trek & Ancient Andean Culinary Tasting.
     - **Friday — São Paulo**: Hotel Fasano Jardins + Paulista Avenue Architectural Tour & D.O.M. High Gastronomy Journey.
   - Real-time budget breakdown (Living spaces + Activities + Transit = Grand Total).
   - Add/remove days, assign stays, add activities, copy formatted summaries to clipboard, or print/export clean PDF itineraries.

6. **Luxury Dark Theme & Custom Branding**:
   - Obsidian void black (`#060911`) palette with glowing neon cyan (`#00f2fe`) and aurora emerald accents.
   - Bespoke vector logo featuring an orbital flight path looping through an illuminated geodesic destination compass beacon.

---

## Getting Started

### Prerequisites
- Any modern web browser (Chrome, Edge, Firefox, Safari) with WebGL enabled.
- Python 3 (pre-installed on Windows/macOS/Linux) for local serving.

### Running the Application

1. Open your terminal / PowerShell in the project directory:
   ```bash
   cd TravelFix-Ext
   ```

2. Start the local server:
   ```bash
   python server.py
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080
   ```
   *(Or run `python server.py --open` to automatically open your default browser)*

The port is always **8080** unless it is already taken, in which case the
server steps up to 8081 and so on — it prints the URL it settled on.

> Opening `index.html` directly as a `file://` URL will not work: the app is
> built from ES modules, which browsers refuse to load over `file://`. Use the
> server.

### Tests

Regression tests live in `tests/` and have their own dependencies; the site
itself needs nothing installed. See [tests/README.md](tests/README.md).

```bash
cd tests && npm install && npx playwright install chromium
cd .. && python server.py &
node tests/run-all.js
```
