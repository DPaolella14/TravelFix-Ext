/**
 * TravelFix Universal Geographic Search Engine
 * Provides comprehensive global search coverage for every country, state, territory, and city.
 * Combines a rich local index with live OpenStreetMap Nominatim geocoding.
 */

import { DESTINATIONS } from './data.js';

// Comprehensive index of popular global travel hotspots
export const POPULAR_TRAVEL_HOTSPOTS = [
  { id: "paris", name: "Paris", country: "France", continent: "Europe", lat: 48.8566, lng: 2.3522, tier: "hub", tagline: "The City of Light, Haute Couture & World-Class Art", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80" },
  { id: "tokyo", name: "Tokyo", country: "Japan", continent: "Asia", lat: 35.6762, lng: 139.6503, tier: "hub", tagline: "Hyper-Modern Metropolis & Serene Shinto Shrines", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80" },
  { id: "rome", name: "Rome", country: "Italy", continent: "Europe", lat: 41.9028, lng: 12.4964, tier: "hub", tagline: "Eternal City of the Colosseum & Renaissance Palaces", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80" },
  { id: "new-york", name: "New York City", country: "United States", continent: "North America", lat: 40.7128, lng: -74.0060, tier: "hub", tagline: "The Empire City of Broadway, Central Park & Skylines", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80" },
  { id: "london", name: "London", country: "United Kingdom", continent: "Europe", lat: 51.5074, lng: -0.1278, tier: "hub", tagline: "Royal Palaces, West End Theatres & Historic Thames", image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80" },
  { id: "dubai", name: "Dubai", country: "United Arab Emirates", continent: "Asia", lat: 25.2048, lng: 55.2708, tier: "hub", tagline: "Futuristic Architectural Wonders & Desert Luxury", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80" },
  { id: "barcelona", name: "Barcelona", country: "Spain", continent: "Europe", lat: 41.3851, lng: 2.1734, tier: "hub", tagline: "Gaudí Masterpieces, Mediterranean Tapas & Gothic Quarters", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=800&q=80" },
  { id: "bangkok", name: "Bangkok", country: "Thailand", continent: "Asia", lat: 13.7563, lng: 100.5018, tier: "hub", tagline: "Gilded Temples, Floating Markets & Michelin Street Eats", image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80" },
  { id: "machu-picchu", name: "Machu Picchu", country: "Peru", continent: "South America", lat: -13.1631, lng: -72.5450, tier: "hub", tagline: "Lost Incan Citadel of the Cloud Forest", image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80" },
  { id: "sao-paulo", name: "São Paulo", country: "Brazil", continent: "South America", lat: -23.5505, lng: -46.6333, tier: "hub", tagline: "Cultural & High Gastronomy Megalopolis", image: "https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=800&q=80" },
  { id: "rio-de-janeiro", name: "Rio de Janeiro", country: "Brazil", continent: "South America", lat: -22.9068, lng: -43.1729, tier: "hub", tagline: "Christ the Redeemer, Sugarloaf & Copacabana Sands", image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80" },
  { id: "cairo", name: "Cairo & Giza", country: "Egypt", continent: "Africa", lat: 29.9792, lng: 31.1342, tier: "hub", tagline: "Great Pyramids of Giza & Millenniums of Antiquity", image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80" },
  { id: "bali", name: "Bali", country: "Indonesia", continent: "Asia", lat: -8.3405, lng: 115.0920, tier: "hub", tagline: "Sacred Water Temples, Terraced Jungles & Surfing Coves", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80" },
  { id: "sydney", name: "Sydney", country: "Australia", continent: "Oceania", lat: -33.8688, lng: 151.2093, tier: "hub", tagline: "Opera House, Harbour Bridge & Bondi Surf", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80" },
  { id: "cape-town", name: "Cape Town", country: "South Africa", continent: "Africa", lat: -33.9249, lng: 18.4241, tier: "hub", tagline: "Table Mountain, Peninsula Coast & Winelands", image: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80" },
  { id: "reykjavik", name: "Reykjavik", country: "Iceland", continent: "Europe", lat: 64.1466, lng: -21.9426, tier: "hub", tagline: "Aurora Borealis, Geothermal Lagoons & Basalt Volcanoes", image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80" },
  { id: "santorini", name: "Santorini", country: "Greece", continent: "Europe", lat: 36.3932, lng: 25.4615, tier: "hub", tagline: "Whitewashed Caldera Villages & Cobalt Aegean Sunsets", image: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80" },
  { id: "banff", name: "Banff", country: "Canada", continent: "North America", lat: 51.1784, lng: -115.5708, tier: "hub", tagline: "Turquoise Glacial Lakes & Rocky Mountain Peaks", image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80" },
  { id: "amsterdam", name: "Amsterdam", country: "Netherlands", continent: "Europe", lat: 52.3676, lng: 4.9041, tier: "hub", tagline: "Historic Canal Rings, Rijksmuseum & Cycling Culture", image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=800&q=80" },
  { id: "istanbul", name: "Istanbul", country: "Turkey", continent: "Europe/Asia", lat: 41.0082, lng: 28.9784, tier: "hub", tagline: "Where Continents Meet: Bosphorus & Hagia Sophia", image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80" }
];

// Pre-indexed global countries, states & territories for instant autocomplete
export const GLOBAL_GEO_INDEX = [
  // Major Countries
  { name: "United States", type: "Country", continent: "North America", lat: 37.0902, lng: -95.7129, currency: "USD" },
  { name: "Canada", type: "Country", continent: "North America", lat: 56.1304, lng: -106.3468, currency: "CAD" },
  { name: "United Kingdom", type: "Country", continent: "Europe", lat: 55.3781, lng: -3.4360, currency: "GBP" },
  { name: "France", type: "Country", continent: "Europe", lat: 46.2276, lng: 2.2137, currency: "EUR" },
  { name: "Italy", type: "Country", continent: "Europe", lat: 41.8719, lng: 12.5674, currency: "EUR" },
  { name: "Spain", type: "Country", continent: "Europe", lat: 40.4637, lng: -3.7492, currency: "EUR" },
  { name: "Germany", type: "Country", continent: "Europe", lat: 51.1657, lng: 10.4515, currency: "EUR" },
  { name: "Japan", type: "Country", continent: "Asia", lat: 36.2048, lng: 138.2529, currency: "JPY" },
  { name: "Brazil", type: "Country", continent: "South America", lat: -14.2350, lng: -51.9253, currency: "BRL" },
  { name: "Peru", type: "Country", continent: "South America", lat: -9.1899, lng: -75.0152, currency: "PEN" },
  { name: "Australia", type: "Country", continent: "Oceania", lat: -25.2744, lng: 133.7751, currency: "AUD" },
  { name: "New Zealand", type: "Country", continent: "Oceania", lat: -40.9006, lng: 174.8860, currency: "NZD" },
  { name: "Mexico", type: "Country", continent: "North America", lat: 23.6345, lng: -102.5528, currency: "MXN" },
  { name: "Egypt", type: "Country", continent: "Africa", lat: 26.8206, lng: 30.8025, currency: "EGP" },
  { name: "South Africa", type: "Country", continent: "Africa", lat: -30.5595, lng: 22.9375, currency: "ZAR" },
  { name: "Iceland", type: "Country", continent: "Europe", lat: 64.9631, lng: -19.0208, currency: "ISK" },
  { name: "Switzerland", type: "Country", continent: "Europe", lat: 46.8182, lng: 8.2275, currency: "CHF" },
  { name: "Greece", type: "Country", continent: "Europe", lat: 39.0742, lng: 21.8243, currency: "EUR" },
  { name: "Thailand", type: "Country", continent: "Asia", lat: 15.8700, lng: 100.9925, currency: "THB" },
  { name: "Indonesia", type: "Country", continent: "Asia", lat: -0.7893, lng: 113.9213, currency: "IDR" },
  { name: "India", type: "Country", continent: "Asia", lat: 20.5937, lng: 78.9629, currency: "INR" },
  { name: "China", type: "Country", continent: "Asia", lat: 35.8617, lng: 104.1954, currency: "CNY" },
  { name: "Argentina", type: "Country", continent: "South America", lat: -38.4161, lng: -63.6167, currency: "ARS" },
  { name: "Chile", type: "Country", continent: "South America", lat: -35.6751, lng: -71.5430, currency: "CLP" },
  { name: "Colombia", type: "Country", continent: "South America", lat: 4.5709, lng: -74.2973, currency: "COP" },
  { name: "Norway", type: "Country", continent: "Europe", lat: 60.4720, lng: 8.4689, currency: "NOK" },
  { name: "Sweden", type: "Country", continent: "Europe", lat: 60.1282, lng: 18.6435, currency: "SEK" },
  { name: "Portugal", type: "Country", continent: "Europe", lat: 39.3999, lng: -8.2245, currency: "EUR" },
  { name: "Morocco", type: "Country", continent: "Africa", lat: 31.7917, lng: -7.0926, currency: "MAD" },
  { name: "Kenya", type: "Country", continent: "Africa", lat: -0.0236, lng: 37.9062, currency: "KES" },
  { name: "Turkey", type: "Country", continent: "Europe/Asia", lat: 38.9637, lng: 35.2433, currency: "TRY" },
  { name: "United Arab Emirates", type: "Country", continent: "Asia", lat: 23.4241, lng: 53.8478, currency: "AED" },
  { name: "Singapore", type: "Country", continent: "Asia", lat: 1.3521, lng: 103.8198, currency: "SGD" },

  // Key States, Provinces & Territories
  { name: "California", type: "State", country: "United States", lat: 36.7783, lng: -119.4179 },
  { name: "New York State", type: "State", country: "United States", lat: 43.2994, lng: -74.2179 },
  { name: "Hawaii", type: "State", country: "United States", lat: 19.8968, lng: -155.5828 },
  { name: "Florida", type: "State", country: "United States", lat: 27.6648, lng: -81.5158 },
  { name: "Texas", type: "State", country: "United States", lat: 31.9686, lng: -99.9018 },
  { name: "Alaska", type: "State", country: "United States", lat: 64.2008, lng: -149.4937 },
  { name: "Colorado", type: "State", country: "United States", lat: 39.5501, lng: -105.7821 },
  { name: "Washington", type: "State", country: "United States", lat: 47.7511, lng: -120.7401 },
  { name: "Puerto Rico", type: "Territory", country: "United States", lat: 18.2208, lng: -66.5901 },
  { name: "British Columbia", type: "Province", country: "Canada", lat: 53.7267, lng: -127.6476 },
  { name: "Ontario", type: "Province", country: "Canada", lat: 51.2538, lng: -85.3232 },
  { name: "Quebec", type: "Province", country: "Canada", lat: 52.9399, lng: -73.5491 },
  { name: "Alberta", type: "Province", country: "Canada", lat: 53.9333, lng: -116.5765 },
  { name: "New South Wales", type: "State", country: "Australia", lat: -31.8402, lng: 145.6128 },
  { name: "Queensland", type: "State", country: "Australia", lat: -20.9176, lng: 142.7028 },
  { name: "Victoria", type: "State", country: "Australia", lat: -37.4713, lng: 144.7852 },
  { name: "Bavaria", type: "State", country: "Germany", lat: 48.7904, lng: 11.4979 },
  { name: "Scotland", type: "Country / Nation", country: "United Kingdom", lat: 56.4907, lng: -4.2026 },
  { name: "São Paulo State", type: "State", country: "Brazil", lat: -21.8486, lng: -49.0287 },
  { name: "Rio de Janeiro State", type: "State", country: "Brazil", lat: -22.9099, lng: -43.2095 },
  { name: "Zanzibar", type: "Territory", country: "Tanzania", lat: -6.1659, lng: 39.2026 },
  { name: "Tahiti / French Polynesia", type: "Territory", country: "France", lat: -17.6509, lng: -149.4260 },
  { name: "Sicily", type: "Region / Island", country: "Italy", lat: 37.5990, lng: 14.0154 }
];

export class UniversalSearchEngine {
  constructor() {
    this.debounceTimer = null;
  }

  /**
   * Search across local curated destinations, global geo index,
   * and live OpenStreetMap Nominatim geocoder.
   */
  async search(query, onResults) {
    const clean = (query || '').trim();
    if (!clean) {
      onResults([]);
      return;
    }

    const lower = clean.toLowerCase();

    // 1. Check local catalog (pre-curated destinations with rich stays/activities + all 50 US States)
    const localMatches = DESTINATIONS.filter(d =>
      d.name.toLowerCase().includes(lower) ||
      d.country.toLowerCase().includes(lower) ||
      (d.stateCode && (d.stateCode.toLowerCase() === lower || lower === `us-${d.stateCode.toLowerCase()}`)) ||
      (d.regionId && d.regionId.toLowerCase().includes(lower)) ||
      (d.tagline && d.tagline.toLowerCase().includes(lower)) ||
      (d.livingSpaces && d.livingSpaces.some(s => s.name.toLowerCase().includes(lower))) ||
      (d.activities && d.activities.some(a => a.title.toLowerCase().includes(lower)))
    ).map(d => ({
      id: d.id,
      name: d.name,
      country: d.country,
      type: d.tier === 'state' ? 'U.S. State' : (d.tier === 'town' ? 'Town / Pueblo' : (d.tier === 'city' ? 'City' : 'World Hub')),
      lat: d.lat,
      lng: d.lng,
      image: d.image,
      destinationObj: d,
      source: 'curated'
    }));

    // 2. Check global country & territory index
    const geoMatches = GLOBAL_GEO_INDEX.filter(g =>
      g.name.toLowerCase().includes(lower) ||
      (g.country && g.country.toLowerCase().includes(lower))
    ).map(g => ({
      id: 'geo-' + g.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: g.name,
      country: g.country || g.name,
      type: g.type,
      lat: g.lat,
      lng: g.lng,
      image: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80`,
      source: 'geo-index'
    }));

    // Combine local results immediately
    const immediate = [...localMatches, ...geoMatches].slice(0, 8);
    onResults(immediate);

    // 3. Query OpenStreetMap Nominatim for any place on Earth (debounced)
    clearTimeout(this.debounceTimer);
    if (clean.length >= 2) {
      this.debounceTimer = setTimeout(async () => {
        try {
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(clean)}&limit=6&addressdetails=1`;
          const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
          if (!response.ok) return;
          const data = await response.json();

          if (Array.isArray(data) && data.length > 0) {
            const apiMatches = data.map((item, idx) => {
              const nameParts = item.display_name.split(',');
              const primaryName = nameParts[0].trim();
              const country = nameParts[nameParts.length - 1].trim();
              const subType = item.type ? (item.type.charAt(0).toUpperCase() + item.type.slice(1)) : 'Location';

              return {
                id: `osm-${item.osm_id || idx}`,
                name: primaryName,
                country: country,
                type: subType,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                displayName: item.display_name,
                image: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80`,
                source: 'nominatim'
              };
            });

            // Merge deduplicated results
            const merged = [...immediate];
            apiMatches.forEach(apiItem => {
              const exists = merged.some(m =>
                Math.abs(m.lat - apiItem.lat) < 0.1 && Math.abs(m.lng - apiItem.lng) < 0.1
              );
              if (!exists) {
                merged.push(apiItem);
              }
            });

            onResults(merged.slice(0, 10));
          }
        } catch (e) {
          console.warn('Live geocoding fallback error:', e);
        }
      }, 300);
    }
  }

  /**
   * Builds a rich destination object with customized accommodations and activities
   * for any searched country, state, territory, or city that isn't pre-curated.
   */
  createDynamicDestination(searchItem) {
    if (searchItem.destinationObj) {
      return searchItem.destinationObj;
    }

    const { name, country, type, lat, lng, image } = searchItem;

    return {
      id: searchItem.id,
      name: name,
      country: country || name,
      continent: "Global Destination",
      tier: type.toLowerCase().includes('town') ? 'town' : (type.toLowerCase().includes('city') ? 'city' : 'hub'),
      tagline: `${type} &bull; Coordinates ${lat.toFixed(2)}°, ${lng.toFixed(2)}°`,
      description: `Explore ${name}, ${country}. Located at ${lat.toFixed(4)}° latitude and ${lng.toFixed(4)}° longitude, offering handpicked accommodations, panoramic landscapes, and authentic regional excursions.`,
      lat: lat,
      lng: lng,
      elevation: "Local Terrain",
      bestSeason: "Year-Round",
      currency: "USD / Local",
      weather: "22°C / Scenic skies",
      image: image || "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
      livingSpaces: [
        {
          id: `stay-${searchItem.id}-1`,
          name: `${name} Grand Heritage Hotel & Spa`,
          type: "5-Star Luxury Retreat",
          rating: 4.9,
          reviews: 540,
          pricePerNight: 480,
          currency: "USD",
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
          address: `Central District, ${name}`,
          lat: lat + 0.003,
          lng: lng + 0.003,
          tags: ["Panoramic Views", "Fine Dining", "Wellness Spa"],
          amenities: ["Horizon Swimming Pool", "Luxury Breakfast Included", "High-Speed Wi-Fi", "Private Concierge"],
          description: `A celebrated stay offering contemporary luxury, exquisite dining, and prime access to the wonders of ${name}.`
        },
        {
          id: `stay-${searchItem.id}-2`,
          name: `${name} Boutique Botanical Casitas`,
          type: "Eco-Lodge & Suites",
          rating: 4.85,
          reviews: 320,
          pricePerNight: 310,
          currency: "USD",
          image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
          address: `Scenic Way, ${name}`,
          lat: lat - 0.004,
          lng: lng - 0.003,
          tags: ["Botanical Gardens", "Organic Dining", "Serene"],
          amenities: ["Private Balcony", "Hydrotherapy Jacuzzi", "Artisan Cocktails"],
          description: `An intimate oasis nestled in natural surroundings, blending regional charm with elevated comfort.`
        }
      ],
      activities: [
        {
          id: `act-${searchItem.id}-1`,
          title: `${name} Private Highlights & Landmark Exploration`,
          category: "Culture & Sights",
          duration: "4 Hours",
          rating: 4.94,
          reviews: 680,
          price: 95,
          currency: "USD",
          image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
          timeSlot: "09:30 AM - 01:30 PM",
          lat: lat,
          lng: lng,
          tags: ["Private Guide", "Top Rated", "Historical Landmarks"],
          highlights: [`Discover famous architecture and heritage sights across ${name}`, "Guided commentary from local licensed specialists", "Flexible custom itinerary"]
        },
        {
          id: `act-${searchItem.id}-2`,
          title: `Taste of ${name}: Gourmet Gastronomic Walk`,
          category: "Gastronomy",
          duration: "3 Hours",
          rating: 4.91,
          reviews: 450,
          price: 85,
          currency: "USD",
          image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
          timeSlot: "06:00 PM - 09:00 PM",
          lat: lat + 0.002,
          lng: lng - 0.002,
          tags: ["Foodie Safari", "Local Wine / Beverages", "Authentic Recipes"],
          highlights: [`Sample signature delicacies and artisanal recipes native to ${name}`, "Pairings with regional wines and craft beverages", "Visit hidden neighborhood favorites"]
        }
      ]
    };
  }

  /**
   * Enriches dynamic destination with real hotels and attractions using OpenStreetMap Overpass API,
   * cached in localStorage to respect rate limits and ensure lightning fast re-clicks.
   */
  async enrichDynamicDestination(dest) {
    if (!dest || !dest.lat || !dest.lng) return dest;

    const cacheKey = `travelfix_geo_enrich_${dest.lat.toFixed(2)}_${dest.lng.toFixed(2)}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.livingSpaces && parsed.livingSpaces.length > 0) {
          dest.livingSpaces = parsed.livingSpaces;
        }
        if (parsed.activities && parsed.activities.length > 0) {
          dest.activities = parsed.activities;
        }
        return dest;
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }

    try {
      const radius = 6000; // 6km radius
      const query = `[out:json][timeout:6];
(
  node["tourism"="hotel"](around:${radius},${dest.lat},${dest.lng});
  node["tourism"="guest_house"](around:${radius},${dest.lat},${dest.lng});
  node["tourism"="attraction"](around:${radius},${dest.lat},${dest.lng});
  node["tourism"="museum"](around:${radius},${dest.lat},${dest.lng});
  node["historic"](around:${radius},${dest.lat},${dest.lng});
);
out center 20;`;

      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!resp.ok) return dest;
      const data = await resp.json();
      const elements = data.elements || [];

      // Filter elements with real names
      const namedHotels = elements.filter(e => 
        (e.tags?.tourism === 'hotel' || e.tags?.tourism === 'guest_house' || e.tags?.tourism === 'resort') &&
        e.tags?.name && e.tags.name.length > 2
      );

      const namedAttractions = elements.filter(e =>
        (e.tags?.tourism === 'attraction' || e.tags?.tourism === 'museum' || e.tags?.historic) &&
        e.tags?.name && e.tags.name.length > 2
      );

      const curatedStaysImages = [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
      ];

      const curatedActImages = [
        "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80"
      ];

      if (namedHotels.length > 0) {
        dest.livingSpaces = namedHotels.slice(0, 4).map((h, idx) => {
          const stars = h.tags?.stars || (h.tags?.['building:levels'] > 3 ? '4' : '3');
          const address = h.tags?.['addr:street'] ? `${h.tags['addr:street']}, ${dest.name}` : (h.tags?.['addr:city'] || `${dest.name}`);
          return {
            id: `real-stay-${dest.id}-${idx}`,
            name: h.tags.name,
            type: h.tags?.tourism === 'guest_house' ? 'Boutique Guest House' : `${stars}-Star Hotel & Suites`,
            rating: Number((4.6 + (idx * 0.1)).toFixed(1)),
            reviews: 140 + idx * 75,
            pricePerNight: 160 + idx * 65,
            currency: "USD",
            image: curatedStaysImages[idx % curatedStaysImages.length],
            address: address,
            lat: h.lat || dest.lat + (idx * 0.002),
            lng: h.lon || dest.lng + (idx * 0.002),
            tags: ["Verified Location", "Real Stay", h.tags?.cuisine ? `${h.tags.cuisine} Dining` : "Central"],
            amenities: ["Wi-Fi Included", "Local Hospitality", "Daily Housekeeping", "Scenic Surroundings"],
            description: `A real verified living space located directly in ${dest.name}, providing authentic regional hospitality and comfortable amenities.`
          };
        });
      }

      if (namedAttractions.length > 0) {
        dest.activities = namedAttractions.slice(0, 4).map((a, idx) => {
          const cat = a.tags?.tourism === 'museum' ? 'Museum & Heritage' : (a.tags?.historic ? 'Historic Landmark' : 'Sightseeing & Excursion');
          return {
            id: `real-act-${dest.id}-${idx}`,
            title: `Visit ${a.tags.name}`,
            category: cat,
            duration: idx % 2 === 0 ? "2.5 Hours" : "4 Hours",
            rating: Number((4.7 + (idx * 0.08)).toFixed(2)),
            reviews: 210 + idx * 90,
            price: idx === 0 ? 0 : 35 + idx * 15,
            currency: "USD",
            image: curatedActImages[idx % curatedActImages.length],
            timeSlot: idx % 2 === 0 ? "10:00 AM - 12:30 PM" : "02:00 PM - 06:00 PM",
            lat: a.lat || dest.lat,
            lng: a.lon || dest.lng,
            tags: ["Verified Sight", "Popular Attraction", cat],
            highlights: [
              `Direct exploration of ${a.tags.name}`,
              `Authentic local heritage and architecture in ${dest.name}`,
              "Prime photo spot and regional point of interest"
            ]
          };
        });
      }

      // Save to localStorage cache
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          livingSpaces: dest.livingSpaces,
          activities: dest.activities
        }));
      } catch (e) {
        console.warn('Cache write failed:', e);
      }

    } catch (err) {
      console.warn('Overpass enrichment query skipped/timed out, using baseline rich templates:', err);
    }

    return dest;
  }
}

