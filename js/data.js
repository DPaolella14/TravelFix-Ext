import { ALL_50_US_STATES } from './us-states.js';

export { ALL_50_US_STATES };

export const BASE_DESTINATIONS = [
  // ==========================================
  // PERU & ANDES REGION
  // ==========================================
  {
    id: "machu-picchu",
    name: "Machu Picchu",
    country: "Peru",
    continent: "South America",
    tier: "hub",
    regionId: "peru",
    tagline: "Lost Incan Citadel of the Cloud Forest",
    description: "Perched 2,430 meters high above the Urubamba River valley, Machu Picchu is an architectural marvel of the Incan Empire surrounded by emerald peaks and mystical mists.",
    lat: -13.1631,
    lng: -72.5450,
    elevation: "2,430m",
    bestSeason: "May - October",
    currency: "USD / PEN",
    weather: "20°C / Sunny mists",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1200&q=80",
    livingSpaces: [
      {
        id: "stay-mp-belmond",
        name: "Belmond Sanctuary Lodge",
        type: "Luxury Historic Lodge",
        rating: 4.9,
        reviews: 842,
        pricePerNight: 1250,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Citadel Gates, Carretera Hiram Bingham Km 7.5",
        lat: -13.1628,
        lng: -72.5439,
        tags: ["Adjacent to Ruins", "Exclusive Sunrise Access", "Michelin Dining"],
        amenities: ["Ruins View Terrace", "Incan Spa Treatments", "Gourmet Andean Cuisine", "High-speed Wi-Fi", "Private Butler Service"],
        description: "The only hotel situated directly adjacent to the entrance of Machu Picchu, allowing you to enter before public train crowds arrive."
      },
      {
        id: "stay-mp-inkaterra",
        name: "Inkaterra Machu Picchu Pueblo",
        type: "Cloud Forest Eco-Casitas",
        rating: 4.8,
        reviews: 1120,
        pricePerNight: 580,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "Aguas Calientes Valley, Km 110",
        lat: -13.1550,
        lng: -72.5250,
        tags: ["Orchid Gardens", "Eco Luxury", "Thermal Springs"],
        amenities: ["Private Stone Fireplace", "Spectacled Bear Sanctuary", "Unu River Spa", "Native Botanicals"],
        description: "An intimate Andean village tucked in 12 acres of mist-kissed cloud forest featuring stone paths, waterfalls, and 372 species of native orchids."
      }
    ],
    activities: [
      {
        id: "act-mp-sungate",
        title: "Inca Trail Sun Gate Sunrise Trek & Citadel Tour",
        category: "Trek & History",
        duration: "5 Hours",
        rating: 4.98,
        reviews: 1450,
        price: 210,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80",
        timeSlot: "05:30 AM - 10:30 AM",
        lat: -13.1650,
        lng: -72.5400,
        tags: ["Bucket List", "Private Archeologist", "Sunrise Access"],
        highlights: ["Watch first sunlight illuminate the Intihuatana stone", "Private licensed archeologist commentary", "Circuit 1 & 2 panoramic citadel access"]
      },
      {
        id: "act-mp-huaynapicchu",
        title: "Huayna Picchu Peak Extreme Ascent",
        category: "Mountain Adventure",
        duration: "3.5 Hours",
        rating: 4.9,
        reviews: 920,
        price: 130,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=800&q=80",
        timeSlot: "07:00 AM - 10:30 AM",
        lat: -13.1580,
        lng: -72.5460,
        tags: ["High Adrenaline", "Steep Stairs of Death", "Temple of the Moon"],
        highlights: ["Climb the iconic peak rising over the citadel", "Explore hidden cliffside Temple of the Moon", "Jaw-dropping 360° vertical mountain vistas"]
      }
    ]
  },
  {
    id: "cusco",
    name: "Cusco",
    country: "Peru",
    continent: "South America",
    tier: "city",
    regionId: "peru",
    tagline: "Historic Capital of the Incan Empire",
    description: "The historic heart of the Andes, Cusco blends massive Incan stone foundations with Spanish colonial baroque architecture, vibrant craft markets, and Andean culinary pioneers.",
    lat: -13.5319,
    lng: -71.9675,
    elevation: "3,399m",
    bestSeason: "May - October",
    currency: "USD / PEN",
    weather: "18°C / Crisp alpine",
    image: "https://images.unsplash.com/photo-1589802829985-817e51171b92?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-cusco-monasterio",
        name: "Belmond Hotel Monasterio",
        type: "16th-Century Monastery Palace",
        rating: 4.94,
        reviews: 1230,
        pricePerNight: 620,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Calle Palacio 136, Cusco",
        lat: -13.5150,
        lng: -71.9770,
        tags: ["Oxygen-Enriched Rooms", "Colonial Courtyard", "Choral Opera"],
        amenities: ["Oxygen System in Suites", "Fine Art Collection", "Illariy Courtyard Dining"],
        description: "A former monastery built in 1592 around a courtyard of ancient cedar trees, famous for its oxygen-enriched rooms that cure altitude fatigue."
      }
    ],
    activities: [
      {
        id: "act-cusco-sacsayhuaman",
        title: "Sacsayhuamán Megalithic Fortress & San Pedro Market",
        category: "Ancient Archeology",
        duration: "4 Hours",
        rating: 4.91,
        reviews: 980,
        price: 85,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:00 AM - 01:00 PM",
        lat: -13.5080,
        lng: -71.9810,
        tags: ["Gigantic 120-Ton Stones", "Artisan Textiles", "Quechua Herbs"],
        highlights: ["Marvel at interlocking stone blocks weighing over 100 tons", "Taste local fruits and freshly ground cacao at San Pedro Market"]
      }
    ]
  },
  {
    id: "lima",
    name: "Lima",
    country: "Peru",
    continent: "South America",
    tier: "city",
    regionId: "peru",
    tagline: "Gastronomic Capital of the Americas & Pacific Cliffs",
    description: "Perched on dramatic desert cliffs tumbling into the crashing Pacific ocean, Lima is internationally celebrated for harboring the top restaurants on Earth.",
    lat: -12.0464,
    lng: -77.0428,
    elevation: "154m",
    bestSeason: "December - April",
    currency: "USD / PEN",
    weather: "23°C / Ocean mist",
    image: "https://images.unsplash.com/photo-1531968455001-5c5272a41129?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-lima-miraflores-park",
        name: "Belmond Miraflores Park",
        type: "Pacific Oceanfront Clifftop Suite",
        rating: 4.92,
        reviews: 870,
        pricePerNight: 510,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "Av. Malecón de la Reserva 1035, Miraflores",
        lat: -12.1330,
        lng: -77.0280,
        tags: ["Rooftop Ocean Pool", "Clifftop Malecón", "Zumbayllu Spa"],
        amenities: ["Clifftop Infinity Pool", "Tiradito Bar", "Ocean Balconies"],
        description: "Set right on the famous Malecón cliff boulevard with breathtaking views of crashing Pacific waves and hang-gliders."
      }
    ],
    activities: [
      {
        id: "act-lima-central-food",
        title: "Barranco Bohemian Art Walk & High Ceviche Masterclass",
        category: "Gastronomy",
        duration: "3.5 Hours",
        rating: 4.95,
        reviews: 1340,
        price: 110,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
        timeSlot: "11:30 AM - 03:00 PM",
        lat: -12.1480,
        lng: -77.0210,
        tags: ["Fresh Catch Ceviche", "Pisco Sour Tasting", "Bridge of Sighs"],
        highlights: ["Taste tiger milk ceviche from freshly hooked Pacific seabass", "Explore colorful colonial mansions and street art of Barranco"]
      }
    ]
  },
  {
    id: "aguas-calientes",
    name: "Aguas Calientes (Machu Picchu Pueblo)",
    country: "Peru",
    continent: "South America",
    tier: "town",
    regionId: "peru",
    tagline: "Vibrant Gateway Pueblo Nested in Cloud Forest Canyons",
    description: "A picturesque mountain pueblo nestled between towering vertical cliffs and the roaring Urubamba River, acting as the immediate staging ground for Machu Picchu.",
    lat: -13.1547,
    lng: -72.5256,
    elevation: "2,040m",
    bestSeason: "May - October",
    currency: "USD / PEN",
    weather: "21°C / Lush river breeze",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-aguas-sumaq",
        name: "Sumaq Machu Picchu Hotel",
        type: "Boutique River Retreat",
        rating: 4.88,
        reviews: 790,
        pricePerNight: 460,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        address: "Av. Hermanos Ayar Mz 1, Aguas Calientes",
        lat: -13.1539,
        lng: -72.5273,
        tags: ["Riverfront Balcony", "Thermal Springs", "Andean Spa"],
        amenities: ["River View Balconies", "Pachamama Ceremony", "Ceviche Masterclass"],
        description: "Set on the edge of the sacred Urubamba River, offering authentic Andean mysticism paired with contemporary luxury."
      }
    ],
    activities: [
      {
        id: "act-aguas-thermal",
        title: "Natural Sulfur Thermal Springs & Cloud Forest Waterfall Walk",
        category: "Relaxation & Nature",
        duration: "2.5 Hours",
        rating: 4.86,
        reviews: 640,
        price: 45,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        timeSlot: "04:00 PM - 06:30 PM",
        lat: -13.1530,
        lng: -72.5210,
        tags: ["Hot Springs", "Thermal Minerals", "Mountain Canopy"],
        highlights: ["Soak in mineral hot springs heated by volcanic mountain fissures", "Walk through bamboo groves and orchid-draped cliffs"]
      }
    ]
  },
  {
    id: "ollantaytambo",
    name: "Ollantaytambo",
    country: "Peru",
    continent: "South America",
    tier: "town",
    regionId: "peru",
    tagline: "Living Incan Town with Massive Terraced Sun Temple",
    description: "The only surviving intact Incan town plan, with cobblestone alleys, stone water channels running down streets, and a colossal mountain fortress.",
    lat: -13.2583,
    lng: -72.2636,
    elevation: "2,792m",
    bestSeason: "May - October",
    currency: "USD / PEN",
    weather: "19°C / Sunny mountain air",
    image: "https://images.unsplash.com/photo-1509299349698-dd22323b5963?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-ollanta-lodge",
        name: "El Albergue Ollantaytambo",
        type: "Historic Farm & Distillery Lodge",
        rating: 4.91,
        reviews: 620,
        pricePerNight: 240,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
        address: "Train Station Grounds, Ollantaytambo",
        lat: -13.2590,
        lng: -72.2640,
        tags: ["Organic Farm", "Artisan Cañazo Distillery", "Stone Fireplaces"],
        amenities: ["Wood-fired Saunas", "Farm-to-Table Dining", "Roasted Coffee Atelier"],
        description: "A charming historic 1925 lodge on an organic Andean farm producing award-winning herbal brandies and wood-fired Andean feasts."
      }
    ],
    activities: [
      {
        id: "act-ollanta-sun-temple",
        title: "Pinkuylluna Incan Granaries & Sun Temple Fortress Climb",
        category: "Archeological Hike",
        duration: "3 Hours",
        rating: 4.93,
        reviews: 780,
        price: 60,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=800&q=80",
        timeSlot: "08:30 AM - 11:30 AM",
        lat: -13.2570,
        lng: -72.2620,
        tags: ["Sun Temple", "Granaries", "Panoramic Sacred Valley"],
        highlights: ["Climb the terraced monoliths where Manco Inca defeated Spanish conquistadors", "Explore cliffside food storehouses perched on vertical rock faces"]
      }
    ]
  },
  {
    id: "urubamba",
    name: "Urubamba",
    country: "Peru",
    continent: "South America",
    tier: "town",
    regionId: "peru",
    tagline: "Lush Heart of the Sacred Valley & Artisan Haciendas",
    description: "Framed by the snow-crowned Chicón glacier, Urubamba boasts a milder climate, lush maize fields, thermal springs, and the Sacred Valley's most opulent haciendas.",
    lat: -13.3050,
    lng: -72.1158,
    elevation: "2,871m",
    bestSeason: "May - October",
    currency: "USD / PEN",
    weather: "22°C / Golden sunshine",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-uru-tambo",
        name: "Tambo del Inka Luxury Collection",
        type: "Riverside Andean Palace",
        rating: 4.96,
        reviews: 1450,
        pricePerNight: 590,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "Av. Ferrocarril s/n, Urubamba",
        lat: -13.3070,
        lng: -72.1180,
        tags: ["Private Train Station", "Hydrotherapy Circuit", "Andean Spa"],
        amenities: ["Indoor/Outdoor Heated Pool", "Private Machu Picchu Train Platform", "Hawa Restaurant"],
        description: "Features its own private railway station to Machu Picchu and a world-class heated indoor/outdoor pool overlooking sacred mountains."
      }
    ],
    activities: [
      {
        id: "act-uru-marassalt",
        title: "Maras Ancient Salt Terraces & Moray Agricultural Circles",
        category: "Valley Marvels",
        duration: "4 Hours",
        rating: 4.97,
        reviews: 1650,
        price: 90,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:00 AM - 01:00 PM",
        lat: -13.3330,
        lng: -72.1580,
        tags: ["Pink Salt Pools", "Inca Genetic Labs", "Andean Highlands"],
        highlights: ["Walk among 3,000 stepped pink salt evaporation pools harvested since pre-Inca eras", "Stand inside Moray's concentric agricultural amphitheaters"]
      }
    ]
  },

  // ==========================================
  // BRAZIL & SÃO PAULO REGION
  // ==========================================
  {
    id: "sao-paulo",
    name: "São Paulo",
    country: "Brazil",
    continent: "South America",
    tier: "hub",
    regionId: "brazil",
    tagline: "Vibrant Megalopolis of Art, Nightlife & Gastronomy",
    description: "South America's cultural and culinary powerhouse, São Paulo pulses with world-class museums, modernist architecture, buzzing neo-bistros, and lush urban parks.",
    lat: -23.5505,
    lng: -46.6333,
    elevation: "760m",
    bestSeason: "April - November",
    currency: "USD / BRL",
    weather: "24°C / Pleasant breeze",
    image: "https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=1200&q=80",
    livingSpaces: [
      {
        id: "stay-sp-fasano",
        name: "Hotel Fasano São Paulo",
        type: "5-Star Jardins Icon",
        rating: 4.9,
        reviews: 1380,
        pricePerNight: 690,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80",
        address: "Rua Vittorio Fasano 88, Jardins",
        lat: -23.5658,
        lng: -46.6672,
        tags: ["Jardins Luxury", "Fasano Ristorante", "Rooftop Pool"],
        amenities: ["Italian Marble Baths", "World-renowned Jazz Bar", "Heated Indoor Roman Pool", "Luxury Chauffeur"],
        description: "The gold standard of Brazilian hospitality, designed by Isay Weinfeld and Marcio Kogan with vintage 1930s elegance and timeless brick facade."
      },
      {
        id: "stay-sp-rosewood",
        name: "Rosewood São Paulo",
        type: "Vertical Forest Architectural Wonder",
        rating: 4.95,
        reviews: 950,
        pricePerNight: 780,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
        address: "Rua Itapeva 435, Bela Vista",
        lat: -23.5620,
        lng: -46.6530,
        tags: ["Jean Nouvel Tower", "Philippe Starck Design", "Art Sanctuary"],
        amenities: ["Rooftop Emerald Pool", "Asaya Wellness Center", "Taraz Brazilian Restaurant", "Living Tree Facade"],
        description: "An urban oasis wrapped inside a living cedar and olive tower, filled with curated pieces by 57 prominent Brazilian artists."
      }
    ],
    activities: [
      {
        id: "act-sp-paulista",
        title: "Paulista Avenue Architectural Walk & MASP Tour",
        category: "Art & Architecture",
        duration: "4 Hours",
        rating: 4.9,
        reviews: 1820,
        price: 85,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1583275479278-85999e1ae9c2?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 02:00 PM",
        lat: -23.5615,
        lng: -46.6560,
        tags: ["Lina Bo Bardi", "Modernist Design", "Art Gallery VIP"],
        highlights: ["Explore Lina Bo Bardi's floating museum on red concrete beams", "Japan House & SESC Paulista rooftop observation deck", "Specialist contemporary art curator guide"]
      },
      {
        id: "act-sp-gastronomy",
        title: "Jardins & D.O.M. High Gastronomy Journey",
        category: "Fine Dining",
        duration: "3.5 Hours",
        rating: 4.96,
        reviews: 730,
        price: 240,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
        timeSlot: "07:30 PM - 11:00 PM",
        lat: -23.5665,
        lng: -46.6680,
        tags: ["Amazonian Ingredients", "Chef Tasting Menu", "Sommelier Pairings"],
        highlights: ["Curated multi-course tasting menu exploring wild Amazonian herbs and pirarucu", "Premium cachaça and Brazilian fine wine pairings", "Private table in secluded salon"]
      }
    ]
  },
  {
    id: "campinas",
    name: "Campinas",
    country: "Brazil",
    continent: "South America",
    tier: "city",
    regionId: "brazil",
    tagline: "Technological & Coffee Heritage Hub of São Paulo State",
    description: "A prosperous regional city known for historic coffee fazendas, leafy university campuses, high-tech innovation, and sprawling colonial estates.",
    lat: -22.9056,
    lng: -47.0608,
    elevation: "685m",
    bestSeason: "April - October",
    currency: "USD / BRL",
    weather: "25°C / Warm sun",
    image: "https://images.unsplash.com/photo-1543059080-f9b1272213d5?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-camp-royal-palm",
        name: "Royal Palm Plaza Resort",
        type: "Grand Luxury Resort",
        rating: 4.85,
        reviews: 940,
        pricePerNight: 310,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
        address: "Av. Royal Palm Plaza 277, Campinas",
        lat: -22.9280,
        lng: -47.0580,
        tags: ["Resort Lagoon Pools", "Helipad", "Aflora Spa"],
        amenities: ["7 Heated Swimming Pools", "Tennis Complex", "Wine Cellar Bistro"],
        description: "One of Brazil's most complete resort complexes with lush subtropical gardens, fine gastronomy, and deep wellness pavilions."
      }
    ],
    activities: [
      {
        id: "act-camp-fazenda-coffee",
        title: "Historic 1850s Coffee Fazenda & Steam Train Journey",
        category: "Heritage & Tasting",
        duration: "5 Hours",
        rating: 4.92,
        reviews: 580,
        price: 95,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:30 AM - 02:30 PM",
        lat: -22.8800,
        lng: -47.0200,
        tags: ["Historic Steam Train", "Single Origin Bourbon Coffee", "Colonial Manor"],
        highlights: ["Ride the vintage Maria Fumaça steam engine through sugar cane valleys", "Sample freshly roasted heirloom yellow bourbon coffees on a working fazenda"]
      }
    ]
  },
  {
    id: "santos",
    name: "Santos",
    country: "Brazil",
    continent: "South America",
    tier: "city",
    regionId: "brazil",
    tagline: "Historic Atlantic Port & Guinness World Record Beach Garden",
    description: "The historic maritime gate to São Paulo, famous for the Coffee Stock Exchange palace, Pelé's legendary Santos FC, and a continuous 5.3km beachfront botanical garden.",
    lat: -23.9618,
    lng: -46.3322,
    elevation: "2m",
    bestSeason: "Year round",
    currency: "USD / BRL",
    weather: "27°C / Atlantic breeze",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-santos-sheraton",
        name: "Sheraton Santos Hotel",
        type: "Oceanfront Luxury Tower",
        rating: 4.82,
        reviews: 730,
        pricePerNight: 220,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
        address: "Rua Guaiaó 70, Santos",
        lat: -23.9780,
        lng: -46.3110,
        tags: ["Ocean Horizon View", "Heated Pool", "O Lagar Portuguese Dining"],
        amenities: ["Rooftop Pool", "Cocktail Lounge", "Direct Mall Access"],
        description: "Contemporary comfort towering over the bay of Santos, close to the beach gardens and historic tram network."
      }
    ],
    activities: [
      {
        id: "act-santos-coffee-tram",
        title: "Bolsa do Café Palace & Historic Electric Tramway",
        category: "Architecture & History",
        duration: "3 Hours",
        rating: 4.89,
        reviews: 820,
        price: 55,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 01:00 PM",
        lat: -23.9330,
        lng: -46.3280,
        tags: ["Stained Glass Dome", "Barista Tastings", "Vintage Tram"],
        highlights: ["Inspect the marble trading floor of the 1922 Coffee Stock Exchange", "Taste rare Brazilian micro-lot espresso blends prepared by award-winning baristas"]
      }
    ]
  },
  {
    id: "campos-do-jordao",
    name: "Campos do Jordão",
    country: "Brazil",
    continent: "South America",
    tier: "town",
    regionId: "brazil",
    tagline: "Alpine Swiss Hamlet in the Mantiqueira Mountains",
    description: "Perched 1,628 meters high in the pine-scented Serra da Mantiqueira, this 'Brazilian Switzerland' features timber chalets, fondue lodges, craft breweries, and cloud forests.",
    lat: -22.7394,
    lng: -45.5914,
    elevation: "1,628m",
    bestSeason: "May - August (Winter festival)",
    currency: "USD / BRL",
    weather: "15°C / Crisp alpine air",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-campos-toriba",
        name: "Hotel Toriba",
        type: "1943 Alpine Heritage Chalet",
        rating: 4.95,
        reviews: 910,
        pricePerNight: 480,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "Av. Ernesto Diederichsen 2962, Campos do Jordão",
        lat: -22.7480,
        lng: -45.6210,
        tags: ["L'Occitane Spa", "Araucaria Forest", "Pennacchi Fine Dining"],
        amenities: ["Heated Forest Mineral Pools", "Fondue Salon", "Private Nature Trails"],
        description: "A legendary mountain retreat set within 2 million square meters of pristine araucaria pine forests and flowering hydrangea gardens."
      }
    ],
    activities: [
      {
        id: "act-campos-pedra-bau",
        title: "Pedra do Baú Monolithic Summit Climb & Craft Beer Tasting",
        category: "Mountain Adventure",
        duration: "5 Hours",
        rating: 4.94,
        reviews: 710,
        price: 95,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
        timeSlot: "08:00 AM - 01:00 PM",
        lat: -22.6860,
        lng: -45.6580,
        tags: ["Via Ferrata Ladder", "Rock Monolith 1,950m", "Mountain Brewery"],
        highlights: ["Scale steel iron rungs drilled into a colossal granite monolith", "Toast with pine nut beer (cerveja de pinhão) at a scenic mountain microbrewery"]
      }
    ]
  },
  {
    id: "ubatuba",
    name: "Ubatuba",
    country: "Brazil",
    continent: "South America",
    tier: "town",
    regionId: "brazil",
    tagline: "Untamed Atlantic Rainforest & 102 Emerald Beaches",
    description: "Where emerald Atlantic rainforest mountains plunge directly into turquoise ocean bays, Ubatuba is Brazil's premier surf capital and wildlife sanctuary.",
    lat: -23.4339,
    lng: -45.0838,
    elevation: "5m",
    bestSeason: "March - November",
    currency: "USD / BRL",
    weather: "26°C / Tropical sea",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-uba-itaguá",
        name: "Pousada Kaliman Itaguá",
        type: "Boutique Beachfront Casitas",
        rating: 4.84,
        reviews: 540,
        pricePerNight: 210,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        address: "Rua Capitão Felipe 1010, Ubatuba",
        lat: -23.4480,
        lng: -45.0680,
        tags: ["Ocean Balcony", "TAMAR Sea Turtle Sanctuary", "Tropical Breakfast"],
        amenities: ["Infinity Pool Facing Bay", "Kayaks Included", "Fresh Passionfruit Caipirinhas"],
        description: "Relaxed coastal chic right across from the Itaguá bay where sea turtles can frequently be spotted surfacing for air."
      }
    ],
    activities: [
      {
        id: "act-uba-prumirim-islet",
        title: "Ilha do Prumirim Speedboat & Jungle Waterfall Jump",
        category: "Marine & Jungle",
        duration: "4.5 Hours",
        rating: 4.91,
        reviews: 860,
        price: 75,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:30 AM - 02:00 PM",
        lat: -23.3680,
        lng: -44.9650,
        tags: ["Deserted Islet", "Natural Rock Slides", "Coral Snorkel"],
        highlights: ["Speed across crystalline waters to a secluded white sand islet", "Slide down smooth natural granite water chutes deep inside the rainforest"]
      }
    ]
  },

  // ==========================================
  // JAPAN REGION
  // ==========================================
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    continent: "Asia",
    tier: "hub",
    regionId: "japan",
    tagline: "Hyper-Modern Metropolis & Serene Shinto Shrines",
    description: "A dazzling blend of futuristic neon skyscrapers, centuries-old temples, tranquil bamboo gardens, and unmatched culinary artistry ranging from intimate ramen alleys to three-star Michelin sushi counters.",
    lat: 35.6762,
    lng: 139.6503,
    elevation: "40m",
    bestSeason: "March - May, Oct - Dec",
    currency: "JPY / USD",
    weather: "19°C / Pleasant autumn breeze",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
    livingSpaces: [
      {
        id: "stay-tokyo-aman",
        name: "Aman Tokyo Otemachi",
        type: "5-Star Sky Sanctuary",
        rating: 4.97,
        reviews: 1420,
        pricePerNight: 1350,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
        address: "The Otemachi Tower, 1-5-6 Otemachi, Chiyoda-ku, Tokyo",
        lat: 35.6865,
        lng: 139.7640,
        tags: ["Mount Fuji Views", "Traditional Ryokan Aesthetics", "Imperial Palace Gardens"],
        amenities: ["Onsen-Style Thermal Baths", "30m Sky Pool", "Musashi Sushi Counter", "Engawa Lounge"],
        description: "Occupying the top six floors of the Otemachi Tower, blending Japanese washi paper architecture, granite onsens, and panoramic views of Mount Fuji."
      },
      {
        id: "stay-tokyo-hoshinoya",
        name: "Hoshinoya Tokyo",
        type: "Modern Luxury Ryokan",
        rating: 4.93,
        reviews: 980,
        pricePerNight: 890,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        address: "1-9-1 Otemachi, Chiyoda-ku, Tokyo",
        lat: 35.6880,
        lng: 139.7665,
        tags: ["Tatami-Matted Floors", "Rooftop Hot Spring Onsen", "Nippon Cuisine"],
        amenities: ["Natural Geothermal Onsen", "Tea Ceremony Room", "Sake Tasting Lounge"],
        description: "A 17-story tower designed as a traditional Japanese inn with tatami mat floors throughout, kimono-clad hosts, and natural open-air onsen waters."
      }
    ],
    activities: [
      {
        id: "act-tokyo-shibuya-sky",
        title: "Shibuya Crossing VIP Sky Lounge & Omotesando Architecture",
        category: "Urban Sightseeing",
        duration: "3.5 Hours",
        rating: 4.97,
        reviews: 2150,
        price: 110,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80",
        timeSlot: "04:30 PM - 08:00 PM",
        lat: 35.6595,
        lng: 139.7005,
        tags: ["Shibuya Sky Rooftop", "Sunset Cocktails", "Pritzker Architecture"],
        highlights: ["Exclusive access to the Shibuya Sky rooftop 360° open-air observatory", "Watch thousands navigate the world-famous scramble crossing below", "Guided stroll through Omotesando's iconic luxury architectural facades"]
      },
      {
        id: "act-tokyo-tsukiji-sushi",
        title: "Tsukiji Outer Market Private Masterclass & Omakase Feast",
        category: "Gastronomy & Culture",
        duration: "4 Hours",
        rating: 4.99,
        reviews: 1980,
        price: 195,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
        timeSlot: "08:30 AM - 12:30 PM",
        lat: 35.6655,
        lng: 139.7707,
        tags: ["Master Sushi Chef", "Tsukiji Fish Market", "Tuna Auction Walkthrough"],
        highlights: ["Tour historic market stalls with a 3rd-generation fishmonger", "Private nigiri preparation masterclass using premium bluefin tuna and uni", "10-course seasonal omakase tasting paired with rare Junmai Daiginjo sake"]
      },
      {
        id: "act-tyo-neon-food",
        title: "Shinjuku & Shibuya Neon Alleys Gastronomic Safari",
        category: "Nightlife & Food",
        duration: "3.5 Hours",
        rating: 4.94,
        reviews: 2150,
        price: 145,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=800&q=80",
        timeSlot: "06:00 PM - 09:30 PM",
        lat: 35.6938,
        lng: 139.7034,
        tags: ["Golden Gai", "Omoide Yokocho", "Sake Tasting"],
        highlights: ["Navigate tiny 6-seat izakayas tucked behind paper lanterns", "Taste charcoal yakitori, A5 wagyu skewers, and craft sakes", "Cross Shibuya Scramble at peak neon illumination"]
      }
    ]
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "Japan",
    continent: "Asia",
    tier: "city",
    regionId: "japan",
    tagline: "Imperial City of Two Thousand Zen Temples & Geishas",
    description: "The cultural soul of Japan, Kyoto preserves ancient cedar pagodas, moss-carpeted rock gardens, bamboo groves, and timeless tea ceremony pavilions.",
    lat: 35.0116,
    lng: 135.7681,
    elevation: "50m",
    bestSeason: "March - May / Oct - Nov",
    currency: "USD / JPY",
    weather: "20°C / Serene breeze",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-kyo-suiran",
        name: "Suiran Luxury Collection Hotel Kyoto",
        type: "Arashiyama Riverside Ryokan",
        rating: 4.95,
        reviews: 890,
        pricePerNight: 980,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1507038772120-7ffe76778f01?auto=format&fit=crop&w=800&q=80",
        address: "12 Susukinobaba-cho, Saga-Tenryuji, Ukyo-ku",
        lat: 35.0150,
        lng: 135.6740,
        tags: ["Arashiyama River View", "Open-air Onsen", "Imperial Kaiseki"],
        amenities: ["Private Open-Air Spring Bath", "Kyo-Kaiseki Fine Dining", "Private Boat Transfer"],
        description: "Set along the peaceful Oi River in Arashiyama, marrying centuries-old imperial aesthetics with modern five-star ryokan comforts."
      }
    ],
    activities: [
      {
        id: "act-kyo-fushimi",
        title: "Fushimi Inari Ten Thousand Torii Sunrise Trek & Bamboo Grove",
        category: "Spiritual Culture",
        duration: "4 Hours",
        rating: 4.98,
        reviews: 2300,
        price: 90,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
        timeSlot: "06:00 AM - 10:00 AM",
        lat: 34.9671,
        lng: 135.7727,
        tags: ["Torii Gates", "Shinto Blessing", "Private Priest"],
        highlights: ["Walk the vibrant vermilion torii gates at sunrise before tourist crowds arrive", "Receive a traditional wooden plaque blessing from a resident Shinto priest"]
      }
    ]
  },
  {
    id: "hakone",
    name: "Hakone",
    country: "Japan",
    continent: "Asia",
    tier: "town",
    regionId: "japan",
    tagline: "Volcanic Hot Spring Hamlet with Mount Fuji Vistas",
    description: "Nestled inside a volcanic caldera, Hakone is famed for natural geothermal onsens, Lake Ashi pirate boat cruises, and iconic views of Mount Fuji.",
    lat: 35.2323,
    lng: 139.1069,
    elevation: "108m",
    bestSeason: "Year round",
    currency: "USD / JPY",
    weather: "17°C / Steaming mountain air",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-hak-gora-kadan",
        name: "Gora Kadan",
        type: "Former Imperial Family Onsen Ryokan",
        rating: 4.97,
        reviews: 740,
        pricePerNight: 1200,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1507038772120-7ffe76778f01?auto=format&fit=crop&w=800&q=80",
        address: "1300 Gora, Hakone-machi",
        lat: 35.2480,
        lng: 139.0480,
        tags: ["Imperial Villa", "Mineral Spring Waterfall", "Tatami Suites"],
        amenities: ["Private Cypress Wood Onsen", "Multi-Course Kaiseki", "Spa Kadan Deep Tissue"],
        description: "Regarded as one of the finest ryokans in Japan, situated on the grounds of the former summer retreat of Kan'in-no-miya imperial family."
      }
    ],
    activities: [
      {
        id: "act-hak-lake-ashi",
        title: "Lake Ashi Torii Gate Kayak & Owakudani Black Egg Geothermal Walk",
        category: "Volcanic Nature",
        duration: "4 Hours",
        rating: 4.92,
        reviews: 890,
        price: 110,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:00 AM - 01:00 PM",
        lat: 35.2050,
        lng: 139.0220,
        tags: ["Mount Fuji Reflection", "Floating Torii Gate", "Black Eggs"],
        highlights: ["Paddle up to the iconic floating red Torii gate of Hakone Shrine", "Taste black eggs boiled in sulfurous volcanic vents said to add 7 years to your life"]
      }
    ]
  },

  // ==========================================
  // ITALY & AMALFI REGION
  // ==========================================
  {
    id: "amalfi-coast",
    name: "Amalfi Coast",
    country: "Italy",
    continent: "Europe",
    tier: "hub",
    regionId: "italy",
    tagline: "Dramatic Pastel Cliffs, Azure Waters & Mediterranean Glamour",
    description: "Clinging dramatically to sheer limestone cliffs plunging into the Tyrrhenian Sea, the Amalfi Coast features pastel villages, terraced lemon groves, and timeless Italian elegance.",
    lat: 40.6340,
    lng: 14.6027,
    elevation: "20m",
    bestSeason: "May - October",
    currency: "USD / EUR",
    weather: "26°C / Golden sunshine",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
    livingSpaces: [
      {
        id: "stay-amalfi-sirenuse",
        name: "Le Sirenuse Positano",
        type: "Iconic Cliffside Palace",
        rating: 4.97,
        reviews: 980,
        pricePerNight: 1650,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        address: "Via Cristoforo Colombo 30, Positano",
        lat: 40.6291,
        lng: 14.4862,
        tags: ["Positano Bay View", "Champagne Bar", "Antique Furniture"],
        amenities: ["Lemon Tree Pool Deck", "La Sponda 400-Candle Restaurant", "Wooden Riva Boat Excursions", "Aveda Spa"],
        description: "An aristocratic seaside mansion converted into one of the world's most romantic boutique hotels, overlooking the colorful bay of Positano."
      }
    ],
    activities: [
      {
        id: "act-amalfi-riva",
        title: "Private Wooden Riva Yacht Cruise to Capri & Blue Grotto",
        category: "Marine Adventure",
        duration: "7 Hours",
        rating: 4.98,
        reviews: 840,
        price: 490,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:30 AM - 04:30 PM",
        lat: 40.5507,
        lng: 14.2426,
        tags: ["Private Yacht", "Capri Faraglioni", "Champagne & Limoncello"],
        highlights: ["Sail along secret sea caves and swimming grottos", "Circumnavigate the dramatic Faraglioni sea stacks", "Chilled Prosecco, fresh figs, and local mozzarella aboard"]
      }
    ]
  },
  {
    id: "positano",
    name: "Positano",
    country: "Italy",
    continent: "Europe",
    tier: "town",
    regionId: "italy",
    tagline: "Cascading Pastel Cliffside Village & Glamorous Boutiques",
    description: "Positano cascades in pastel pinks, ochres, and terraced wisterias straight down a vertical limestone cliff toward dark volcanic pebble beaches.",
    lat: 40.6281,
    lng: 14.4850,
    elevation: "30m",
    bestSeason: "May - October",
    currency: "USD / EUR",
    weather: "26°C / Mediterranean warmth",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-pos-san-pietro",
        name: "Il San Pietro di Positano",
        type: "Cliff-Carved 5-Star Haven",
        rating: 4.98,
        reviews: 790,
        pricePerNight: 1750,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
        address: "Via Laurito 2, Positano",
        lat: 40.6230,
        lng: 14.4980,
        tags: ["Private Cove Beach", "Cliffside Elevator", "Michelin Dining"],
        amenities: ["Rock Elevator to Beach Cove", "Carlino Seaside Trattoria", "Organic Cliff Gardens"],
        description: "Carved into the sheer headland cliffs outside Positano, featuring a lift bored straight through the rock down to a private cove."
      }
    ],
    activities: [
      {
        id: "act-pos-limoncello",
        title: "Terraced Lemon Grove Walk & Artisan Limoncello Making",
        category: "Culinary & Agriculture",
        duration: "2.5 Hours",
        rating: 4.93,
        reviews: 910,
        price: 80,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        timeSlot: "03:00 PM - 05:30 PM",
        lat: 40.6290,
        lng: 14.4860,
        tags: ["Sfusato Amalfitano Lemons", "Limoncello Tasting", "Pergola Views"],
        highlights: ["Pick giant aromatic lemons under centuries-old pergola nets", "Mix organic essential lemon peel spirits with a third-generation master distiller"]
      }
    ]
  },
  {
    id: "ravello",
    name: "Ravello",
    country: "Italy",
    continent: "Europe",
    tier: "town",
    regionId: "italy",
    tagline: "Clifftop Eagle's Nest of Classical Music & Floating Terraces",
    description: "Suspended 365 meters above the sparkling sea, Ravello is the serene crown jewel of the coast, inspiring Wagner, Virginia Woolf, and the Ravello Music Festival.",
    lat: 40.6491,
    lng: 14.6114,
    elevation: "365m",
    bestSeason: "May - October",
    currency: "USD / EUR",
    weather: "24°C / Cool sea breeze",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-rav-caruso",
        name: "Belmond Hotel Caruso",
        type: "11th-Century Clifftop Palace",
        rating: 4.96,
        reviews: 680,
        pricePerNight: 1450,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        address: "Piazza San Giovanni del Toro 2, Ravello",
        lat: 40.6508,
        lng: 14.6120,
        tags: ["Floating Infinity Pool", "Roman Frescoes", "Wagner Garden"],
        amenities: ["World-Famous Infinity Pool", "Sommelier Tastings", "Sunset Boat Shuttle"],
        description: "An aristocratic palace floating high above the Mediterranean with perhaps the most famous infinity pool in the world."
      }
    ],
    activities: [
      {
        id: "act-rav-villa-cimbrone",
        title: "Villa Cimbrone Infinity Terrace & Villa Rufolo Gardens",
        category: "Gardens & Architecture",
        duration: "3 Hours",
        rating: 4.97,
        reviews: 1140,
        price: 65,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 01:00 PM",
        lat: 40.6470,
        lng: 14.6130,
        tags: ["Terrazza dell'Infinito", "Marble Busts", "Panoramic Sea 360°"],
        highlights: ["Stand on the marble-busted Terrace of Infinity projecting out over the sea", "Explore the ancient Moorish cloisters where Richard Wagner conceived Parsifal"]
      }
    ]
  },

  // ==========================================
  // ICELAND REGION
  // ==========================================
  {
    id: "reykjavik",
    name: "Reykjavik & Golden Circle",
    country: "Iceland",
    continent: "Europe",
    tier: "hub",
    regionId: "iceland",
    tagline: "Land of Fire, Ice, Geothermal Lagoons & Aurora Borealis",
    description: "The gateway to Iceland's dramatic volcanic landscape of erupting geysers, thunderous waterfalls, basalt sea arches, and glowing dancing auroras.",
    lat: 64.1466,
    lng: -21.9426,
    elevation: "15m",
    bestSeason: "Sept - April (Aurora) / June - Aug",
    currency: "USD / ISK",
    weather: "7°C / Crisp Nordic air",
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1200&q=80",
    livingSpaces: [
      {
        id: "stay-ice-retreat",
        name: "The Retreat at Blue Lagoon",
        type: "Subterranean Geothermal Sanctuary",
        rating: 4.95,
        reviews: 790,
        pricePerNight: 1450,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
        address: "Nordurljosavegur 11, Grindavík",
        lat: 63.8804,
        lng: -22.4495,
        tags: ["Private Mineral Lagoon", "Moss Lava Fields", "Subterranean Spa"],
        amenities: ["Private Lagoon Access from Room", "In-water Massages", "Lava Restaurant Fine Dining", "Northern Lights Wakeup Call"],
        description: "Built straight into an 800-year-old lava flow, offering direct private access to the healing silica-rich turquoise waters of the Blue Lagoon."
      }
    ],
    activities: [
      {
        id: "act-ice-aurora-superjeep",
        title: "Superjeep Northern Lights Chase & Glacier Walk",
        category: "Arctic Expedition",
        duration: "6 Hours",
        rating: 4.97,
        reviews: 1640,
        price: 220,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=800&q=80",
        timeSlot: "08:00 PM - 02:00 AM",
        lat: 64.2558,
        lng: -21.1295,
        tags: ["Northern Lights", "Giant 46-inch Superjeep", "Hot Cocoa & Brennivín"],
        highlights: ["Navigate deep highland snow to reach cloudless aurora clearings", "Professional astro-photographer portraits included", "Warming thermos of spiced hot cocoa and Icelandic schnapps"]
      }
    ]
  },
  {
    id: "vik",
    name: "Vík í Mýrdal",
    country: "Iceland",
    continent: "Europe",
    tier: "town",
    regionId: "iceland",
    tagline: "Black Basalt Sands & Reynisdrangar Sea Stacks",
    description: "Iceland's southernmost village, nestled under the ice-capped Katla volcano, famous for black volcanic sand beaches, puffin cliffs, and columnar basalt caves.",
    lat: 63.4186,
    lng: -19.0060,
    elevation: "5m",
    bestSeason: "Year round",
    currency: "USD / ISK",
    weather: "6°C / Dramatic arctic coast",
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-vik-hotel",
        name: "Hotel Kría Vík",
        type: "Modern Nordic Basalt Retreat",
        rating: 4.88,
        reviews: 620,
        pricePerNight: 340,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80",
        address: "Sléttuvegur, 870 Vík",
        lat: 63.4210,
        lng: -19.0090,
        tags: ["Black Beach Views", "Glass Panoramic Dining", "Fireplace Bar"],
        amenities: ["Mountain View Balconies", "Drangar Restaurant", "Aurora Wake-up Service"],
        description: "Crisp contemporary Scandinavian design framed by towering green sea palisades and black volcanic sands."
      }
    ],
    activities: [
      {
        id: "act-vik-katla-icecave",
        title: "Katla Volcano Blue Subglacial Ice Cave Expedition",
        category: "Glacial Caving",
        duration: "3.5 Hours",
        rating: 4.99,
        reviews: 950,
        price: 195,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 01:30 PM",
        lat: 63.6300,
        lng: -19.0500,
        tags: ["Blue Crystal Ice", "Underground Glacier", "Crampon Trek"],
        highlights: ["Explore neon sapphire ice tunnels inside the Kötlujökull glacier", "Witness black volcanic ash layers frozen inside 800-year-old ice"]
      }
    ]
  },

  // ==========================================
  // CANADA & ROCKIES REGION
  // ==========================================
  {
    id: "banff",
    name: "Banff & Lake Louise",
    country: "Canada",
    continent: "North America",
    tier: "hub",
    regionId: "canada",
    tagline: "Glacial Turquoise Waters & Rocky Mountain Wilderness",
    description: "Nestled in the heart of the Canadian Rockies, Banff dazzles with neon turquoise glacial lakes, soaring jagged peaks, hot springs, and roaming elk.",
    lat: 51.1784,
    lng: -115.5708,
    elevation: "1,383m",
    bestSeason: "June - Sept / Dec - April (Ski)",
    currency: "USD / CAD",
    weather: "18°C / Alpine breeze",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1200&q=80",
    livingSpaces: [
      {
        id: "stay-banff-fairmont",
        name: "Fairmont Chateau Lake Louise",
        type: "Lakeside Heritage Castle",
        rating: 4.9,
        reviews: 2100,
        pricePerNight: 850,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80",
        address: "111 Lake Louise Dr, Lake Louise",
        lat: 51.4177,
        lng: -116.2168,
        tags: ["Glacier Front", "Canoe Boathouse", "UNESCO World Heritage"],
        amenities: ["Victoria Glacier Panorama", "Alpine Guides Included", "Lakeside Fondue Restaurant", "Full Thermal Spa"],
        description: "Perched on the shores of emerald Lake Louise against the monumental backdrop of Victoria Glacier."
      }
    ],
    activities: [
      {
        id: "act-banff-moraine-canoe",
        title: "Moraine Lake Sunrise Canoe & Valley of Ten Peaks Trek",
        category: "Alpine Adventure",
        duration: "5 Hours",
        rating: 4.99,
        reviews: 1750,
        price: 170,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
        timeSlot: "05:15 AM - 10:15 AM",
        lat: 51.3217,
        lng: -116.1860,
        tags: ["Valley of 10 Peaks", "Wooden Canoe Paddling", "Glacial Blue Water"],
        highlights: ["Paddle silent waters as golden sunrise hits the Ten Peaks", "Exclusive park access before general shuttle crowds", "Gourmet hot trail breakfast with Canadian maple pastries"]
      }
    ]
  },
  {
    id: "canmore",
    name: "Canmore",
    country: "Canada",
    continent: "North America",
    tier: "town",
    regionId: "canada",
    tagline: "Three Sisters Mountain Town & High Nordic Centre",
    description: "Located right at the gates of Banff National Park beneath the iconic Three Sisters peaks, Canmore is an authentic mountain town celebrated for craft distilleries and alpine trails.",
    lat: 51.0890,
    lng: -115.3590,
    elevation: "1,309m",
    bestSeason: "Year round",
    currency: "USD / CAD",
    weather: "17°C / Pine scent",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-canmore-malcolm",
        name: "The Malcolm Hotel",
        type: "Highland Luxury Mountain Castle",
        rating: 4.92,
        reviews: 870,
        pricePerNight: 390,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
        address: "321 Spring Creek Dr, Canmore",
        lat: 51.0910,
        lng: -115.3540,
        tags: ["Heated Rooftop Pool", "Three Sisters Views", "Spring Creek"],
        amenities: ["Rooftop Heated Mountain Pool", "Stirling Grill", "Creek Boardwalk Access"],
        description: "A grand Scottish highland-inspired hotel with outdoor hot tubs looking directly up at the towering Three Sisters massif."
      }
    ],
    activities: [
      {
        id: "act-canmore-grassi",
        title: "Grassi Lakes Emerald Pools & Bow Valley Wildlife Hike",
        category: "Mountain Trails",
        duration: "3 Hours",
        rating: 4.91,
        reviews: 1200,
        price: 55,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:00 AM - 12:00 PM",
        lat: 51.0690,
        lng: -115.4020,
        tags: ["Turquoise Pools", "Prehistoric Pictographs", "Waterfall Vista"],
        highlights: ["Hike up to twin glowing turquoise pools fed by underground rock springs", "Observe ancient First Nations ochre pictographs on limestone cliffs"]
      }
    ]
  },

  // ==========================================
  // BALI & INDONESIA REGION
  // ==========================================
  {
    id: "bali",
    name: "Bali (Ubud & Uluwatu)",
    country: "Indonesia",
    continent: "Asia",
    tier: "hub",
    regionId: "bali",
    tagline: "Emerald Rice Terraces, Ancient Temples & Cliffside Surf",
    description: "The Island of the Gods features terraced jungle river valleys in Ubud and dramatic limestone cliffs plunging into barreling Indian Ocean waves in Uluwatu.",
    lat: -8.3405,
    lng: 115.0920,
    elevation: "200m",
    bestSeason: "April - October",
    currency: "USD / IDR",
    weather: "29°C / Tropical sun",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    livingSpaces: [
      {
        id: "stay-bali-hanging-gardens",
        name: "Hanging Gardens of Bali",
        type: "Cascading Jungle Pool Villa",
        rating: 4.93,
        reviews: 1290,
        pricePerNight: 740,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        address: "Buahan, Payangan, Gianyar, Ubud",
        lat: -8.4180,
        lng: 115.2450,
        tags: ["Twin Tiered Infinity Pool", "Ayung River Gorge", "Private Funicular"],
        amenities: ["Private Heated Plunge Pool", "Ayung River Spa Pavilion", "Balinese Temple Blessing", "Helipad"],
        description: "Renowned for its twin-tiered suspended swimming pool that floats over the dense rainforest canopy of the sacred Ayung River valley."
      }
    ],
    activities: [
      {
        id: "act-bali-ubud-swing",
        title: "Tegalalang Rice Terrace Trek & Jungle Waterfall Blessing",
        category: "Nature & Spirit",
        duration: "5 Hours",
        rating: 4.91,
        reviews: 2400,
        price: 80,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80",
        timeSlot: "07:30 AM - 12:30 PM",
        lat: -8.4320,
        lng: 115.2790,
        tags: ["Tegalalang Terraces", "Hidden Waterfall Swim", "Water Purification"],
        highlights: ["Walk ancient subak irrigation terraces with a local farmer", "Purification bath ritual at sacred Tirta Empul spring", "Swim under a secluded jungle cascade surrounded by hanging vines"]
      }
    ]
  },
  {
    id: "ubud",
    name: "Ubud",
    country: "Indonesia",
    continent: "Asia",
    tier: "town",
    regionId: "bali",
    tagline: "Sacred Monkey Forest & Holistic Arts Sanctuary",
    description: "The spiritual and artistic epicenter of Bali, cradled in ravines of lush jungle, artisan woodcarving villages, yoga shalas, and organic plant-based gastronomy.",
    lat: -8.5069,
    lng: 115.2625,
    elevation: "200m",
    bestSeason: "April - October",
    currency: "USD / IDR",
    weather: "28°C / Tropical warmth",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    livingSpaces: [
      {
        id: "stay-ubud-viceroy",
        name: "Viceroy Bali",
        type: "Valley of the Kings Luxury Villa",
        rating: 4.97,
        reviews: 840,
        pricePerNight: 820,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "Jl. Lanyahan, Br. Nagi, Ubud",
        lat: -8.4980,
        lng: 115.2770,
        tags: ["Private Heated Infinity Pool", "Valley Gorge Views", "Cascades Restaurant"],
        amenities: ["Private Valley Plunge Pool", "Lembah Spa", "Helipad Access", "Private Chauffeur"],
        description: "Family-owned sanctuary overlooking the dramatic Petanu River valley with thatched luxury villas and world-class French-Indonesian gastronomy."
      }
    ],
    activities: [
      {
        id: "act-ubud-campuhan",
        title: "Campuhan Ridge Walk & Organic Herbal Tea Degustation",
        category: "Nature & Wellness",
        duration: "3 Hours",
        rating: 4.9,
        reviews: 1320,
        price: 45,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
        timeSlot: "06:30 AM - 09:30 AM",
        lat: -8.5040,
        lng: 115.2530,
        tags: ["Sunrise Ridge", "River Confluence", "Fresh Jamu Herbs"],
        highlights: ["Hike along the undulating spine of the Campuhan ridge above two colliding rivers", "Taste golden turmeric-ginger jamu herbal elixirs prepared by a traditional healer"]
      }
    ]
  },

  // ==========================================
  // EGYPT & CAIRO REGION
  // ==========================================
  {
    id: "cairo",
    name: "Cairo & Giza",
    country: "Egypt",
    continent: "Africa",
    tier: "hub",
    regionId: "egypt",
    tagline: "Monuments of Eternity, Nile Feluccas & Khan el-Khalili",
    description: "Where millennia-old Great Pyramids stand silent watch over the golden Sahara dunes and the life-giving Nile River flows through historic minarets.",
    lat: 29.9792,
    lng: 31.1342,
    elevation: "75m",
    bestSeason: "October - April",
    currency: "USD / EGP",
    weather: "28°C / Dry gold sun",
    image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=1200&q=80",
    livingSpaces: [
      {
        id: "stay-cai-mena-house",
        name: "Marriott Mena House",
        type: "Historic Royal Pyramid Palace",
        rating: 4.88,
        reviews: 1850,
        pricePerNight: 520,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "6 Pyramids Road, Giza",
        lat: 29.9860,
        lng: 31.1330,
        tags: ["Direct Pyramid Views", "Palatial Gardens", "Churchill Suite"],
        amenities: ["Pyramid View Balcony", "Arabesque Chandeliers", "Oasis Pool", "Fine Egyptian Dining"],
        description: "A 19th-century royal hunting lodge with lush landscaped gardens sitting directly at the foot of the Great Pyramid of Khufu."
      }
    ],
    activities: [
      {
        id: "act-cai-pyramids-camels",
        title: "Private Giza Plateau Sunrise Camel Trek & Sphinx Access",
        category: "Ancient Wonders",
        duration: "4 Hours",
        rating: 4.96,
        reviews: 2190,
        price: 120,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80",
        timeSlot: "05:45 AM - 09:45 AM",
        lat: 29.9773,
        lng: 31.1325,
        tags: ["Great Sphinx", "Private Egyptologist", "Bedouin Tea"],
        highlights: ["Watch dawn break across Khufu, Khafre, and Menkaure", "Stand directly between the paws of the Great Sphinx", "Bedouin desert breakfast with fresh mint tea and flatbread"]
      }
    ]
  },
  // ==========================================
  // NEW YORK CITY, USA
  // ==========================================
  {
    id: "new-york",
    name: "New York City",
    country: "United States",
    continent: "North America",
    tier: "hub",
    regionId: "usa",
    tagline: "The Empire City of Broadway, Central Park & Skylines",
    description: "An iconic global metropolis brimming with world-class theater on Broadway, Michelin-starred gastronomy, high fashion along 5th Avenue, and historic architecture towering above Manhattan.",
    lat: 40.7128,
    lng: -74.0060,
    elevation: "10m",
    bestSeason: "April - June, Sept - Nov",
    currency: "USD ($)",
    weather: "22°C / Clear autumn skies",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80",
    livingSpaces: [
      {
        id: "stay-nyc-plaza",
        name: "The Plaza Hotel Fifth Avenue",
        type: "5-Star Historic Icon",
        rating: 4.95,
        reviews: 2450,
        pricePerNight: 980,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "768 5th Ave, New York, NY 10019",
        lat: 40.7645,
        lng: -73.9745,
        tags: ["Central Park South", "Historic Landmark", "White-Glove Service"],
        amenities: ["Guerlain Luxury Spa", "The Palm Court Afternoon Tea", "Rolls-Royce House Car", "High-Speed Wi-Fi"],
        description: "An eternal Manhattan landmark overlooking Central Park South, providing quintessential New York opulence, Michelin dining, and legendary hospitality."
      },
      {
        id: "stay-nyc-aman",
        name: "Aman New York",
        type: "Ultra-Luxury Urban Sanctuary",
        rating: 4.98,
        reviews: 620,
        pricePerNight: 1850,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "730 5th Ave, New York, NY 10019",
        lat: 40.7628,
        lng: -73.9752,
        tags: ["Crown Building", "Private Spa Houses", "Jazz Club"],
        amenities: ["25m Indoor Swimming Pool", "Cryotherapy Chamber", "Arva & Nama Restaurants", "Panoramic Garden Terrace"],
        description: "Occupying the historic Crown Building, Aman New York redefines urban luxury with multi-floor wellness facilities and soundproof suites."
      }
    ],
    activities: [
      {
        id: "act-nyc-broadway",
        title: "VIP Broadway Backstage Experience & Prime Orchestra Seating",
        category: "Theater & Culture",
        duration: "4.5 Hours",
        rating: 4.98,
        reviews: 1840,
        price: 320,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=800&q=80",
        timeSlot: "06:30 PM - 11:00 PM",
        lat: 40.7590,
        lng: -73.9845,
        tags: ["Cast Meet & Greet", "Prime Orchestra", "Historic Theater Tour"],
        highlights: ["Private walkthrough of backstage green rooms and costume archives", "Front orchestra seats to an award-winning musical", "Champagne toast with production cast members"]
      },
      {
        id: "act-nyc-centralpark-sunset",
        title: "Central Park Golden Hour Helicopter Flight & Private Yacht",
        category: "Scenic Aerial & Cruise",
        duration: "3 Hours",
        rating: 4.96,
        reviews: 1290,
        price: 260,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80",
        timeSlot: "05:00 PM - 08:00 PM",
        lat: 40.7829,
        lng: -73.9654,
        tags: ["Helicopter Skyline", "Statue of Liberty", "Sunset Champagne"],
        highlights: ["Spectacular aerial flight over Manhattan skyscrapers and Central Park", "Private chartered cruise sailing past the glowing Statue of Liberty at dusk", "Artisanal charcuterie and sommelier-selected champagne"]
      }
    ]
  },

  // ==========================================
  // PARIS, FRANCE
  // ==========================================
  {
    id: "paris",
    name: "Paris",
    country: "France",
    continent: "Europe",
    tier: "hub",
    regionId: "france",
    tagline: "The City of Light, Haute Couture & World-Class Art",
    description: "The global capital of art, fashion, gastronomy, and culture. Stroll the romantic banks of the Seine, marvel at the Eiffel Tower and Louvre masterpieces, and savor grand café culture.",
    lat: 48.8566,
    lng: 2.3522,
    elevation: "35m",
    bestSeason: "April - October",
    currency: "EUR (€) / USD",
    weather: "21°C / Sunny spring breeze",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
    livingSpaces: [
      {
        id: "stay-paris-ritz",
        name: "Ritz Paris Place Vendôme",
        type: "Palace Hotel & Historic Legend",
        rating: 4.97,
        reviews: 2100,
        pricePerNight: 1650,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "15 Place Vendôme, 75001 Paris",
        lat: 48.8682,
        lng: 2.3292,
        tags: ["Place Vendôme", "Chanel Spa", "Bar Hemingway"],
        amenities: ["Chanel Wellness Spa", "Private Garden Salon", "Espadon Michelin Dining"],
        description: "The pinnacle of French grand luxury and timeless Parisian elegance overlooking Place Vendôme."
      }
    ],
    activities: [
      {
        id: "act-paris-louvre-afterhours",
        title: "Louvre Museum Private After-Hours Tour & Mona Lisa Viewing",
        category: "Art & History",
        duration: "3 Hours",
        rating: 4.98,
        reviews: 1820,
        price: 240,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
        timeSlot: "06:30 PM - 09:30 PM",
        lat: 48.8606,
        lng: 2.3376,
        tags: ["After Hours", "Private Art Historian", "No Crowds"],
        highlights: ["Walk through the grand galleries of the Louvre without crowds", "Intimate viewing of the Mona Lisa, Venus de Milo, and Winged Victory", "Champagne reception in the Cour Napoléon"]
      }
    ]
  },
  // ==========================================
  // ROME, ITALY
  // ==========================================
  {
    id: "rome",
    name: "Rome",
    country: "Italy",
    continent: "Europe",
    tier: "hub",
    regionId: "italy",
    tagline: "Eternal City of the Colosseum & Renaissance Palaces",
    description: "An open-air museum where millennia of imperial history, baroque fountains, Vatican treasures, and irresistible trattorias converge.",
    lat: 41.9028,
    lng: 12.4964,
    elevation: "21m",
    bestSeason: "April - June, Sept - Nov",
    currency: "EUR (€) / USD",
    weather: "23°C / Mediterranean sunshine",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
    livingSpaces: [
      {
        id: "stay-rome-delavilla",
        name: "Hotel de la Ville, Rocco Forte",
        type: "5-Star Historic Palazzo",
        rating: 4.94,
        reviews: 1350,
        pricePerNight: 950,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "Via Sistina 69, 00187 Rome",
        lat: 41.9056,
        lng: 12.4855,
        tags: ["Spanish Steps", "Panoramic Rooftop Bar", "Irene Wellness"],
        amenities: ["Cielo Rooftop Lounge", "Private Spa & Hydrotherapy", "Michelin-Inspired Trattoria"],
        description: "A 18th-century palazzo poised atop the Spanish Steps offering sweeping panoramas over the Eternal City."
      }
    ],
    activities: [
      {
        id: "act-rome-colosseum-night",
        title: "Colosseum Underground Gladiators & Roman Forum Twilight Tour",
        category: "Ancient Archeology",
        duration: "3.5 Hours",
        rating: 4.97,
        reviews: 2400,
        price: 160,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80",
        timeSlot: "07:00 PM - 10:30 PM",
        lat: 41.8902,
        lng: 12.4922,
        tags: ["Gladiator Arena", "Underground Hypogeum", "Night Illumination"],
        highlights: ["Walk onto the Colosseum arena floor under dramatic floodlights", "Descend into the underground chambers where gladiators prepared", "Stroll through the Roman Forum with an archeological specialist"]
      }
    ]
  }
];

export const DESTINATIONS = [
  ...BASE_DESTINATIONS,
  ...ALL_50_US_STATES
];
