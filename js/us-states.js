/**
 * TravelFix United States 50-State Comprehensive Database
 * All 50 U.S. States with accurate coordinates, curated luxury/boutique living spaces,
 * and top-rated regional activities and excursions.
 */

export const ALL_50_US_STATES = [
  {
    id: "us-alabama",
    name: "Alabama",
    stateCode: "AL",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Gulf Coast Beaches, Rocket City & Southern Hospitality",
    description: "From the sugar-white sand beaches of Gulf Shores to Huntsville's Space & Rocket Center and historic Civil Rights landmarks, Alabama offers deep heritage and coastal warmth.",
    lat: 32.806671,
    lng: -86.791130,
    elevation: "150m",
    bestSeason: "March - May, Sept - Nov",
    currency: "USD ($)",
    weather: "24°C / Sunny Gulf breeze",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-al-grand-hotel",
        name: "The Grand Hotel Golf Resort & Spa",
        type: "Historic Luxury Resort",
        rating: 4.88,
        reviews: 920,
        pricePerNight: 390,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Point Clear, Mobile Bay, AL",
        tags: ["Mobile Bay Waterfront", "Robert Trent Jones Golf", "Signature Spa"],
        amenities: ["Championship Golf", "Hydrotherapy Spa", "Sunset Bayside Dining"],
        description: "Known as the Queen of Southern Resorts since 1847, set along historic Mobile Bay."
      }
    ],
    activities: [
      {
        id: "act-al-space-center",
        title: "U.S. Space & Rocket Center VIP Astronaut Experience",
        category: "Science & Space",
        duration: "4 Hours",
        rating: 4.95,
        reviews: 1420,
        price: 95,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 02:00 PM",
        tags: ["Saturn V Rocket", "Simulators", "NASA Artifacts"],
        highlights: ["Stand beneath the massive authentic Saturn V Moon rocket", "Experience neutral buoyancy and g-force astronaut training simulators"]
      }
    ]
  },
  {
    id: "us-alaska",
    name: "Alaska",
    stateCode: "AK",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "The Last Frontier: Glaciers, Fjords & Northern Lights",
    description: "Vast pristine wilderness encompassing Denali, tidal glaciers of Kenai Fjords, coastal brown bears, and mesmerizing Aurora Borealis night skies.",
    lat: 61.370716,
    lng: -152.404419,
    elevation: "600m",
    bestSeason: "June - August (Midnight Sun), Sept - March (Aurora)",
    currency: "USD ($)",
    weather: "14°C / Crisp subarctic air",
    image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-ak-sheldon-chalet",
        name: "Sheldon Chalet Denali Glacier",
        type: "Ultra-Luxury Nunatak Chalet",
        rating: 4.99,
        reviews: 210,
        pricePerNight: 2350,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        address: "Ruth Amphitheater, Denali National Park, AK",
        tags: ["Helicopter Access Only", "Denali Summit Views", "Glacier Trekking"],
        amenities: ["Private Heli Flights", "Five-Course Alaskan Gastronomy", "Aurora Observation Deck"],
        description: "Perched on a rocky nunatak in the amphitheater of Ruth Glacier with unmatched panoramas of Denali's peak."
      }
    ],
    activities: [
      {
        id: "act-ak-kenai-fjords",
        title: "Kenai Fjords Wildlife & Glacier Catamaran Cruise",
        category: "Nature & Marine Safari",
        duration: "6 Hours",
        rating: 4.97,
        reviews: 2890,
        price: 215,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:00 AM - 03:00 PM",
        tags: ["Calving Glaciers", "Orcas & Humpbacks", "Puffins"],
        highlights: ["Watch massive icebergs calve from Holgate Glacier into the ocean", "Spot pod of killer whales, humpbacks, sea otters, and puffins"]
      }
    ]
  },
  {
    id: "us-arizona",
    name: "Arizona",
    stateCode: "AZ",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Grand Canyon, Red Rocks of Sedona & Sonoran Deserts",
    description: "Home to the geological wonder of the Grand Canyon, mystical crimson vortexes of Sedona, and Scottsdale's world-class wellness retreats.",
    lat: 34.048928,
    lng: -111.093731,
    elevation: "1,200m",
    bestSeason: "October - May",
    currency: "USD ($)",
    weather: "26°C / Desert sunshine",
    image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-az-enchantment",
        name: "Enchantment Resort & Mii amo Spa",
        type: "Luxury Red Rock Sanctuary",
        rating: 4.95,
        reviews: 1340,
        pricePerNight: 850,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "Boynton Canyon, Sedona, AZ",
        tags: ["Boynton Canyon", "Vortex Energy", "Mii amo Destination Spa"],
        amenities: ["Private Adobe Casitas", "Stargazing Astronomy", "Native Clay Body Treatments"],
        description: "Nestled within the towering red rock canyon walls of Sedona, providing unparalleled rejuvenation."
      }
    ],
    activities: [
      {
        id: "act-az-grandcanyon-heli",
        title: "Grand Canyon South Rim VIP Helicopter & Sunset Tour",
        category: "Aerial & Scenic",
        duration: "4 Hours",
        rating: 4.98,
        reviews: 3400,
        price: 295,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
        timeSlot: "03:30 PM - 07:30 PM",
        tags: ["Helicopter Flight", "Colorado River", "Sunset Champagne"],
        highlights: ["Soar across the Dragon Corridor into the deepest gorges of the Grand Canyon", "Watch the canyon walls glow in vibrant shades of gold, magenta, and copper at dusk"]
      }
    ]
  },
  {
    id: "us-arkansas",
    name: "Arkansas",
    stateCode: "AR",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "The Natural State: Ozark Mountains & Thermal Springs",
    description: "Famous for the rolling Ozark and Ouachita mountain ranges, historic thermal bathhouses in Hot Springs National Park, and world-class Crystal Bridges art.",
    lat: 35.201050,
    lng: -91.831833,
    elevation: "200m",
    bestSeason: "April - June, Sept - Nov",
    currency: "USD ($)",
    weather: "22°C / Fresh mountain air",
    image: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-ar-21c-bentonville",
        name: "21c Museum Hotel & The Arlington",
        type: "Contemporary Art & Thermal Retreat",
        rating: 4.86,
        reviews: 640,
        pricePerNight: 310,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Central Square, Bentonville / Hot Springs, AR",
        tags: ["Art Museum Hotel", "Thermal Springs", "Ozark Cuisine"],
        amenities: ["Contemporary Art Gallery", "The Hive Restaurant", "Spa Treatments"],
        description: "Combines 24/7 museum art collections with access to mountain trails and historic bathhouses."
      }
    ],
    activities: [
      {
        id: "act-ar-hot-springs",
        title: "Historic Bathhouse Row Mineral Soak & Ouachita Forest Hike",
        category: "Wellness & Nature",
        duration: "3.5 Hours",
        rating: 4.92,
        reviews: 820,
        price: 80,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1507525428033-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 01:30 PM",
        tags: ["Thermal Springs", "Gilded Age Baths", "Mountain Overlook"],
        highlights: ["Immerse in pure thermal geothermal waters at historic Buckstaff Bathhouse", "Scenic drive and canopy walk atop Hot Springs Mountain Tower"]
      }
    ]
  },
  {
    id: "us-california",
    name: "California",
    stateCode: "CA",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Pacific Coast Highway, Yosemite, Napa Valley & Hollywood",
    description: "The Golden State offers dramatic Big Sur coastlines, towering ancient redwoods, Yosemite waterfalls, world-renowned Napa vineyards, and vibrant culture from San Francisco to Los Angeles.",
    lat: 36.778261,
    lng: -119.417932,
    elevation: "300m",
    bestSeason: "Year-Round",
    currency: "USD ($)",
    weather: "23°C / Sunny Pacific coast",
    image: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-ca-post-ranch",
        name: "Post Ranch Inn Big Sur",
        type: "Ultra-Luxury Cliffside Sanctuary",
        rating: 4.98,
        reviews: 1650,
        pricePerNight: 1650,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Highway 1, Big Sur, CA",
        tags: ["Pacific Ocean Cliffs", "Infinity Jade Pools", "Sierra Mar Dining"],
        amenities: ["Cliffside Heated Pools", "Organic Garden Dining", "Stargazing Yurt Sessions"],
        description: "Perched 1,200 feet above the Pacific Ocean, offering organic architecture and majestic coastal views."
      },
      {
        id: "stay-ca-meadowood",
        name: "Meadowood Napa Valley",
        type: "Wine Country Estate & Spa",
        rating: 4.95,
        reviews: 1100,
        pricePerNight: 1200,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "St. Helena, Napa Valley, CA",
        tags: ["Private Vineyards", "Michelin Sommeliers", "Woodland Lodges"],
        amenities: ["Wine Tasting Reserve", "Thermal Mineral Pools", "Tennis & Croquet Lawns"],
        description: "An iconic 250-acre private estate nestled in the forested hillsides of Napa Valley."
      }
    ],
    activities: [
      {
        id: "act-ca-yosemite-trek",
        title: "Yosemite Valley Glacial Waterfalls & El Capitan Private Tour",
        category: "Alpine & National Parks",
        duration: "7 Hours",
        rating: 4.99,
        reviews: 3100,
        price: 240,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80",
        timeSlot: "08:00 AM - 03:00 PM",
        tags: ["Half Dome", "El Capitan", "Yosemite Falls"],
        highlights: ["Stand at the base of the sheer 3,000-foot granite face of El Capitan", "Witness the thundering mist of Upper and Lower Yosemite Falls", "Panoramic photo stop at Glacier Point overlooking Half Dome"]
      }
    ]
  },
  {
    id: "us-colorado",
    name: "Colorado",
    stateCode: "CO",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Rocky Mountain Peaks, Alpine Skiing & Golden Aspens",
    description: "A highland wonderland featuring 58 fourteen-thousand-foot peaks, premier ski towns like Aspen and Vail, Garden of the Gods, and scenic alpine trails.",
    lat: 39.550051,
    lng: -105.782067,
    elevation: "2,070m",
    bestSeason: "Dec - April (Skiing), June - Oct (Hiking & Aspens)",
    currency: "USD ($)",
    weather: "18°C / Crisp alpine breeze",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-co-little-nell",
        name: "The Little Nell Aspen",
        type: "5-Star Ski-in/Ski-out Relais & Châteaux",
        rating: 4.97,
        reviews: 1490,
        pricePerNight: 1450,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        address: "675 E Durant Ave, Aspen, CO",
        tags: ["Aspen Mountain Ski-in", "Wine Cellar of 20,000 Bottles", "Element 47"],
        amenities: ["Ski Concierge", "Heated Outdoor Pool & Jacuzzi", "First Tracks Early Mountain Access"],
        description: "Aspen's only five-star, five-diamond ski-in/ski-out hotel, located at the base of Aspen Mountain."
      },
      {
        id: "stay-co-broadmoor",
        name: "The Broadmoor Colorado Springs",
        type: "Historic Grand Mountain Resort",
        rating: 4.94,
        reviews: 2300,
        pricePerNight: 720,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "1 Lake Ave, Colorado Springs, CO",
        tags: ["Cheyenne Lake", "Pikes Peak Views", "World-Class Golf"],
        amenities: ["Championship Golf Courses", "Forbes 5-Star Spa", "Falconry & Wilderness Excursions"],
        description: "A legendary grand resort sprawling across 5,000 acres at the gateway to the Colorado Rocky Mountains."
      }
    ],
    activities: [
      {
        id: "act-co-rocky-mountain-heli",
        title: "Rocky Mountain High Alpine Helicopter & Continental Divide Tour",
        category: "Scenic Aerial & Mountain",
        duration: "3.5 Hours",
        rating: 4.98,
        reviews: 2150,
        price: 285,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:00 AM - 12:30 PM",
        tags: ["Continental Divide", "Glacial Cirques", "14ers"],
        highlights: ["Fly past snow-capped 14,000-foot summits along the Continental Divide", "Gaze down at turquoise alpine lakes and golden aspen forests"]
      }
    ]
  },
  {
    id: "us-connecticut",
    name: "Connecticut",
    stateCode: "CT",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "New England Seaports, Ivy League Heritage & Coastal Charm",
    description: "Classic New England beauty boasting historic Mystic Seaport, Yale University's Gothic campuses, and peaceful Long Island Sound coastal villages.",
    lat: 41.603221,
    lng: -73.087749,
    elevation: "150m",
    bestSeason: "May - October",
    currency: "USD ($)",
    weather: "20°C / Coastal New England air",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-ct-mayflower-inn",
        name: "Mayflower Inn & Spa, Auberge Resorts",
        type: "Country Estate & Holistic Well-Being",
        rating: 4.92,
        reviews: 870,
        pricePerNight: 890,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "Washington, CT",
        tags: ["THE WELL Spa", "58 Acres of Gardens", "Historic Inn"],
        amenities: ["Holistic Health Treatments", "Garden Walks", "Fine New England Dining"],
        description: "An idyllic country retreat set in 58 acres of landscaped gardens and woodlands."
      }
    ],
    activities: [
      {
        id: "act-ct-mystic-seaport",
        title: "Mystic Historic Seaport & Wooden Whaling Ship Sailing",
        category: "Maritime History",
        duration: "3.5 Hours",
        rating: 4.93,
        reviews: 1100,
        price: 85,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:30 AM - 02:00 PM",
        tags: ["Charles W. Morgan", "Tall Ships", "Seaport Village"],
        highlights: ["Board the Charles W. Morgan, the world's only surviving wooden whaleship", "Traditional sailing cruise along the historic Mystic River"]
      }
    ]
  },
  {
    id: "us-delaware",
    name: "Delaware",
    stateCode: "DE",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "The First State: Rehoboth Beaches & Historic Mansions",
    description: "Offers pristine ocean dunes at Cape Henlopen, the vibrant boardwalk of Rehoboth Beach, and the grand du Pont family estates in the Brandywine Valley.",
    lat: 38.910832,
    lng: -75.527670,
    elevation: "20m",
    bestSeason: "May - September",
    currency: "USD ($)",
    weather: "22°C / Ocean coastal breeze",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-de-boardwalk-plaza",
        name: "The Boardwalk Plaza Hotel",
        type: "Victorian Oceanfront Hotel",
        rating: 4.87,
        reviews: 750,
        pricePerNight: 340,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Rehoboth Beach, DE",
        tags: ["Oceanfront Boardwalk", "Victorian Decor", "Rooftop Hot Tub"],
        amenities: ["Victoria's Oceanfront Dining", "Private Heated Pool", "Direct Beach Access"],
        description: "Victorian elegance situated directly on the Rehoboth Beach oceanfront boardwalk."
      }
    ],
    activities: [
      {
        id: "act-de-nemours-estate",
        title: "Nemours Estate & Brandywine du Pont Gilded Mansions Tour",
        category: "History & Architecture",
        duration: "4 Hours",
        rating: 4.95,
        reviews: 890,
        price: 75,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 02:00 PM",
        tags: ["French Chateau", "Formal Gardens", "Antique Cars"],
        highlights: ["Tour the 77-room French neoclassic mansion of Alfred I. du Pont", "Walk through the largest formal French garden in North America"]
      }
    ]
  },
  {
    id: "us-florida",
    name: "Florida",
    stateCode: "FL",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "The Sunshine State: Miami Art Deco, Florida Keys & Everglades",
    description: "Endless sunshine, tropical turquoise waters in Key West, glamorous South Beach nightlife, Everglades airboat safaris, and Kennedy Space Center.",
    lat: 27.664827,
    lng: -81.515754,
    elevation: "30m",
    bestSeason: "Nov - April (Cool & Dry), Year-Round Sun",
    currency: "USD ($)",
    weather: "28°C / Tropical sunshine",
    image: "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-fl-faena-miami",
        name: "Faena Hotel Miami Beach",
        type: "5-Star Theatrical Luxury Palace",
        rating: 4.96,
        reviews: 2100,
        pricePerNight: 980,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "3201 Collins Ave, Miami Beach, FL",
        tags: ["Damien Hirst Art", "Tierra Santa Healing Spa", "Los Fuegos by Francis Mallmann"],
        amenities: ["Private Cabana Beach Club", "Live Theater Cabaret", "Oceanfront Suites"],
        description: "Opulent cinematic design featuring monumental contemporary art overlooking the Atlantic Ocean."
      },
      {
        id: "stay-fl-little-palm-island",
        name: "Little Palm Island Resort & Spa",
        type: "Private Island Paradise",
        rating: 4.98,
        reviews: 840,
        pricePerNight: 1950,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "Torch Key, Florida Keys, FL",
        tags: ["Private Island", "Seaplane Arrival", "No Phones or TVs"],
        amenities: ["Thatched-Roof Bungalows", "Yacht Transfers", "Balinese Spa"],
        description: "America's only private island resort, hidden away off the coast of the Florida Keys."
      }
    ],
    activities: [
      {
        id: "act-fl-everglades-airboat",
        title: "Everglades Private Airboat & Alligator Wildlife Safari",
        category: "Eco-Safari & Wildlife",
        duration: "3.5 Hours",
        rating: 4.97,
        reviews: 3800,
        price: 110,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:00 AM - 12:30 PM",
        tags: ["Wild Alligators", "Airboat Glide", "River of Grass"],
        highlights: ["Glide across pristine sawgrass marshes on a high-speed private airboat", "Spot wild alligators, manatees, roseate spoonbills, and bald eagles"]
      }
    ]
  },
  {
    id: "us-georgia",
    name: "Georgia",
    stateCode: "GA",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Historic Savannah Squares, Golden Isles & Atlanta Culture",
    description: "Spanish moss-draped historic squares in Savannah, the lush Golden Isles barrier reefs, Blue Ridge Mountains, and the thriving culinary scene of Atlanta.",
    lat: 32.157435,
    lng: -82.907123,
    elevation: "180m",
    bestSeason: "March - May, Sept - Nov",
    currency: "USD ($)",
    weather: "23°C / Warm southern breeze",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-ga-cloister-sea-island",
        name: "The Cloister at Sea Island",
        type: "5-Star Mediterranean Resort",
        rating: 4.96,
        reviews: 1720,
        pricePerNight: 850,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Sea Island, GA",
        tags: ["Private 5-Mile Beach", "Championship Golf", "Forbes 5-Star Spa"],
        amenities: ["Yacht Club", "Equestrian Center", "Gourmet Southern Coastal Dining"],
        description: "A private coastal estate honoring Mediterranean architecture and Southern traditions since 1928."
      }
    ],
    activities: [
      {
        id: "act-ga-savannah-walk",
        title: "Savannah Historic District & Ghost Lore Evening Walk",
        category: "History & Folklore",
        duration: "2.5 Hours",
        rating: 4.94,
        reviews: 2400,
        price: 45,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=800&q=80",
        timeSlot: "07:30 PM - 10:00 PM",
        tags: ["Spanish Moss", "Antebellum Mansions", "Forsyth Park"],
        highlights: ["Stroll beneath ancient live oaks draped in Spanish moss through 22 historic squares", "Explore the haunted legends of the Mercer-Williams House and Colonial Park Cemetery"]
      }
    ]
  },
  {
    id: "us-hawaii",
    name: "Hawaii",
    stateCode: "HI",
    country: "United States",
    continent: "Oceania / North America",
    tier: "state",
    regionId: "usa",
    tagline: "Volcanic Wonders, Na Pali Coast, Big Wave Surfing & Aloha Spirit",
    description: "An archipelago of volcanic islands featuring emerald sea cliffs, active lava flows at Kilauea, world-famous Waikiki beaches, and authentic Polynesian culture.",
    lat: 19.896766,
    lng: -155.582782,
    elevation: "500m",
    bestSeason: "Year-Round (April - Oct is peak sun)",
    currency: "USD ($)",
    weather: "27°C / Tropical trade winds",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-hi-halekulani",
        name: "Halekulani Waikiki & Four Seasons Hualalai",
        type: "5-Star Oceanfront Island Icon",
        rating: 4.98,
        reviews: 2480,
        pricePerNight: 1250,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
        address: "2199 Kalia Rd, Honolulu, HI",
        tags: ["Diamond Head Views", "Glass Tile Orchid Pool", "La Mer French Cuisine"],
        amenities: ["Spa Halekulani", "Sunset Hula on the Lawn", "Private Ocean Cabanas"],
        description: "Known as 'House Befitting Heaven', an oasis of tranquility fronting Waikiki Beach with views of Diamond Head."
      }
    ],
    activities: [
      {
        id: "act-hi-napali-catamaran",
        title: "Na Pali Coast Sunset Catamaran & Snorkel Expedition",
        category: "Marine & Coastal",
        duration: "5 Hours",
        rating: 4.99,
        reviews: 4200,
        price: 210,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
        timeSlot: "01:30 PM - 06:30 PM",
        tags: ["4,000-ft Sea Cliffs", "Spinner Dolphins", "Sea Caves"],
        highlights: ["Sail alongside the 4,000-foot emerald pinnacles and waterfalls of Kauai's Na Pali Coast", "Snorkel with green sea turtles and watch pods of acrobatic spinner dolphins"]
      }
    ]
  },
  {
    id: "us-idaho",
    name: "Idaho",
    stateCode: "ID",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Sun Valley Skiing, Sawtooth Mountains & Salmon River Rapids",
    description: "Rugged wilderness featuring the jagged Sawtooth range, world-renowned Sun Valley ski slopes, and the deep whitewater gorges of Hells Canyon.",
    lat: 44.068202,
    lng: -114.742041,
    elevation: "1,500m",
    bestSeason: "Dec - March (Skiing), June - Sept (Rafting & Hiking)",
    currency: "USD ($)",
    weather: "19°C / Clear mountain skies",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-id-sun-valley-lodge",
        name: "Sun Valley Lodge & Resort",
        type: "Historic Alpine Resort",
        rating: 4.93,
        reviews: 1320,
        pricePerNight: 580,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        address: "Sun Valley, ID",
        tags: ["Bald Mountain Skiing", "Hemingway Heritage", "20,000-sq-ft Spa"],
        amenities: ["Heated Outdoor Saltwater Pools", "Bowling Alley & Ice Rink", "Ski Valet"],
        description: "America's first destination ski resort, where chairlifts were invented in 1936."
      }
    ],
    activities: [
      {
        id: "act-id-salmon-river-rafting",
        title: "Salmon River of No Return Whitewater Expedition",
        category: "Rafting & Wilderness",
        duration: "6 Hours",
        rating: 4.98,
        reviews: 1540,
        price: 185,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:00 AM - 03:00 PM",
        tags: ["Class III-IV Rapids", "Granite Gorges", "Hot Springs Soak"],
        highlights: ["Paddle thrilling rapids carved through America's second-deepest gorge", "Soak in natural riverside geothermal hot springs between river runs"]
      }
    ]
  },
  {
    id: "us-illinois",
    name: "Illinois",
    stateCode: "IL",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Chicago Architectural Wonders, Lake Michigan & Route 66",
    description: "Towering skyscraper architecture along the Chicago River, world-renowned Art Institute, deep-dish gastronomy, and the historic origin of Route 66.",
    lat: 40.633125,
    lng: -89.398528,
    elevation: "180m",
    bestSeason: "May - October",
    currency: "USD ($)",
    weather: "21°C / Lake breeze",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-il-langham-chicago",
        name: "The Langham Chicago",
        type: "5-Star Riverfront Luxury",
        rating: 4.97,
        reviews: 2150,
        pricePerNight: 650,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "330 N Wabash Ave, Chicago, IL",
        tags: ["Mies van der Rohe Tower", "Chicago Riverfront", "Chuan Spa"],
        amenities: ["Hydrotherapy Herbal Bath", "Travelle River Lounge", "Indoor Lap Pool"],
        description: "Housed in a landmark skyscraper by Mies van der Rohe overlooking the Chicago River and lakefront."
      }
    ],
    activities: [
      {
        id: "act-il-architecture-cruise",
        title: "Chicago Architecture Center VIP River Cruise & Skydeck",
        category: "Architecture & Sights",
        duration: "3.5 Hours",
        rating: 4.99,
        reviews: 4900,
        price: 65,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
        timeSlot: "02:00 PM - 05:30 PM",
        tags: ["World-Famous Cruise", "Willis Tower Ledge", "Pritzker Buildings"],
        highlights: ["Docent-led narrative of over 50 historic and modern skyscrapers lining the river", "Step out onto 'The Ledge' glass balcony 1,353 feet up in the Willis Tower"]
      }
    ]
  },
  {
    id: "us-indiana",
    name: "Indiana",
    stateCode: "IN",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Indy 500 Motor Speedway, Lake Michigan Dunes & Covered Bridges",
    description: "Motorsports capital of the world with the historic Indianapolis Motor Speedway, alongside the shifting sand dunes of Lake Michigan and scenic Parke County.",
    lat: 40.267194,
    lng: -86.134902,
    elevation: "230m",
    bestSeason: "May - October",
    currency: "USD ($)",
    weather: "21°C / Midwest sunshine",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-in-west-baden",
        name: "West Baden Springs Hotel",
        type: "Historic Grand Atrium Resort",
        rating: 4.93,
        reviews: 1200,
        pricePerNight: 420,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "West Baden Springs, IN",
        tags: ["200-ft Free-Span Atrium", "Historic Mineral Springs", "Championship Golf"],
        amenities: ["Spa Mineral Baths", "Pete Dye Golf Course", "Formal Tea Service"],
        description: "Once called the 'Eighth Wonder of the World', featuring a magnificent 200-foot domed atrium."
      }
    ],
    activities: [
      {
        id: "act-in-indy-500",
        title: "Indianapolis Motor Speedway VIP Track Lap & Museum",
        category: "Motorsports & Racing",
        duration: "3 Hours",
        rating: 4.96,
        reviews: 1650,
        price: 85,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 01:00 PM",
        tags: ["Kiss the Bricks", "Indy 500 Winners", "Track Lap"],
        highlights: ["Ride around the historic 2.5-mile oval track and kiss the famous start-finish line bricks", "Inspect historic winning race cars and Borg-Warner Trophy"]
      }
    ]
  },
  {
    id: "us-iowa",
    name: "Iowa",
    stateCode: "IA",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Field of Dreams, Rolling Prairies & Covered Bridges of Madison County",
    description: "Heart of the American Midwest featuring the iconic Field of Dreams baseball field, the romantic covered bridges of Madison County, and Mississippi River bluffs.",
    lat: 41.878003,
    lng: -93.097702,
    elevation: "300m",
    bestSeason: "May - October",
    currency: "USD ($)",
    weather: "22°C / Prairie sunshine",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-ia-hotel-pattee",
        name: "Hotel Pattee & Des Moines Boutique Suites",
        type: "Historic Themed Boutique Hotel",
        rating: 4.87,
        reviews: 580,
        pricePerNight: 240,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "Perry / Des Moines, IA",
        tags: ["Themed Artisan Rooms", "Raccoon River Valley Trail", "Bowling Center"],
        amenities: ["Spa Sauna", "Locally Sourced Farm-to-Table", "Craft Beer Tavern"],
        description: "Celebrates Midwest craftsmanship with 40 individually designed artisan suites."
      }
    ],
    activities: [
      {
        id: "act-ia-field-of-dreams",
        title: "Field of Dreams Movie Site & Madison County Bridges Tour",
        category: "Cinema & Heritage",
        duration: "4 Hours",
        rating: 4.95,
        reviews: 1420,
        price: 65,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        timeSlot: "11:00 AM - 03:00 PM",
        tags: ["Cornfield Baseball", "Covered Bridges", "Film Location"],
        highlights: ["Step onto the legendary cornfield baseball diamond from the Oscar-nominated film", "Photograph the historic 1880s Roseman Covered Bridge of Madison County"]
      }
    ]
  },
  {
    id: "us-kansas",
    name: "Kansas",
    stateCode: "KS",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Flint Hills Tallgrass Prairies, Cosmosphere & Wild West Pioneers",
    description: "Sweeping Flint Hills prairies glowing under golden sunsets, world-class space artifacts at the Cosmosphere, and historic Dodge City frontier trails.",
    lat: 39.011902,
    lng: -98.484246,
    elevation: "600m",
    bestSeason: "April - June, Sept - Nov",
    currency: "USD ($)",
    weather: "23°C / Open prairie skies",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-ks-ambassador",
        name: "Ambassador Hotel & Flint Hills Ranch Casitas",
        type: "Boutique Heritage Hotel",
        rating: 4.89,
        reviews: 620,
        pricePerNight: 280,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Wichita / Flint Hills, KS",
        tags: ["Historic Bank Architecture", "Siena Tuscan Steakhouse", "Prairie Views"],
        amenities: ["Bespoke Concierge", "Valet Service", "Craft Speakeasy"],
        description: "Elegance housed in a restored 1926 classical revival landmark."
      }
    ],
    activities: [
      {
        id: "act-ks-cosmosphere",
        title: "Kansas Cosmosphere Space Center & Tallgrass Preserve",
        category: "Space History & Nature",
        duration: "4 Hours",
        rating: 4.97,
        reviews: 1300,
        price: 75,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 02:00 PM",
        tags: ["Apollo 13 Odyssey", "SR-71 Blackbird", "Tallgrass Bison"],
        highlights: ["View the authentic Apollo 13 command module 'Odyssey' and Soviet spacecraft", "Hike among wild bison herds in the last 4% of North America's tallgrass prairie"]
      }
    ]
  },
  {
    id: "us-kentucky",
    name: "Kentucky",
    stateCode: "KY",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Bourbon Trail, Kentucky Derby at Churchill Downs & Mammoth Cave",
    description: "The Bluegrass State is the birthplace of bourbon whiskey, champion thoroughbred horse farms, and the world's longest cave system at Mammoth Cave.",
    lat: 37.839333,
    lng: -84.270018,
    elevation: "230m",
    bestSeason: "April - June, Sept - Nov",
    currency: "USD ($)",
    weather: "22°C / Pleasant bluegrass breeze",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-ky-brown-hotel",
        name: "The Brown Hotel & 21c Museum Louisville",
        type: "Historic 1923 Grand Hotel",
        rating: 4.94,
        reviews: 1580,
        pricePerNight: 390,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "335 W Broadway, Louisville, KY",
        tags: ["Original Hot Brown Dish", "Georgian Revival", "Bourbon Bar"],
        amenities: ["J. Graham's Cafe", "Bourbon Sommelier Tasting", "Luxury Club Lounge"],
        description: "A beloved Louisville icon hosting royalty and Derby champions for over a century."
      }
    ],
    activities: [
      {
        id: "act-ky-bourbon-trail",
        title: "Kentucky Bourbon Trail Master Distillers Private Tour",
        category: "Gastronomy & Spirits",
        duration: "6 Hours",
        rating: 4.99,
        reviews: 2900,
        price: 195,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:30 AM - 03:30 PM",
        tags: ["Woodford Reserve", "Single Barrel Tasting", "Charred Oak Barrels"],
        highlights: ["Private walkthrough of limestone water stills and barrel aging rickhouses", "Sample rare single barrel reserve bourbons paired with artisan chocolates"]
      }
    ]
  },
  {
    id: "us-louisiana",
    name: "Louisiana",
    stateCode: "LA",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "New Orleans French Quarter, Bayou Swamps & Creole Gastronomy",
    description: "A cultural tapestry of vibrant jazz brass bands, Creole culinary mastery, historic cast-iron balconies in the French Quarter, and moss-draped bayou swamps.",
    lat: 30.984298,
    lng: -91.962333,
    elevation: "15m",
    bestSeason: "October - April (Mardi Gras & Jazz Fest)",
    currency: "USD ($)",
    weather: "25°C / Warm delta air",
    image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-la-roosevelt",
        name: "The Roosevelt New Orleans, Waldorf Astoria",
        type: "Historic Luxury Grand Dame",
        rating: 4.96,
        reviews: 2400,
        pricePerNight: 550,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "130 Roosevelt Way, New Orleans, LA",
        tags: ["Sazerac Bar Origin", "Waldorf Astoria Spa", "Rooftop Pool"],
        amenities: ["Famous Sazerac Cocktails", "Full-Service Luxury Spa", "Rooftop Garden Bar"],
        description: "Home of the original Ramos Gin Fizz and Sazerac Bar, steps from the French Quarter."
      }
    ],
    activities: [
      {
        id: "act-la-french-quarter-jazz",
        title: "French Quarter VIP Jazz Club & Creole Gastronomic Safari",
        category: "Music & Culinary",
        duration: "4 Hours",
        rating: 4.98,
        reviews: 3600,
        price: 135,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=800&q=80",
        timeSlot: "06:00 PM - 10:00 PM",
        tags: ["Preservation Hall", "Gumbo & Beignets", "Frenchmen Street"],
        highlights: ["Reserved priority seating at Preservation Hall for authentic New Orleans jazz", "Sample signature crawfish étouffée, gumbo, and hot beignets at iconic establishments"]
      }
    ]
  },
  {
    id: "us-maine",
    name: "Maine",
    stateCode: "ME",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Acadia National Park, Historic Lighthouses & Fresh Lobster Coves",
    description: "Dramatic rocky coastlines, granite peaks rising over the Atlantic at Acadia, historic coastal lighthouses, and authentic seaside lobster pounds.",
    lat: 45.253783,
    lng: -69.445469,
    elevation: "200m",
    bestSeason: "June - October (Foliage & Ocean Breezes)",
    currency: "USD ($)",
    weather: "19°C / Atlantic sea breeze",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-me-white-barn-inn",
        name: "White Barn Inn & Cape Arundel Inn",
        type: "5-Star Coastal New England Retreat",
        rating: 4.95,
        reviews: 980,
        pricePerNight: 780,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "Kennebunkport / Bar Harbor, ME",
        tags: ["Michelin-Caliber Dining", "Oceanfront Porch", "Bicycle Cruisers"],
        amenities: ["Award-Winning Fine Dining", "Private Lobster Boat Charters", "Holistic Spa"],
        description: "Classic coastal Maine charm combined with renowned culinary excellence."
      }
    ],
    activities: [
      {
        id: "act-me-acadia-cadillac",
        title: "Acadia Cadillac Mountain First Sunrise & Lobster Boat Cruise",
        category: "Nature & Maritime",
        duration: "5 Hours",
        rating: 4.99,
        reviews: 2800,
        price: 145,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
        timeSlot: "05:00 AM - 10:00 AM",
        tags: ["First US Sunrise", "Lobster Hauling", "Jordan Pond"],
        highlights: ["Watch the first sunrise illuminate the United States from the summit of Cadillac Mountain", "Head out on a traditional lobster boat and haul live traps in Frenchman Bay"]
      }
    ]
  },
  {
    id: "us-maryland",
    name: "Maryland",
    stateCode: "MD",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Chesapeake Bay Sailing, Blue Crabs & Historic Annapolis",
    description: "Sailing capital of America in historic Annapolis, blue crab feasts along the Chesapeake Bay, and the wild coastal horses of Assateague Island.",
    lat: 39.045755,
    lng: -76.641271,
    elevation: "80m",
    bestSeason: "April - October",
    currency: "USD ($)",
    weather: "22°C / Chesapeake breeze",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-md-perry-cabin",
        name: "Inn at Perry Cabin",
        type: "Luxury Chesapeake Bay Resort & Marina",
        rating: 4.94,
        reviews: 1120,
        pricePerNight: 720,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "St. Michaels, MD",
        tags: ["Sailing Fleet", "Links at Perry Cabin Golf", "Waterfront Spa"],
        amenities: ["Private 55-ft Hinckley Yachts", "Stars Restaurant", "Tennis & Croquet"],
        description: "A maritime sanctuary on the eastern shore of Chesapeake Bay."
      }
    ],
    activities: [
      {
        id: "act-md-annapolis-sailing",
        title: "Annapolis Naval Academy & Chesapeake Bay Schooner Sail",
        category: "Sailing & Heritage",
        duration: "3.5 Hours",
        rating: 4.94,
        reviews: 1540,
        price: 90,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
        timeSlot: "01:30 PM - 05:00 PM",
        tags: ["74-ft Schooner Woodwind", "Naval Academy", "Steamed Blue Crabs"],
        highlights: ["Take the helm of a 74-foot wooden schooner sailing past the Bay Bridge", "Tour the historic granite chapel and crypt of John Paul Jones at the US Naval Academy"]
      }
    ]
  },
  {
    id: "us-massachusetts",
    name: "Massachusetts",
    stateCode: "MA",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Boston Freedom Trail, Harvard & Cape Cod / Nantucket Dunes",
    description: "The cradle of American liberty featuring Boston's Freedom Trail, Harvard and MIT intellectual hubs, and the windswept coastal dunes of Cape Cod and Nantucket.",
    lat: 42.407211,
    lng: -71.382437,
    elevation: "50m",
    bestSeason: "May - October",
    currency: "USD ($)",
    weather: "21°C / Ocean breeze",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-ma-wharf-nantucket",
        name: "The Wauwinet Nantucket & The Newbury Boston",
        type: "5-Star Historic Heritage & Seaside Relais",
        rating: 4.97,
        reviews: 1890,
        pricePerNight: 950,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Boston / Nantucket, MA",
        tags: ["Private Nantucket Beach", "Rooftop Contessa", "Historic Boston Common"],
        amenities: ["TOPPER'S Wine Spectator Grand Award", "Private Boat Charters", "Butler Service"],
        description: "Combines cosmopolitan Back Bay Boston luxury with seaside Nantucket dunes."
      }
    ],
    activities: [
      {
        id: "act-ma-freedom-trail",
        title: "Boston Freedom Trail & Harvard Yard Private Walk",
        category: "American Revolution & History",
        duration: "4 Hours",
        rating: 4.98,
        reviews: 3200,
        price: 85,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:30 AM - 01:30 PM",
        tags: ["Paul Revere House", "Old North Church", "Harvard Yard"],
        highlights: ["Walk the 2.5-mile red brick trail connecting 16 nationally significant historical sites", "Step inside the oldest remaining church in Boston where the lantern signals were hung"]
      }
    ]
  },
  {
    id: "us-michigan",
    name: "Michigan",
    stateCode: "MI",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Great Lakes Shorelines, Mackinac Island & Sleeping Bear Dunes",
    description: "Bordered by four Great Lakes, featuring car-free Victorian Mackinac Island, towering sand dunes over Lake Michigan, and the Upper Peninsula's waterfalls.",
    lat: 44.314844,
    lng: -85.602364,
    elevation: "240m",
    bestSeason: "May - October",
    currency: "USD ($)",
    weather: "20°C / Fresh Great Lakes breeze",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-mi-grand-hotel",
        name: "Grand Hotel Mackinac Island",
        type: "Iconic 1887 Victorian Resort",
        rating: 4.94,
        reviews: 2100,
        pricePerNight: 680,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Mackinac Island, MI",
        tags: ["World's Longest Front Porch", "Horse-Drawn Carriages", "Car-Free Island"],
        amenities: ["Five-Course Dinner Included", "Esther Williams Swimming Pool", "Jewel Golf Course"],
        description: "Boasting the world's longest porch (660 feet) with views over the Straits of Mackinac."
      }
    ],
    activities: [
      {
        id: "act-mi-sleeping-bear",
        title: "Sleeping Bear Dunes Climb & Lake Michigan Kayak Safari",
        category: "Nature & Lake Exploration",
        duration: "4 Hours",
        rating: 4.96,
        reviews: 1980,
        price: 95,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 02:00 PM",
        tags: ["450-ft Sand Dunes", "Turquoise Waters", "Empire Bluff"],
        highlights: ["Climb 450-foot towering sand dunes plunging into the turquoise waters of Lake Michigan", "Kayak alongside scenic bluffs and secluded freshwater beaches"]
      }
    ]
  },
  {
    id: "us-minnesota",
    name: "Minnesota",
    stateCode: "MN",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Land of 10,000 Lakes, Boundary Waters & North Shore Bluffs",
    description: "Pristine freshwater wilderness at the Boundary Waters Canoe Area, dramatic Lake Superior bluffs, and vibrant Minneapolis-Saint Paul arts.",
    lat: 46.729553,
    lng: -94.685900,
    elevation: "350m",
    bestSeason: "May - Sept (Canoeing & Lakes), Dec - March (Winter Sports)",
    currency: "USD ($)",
    weather: "21°C / Crisp northern air",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-mn-four-seasons",
        name: "Four Seasons Hotel Minneapolis & Lutsen North Shore Lodge",
        type: "5-Star Urban & Lakeside Resort",
        rating: 4.95,
        reviews: 1100,
        pricePerNight: 520,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Minneapolis / Lake Superior, MN",
        tags: ["Riva Terrace", "Nordic Spa Rituals", "Mara by Gavin Kaysen"],
        amenities: ["Rooftop Thermal Pool", "Nordic Saunas", "Lake Superior Overlooks"],
        description: "Blends contemporary Nordic luxury with access to Minnesota's legendary lake country."
      }
    ],
    activities: [
      {
        id: "act-mn-boundary-waters",
        title: "Boundary Waters Canoe & Wilderness Floatplane Safari",
        category: "Wilderness Expedition",
        duration: "5 Hours",
        rating: 4.98,
        reviews: 1450,
        price: 190,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80",
        timeSlot: "08:30 AM - 01:30 PM",
        tags: ["Glacial Lakes", "Moose & Loons", "Pristine Silence"],
        highlights: ["Paddle silent interconnected glacial lakes through a million acres of protected wilderness", "Spot wild moose, river otters, and listen to the haunting calls of common loons"]
      }
    ]
  },
  {
    id: "us-mississippi",
    name: "Mississippi",
    stateCode: "MS",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Birthplace of the Blues, Delta Heritage & Natchez Mansions",
    description: "The cultural soul of American music along the Mississippi Blues Trail, historic riverboat mansions in Natchez, and Gulf Coast seafood.",
    lat: 32.354668,
    lng: -89.398528,
    elevation: "90m",
    bestSeason: "March - May, Oct - Nov",
    currency: "USD ($)",
    weather: "24°C / Delta warmth",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-ms-monmouth-inn",
        name: "Monmouth Historic Inn & Alluvian Hotel",
        type: "Antebellum Estate & Delta Spa Hotel",
        rating: 4.91,
        reviews: 780,
        pricePerNight: 320,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "Natchez / Greenwood, MS",
        tags: ["National Historic Landmark", "26-Acre Gardens", "Viking Cooking School"],
        amenities: ["Restaurant 1818", "Southern Hospitality Concierge", "Delta Blues Spa"],
        description: "A 1818 National Historic Landmark offering antique furnishings and manicured gardens."
      }
    ],
    activities: [
      {
        id: "act-ms-blues-trail",
        title: "Mississippi Delta Blues Trail & B.B. King Museum Pilgrimage",
        category: "Music & Culture",
        duration: "4.5 Hours",
        rating: 4.96,
        reviews: 1250,
        price: 85,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:30 AM - 03:00 PM",
        tags: ["Robert Johnson Crossroads", "Juke Joints", "B.B. King"],
        highlights: ["Visit the mythical Crossroads at Clarksdale where Robert Johnson made blues history", "Explore B.B. King's restored cotton gin and state-of-the-art museum"]
      }
    ]
  },
  {
    id: "us-missouri",
    name: "Missouri",
    stateCode: "MO",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "St. Louis Gateway Arch, Ozarks Lakes & Kansas City BBQ",
    description: "The historic Gateway to the West marked by the 630-foot stainless steel Gateway Arch, Lake of the Ozarks boating, and legendary Kansas City barbecue.",
    lat: 37.964253,
    lng: -91.831833,
    elevation: "250m",
    bestSeason: "April - June, Sept - Oct",
    currency: "USD ($)",
    weather: "22°C / Heartland breeze",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-mo-four-seasons",
        name: "Four Seasons Hotel St. Louis & Big Cedar Lodge",
        type: "5-Star Riverfront & Wilderness Resort",
        rating: 4.95,
        reviews: 1650,
        pricePerNight: 480,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "St. Louis / Ridgedale, MO",
        tags: ["Gateway Arch Views", "Ciel Rooftop", "Table Rock Lake Resort"],
        amenities: ["Resort Pool Overlooking the Arch", "Top of the Rock Golf", "Cedar Creek Spa"],
        description: "Combines panoramic views of the Gateway Arch with Ozarks wilderness retreats."
      }
    ],
    activities: [
      {
        id: "act-mo-gateway-arch",
        title: "Gateway Arch Tram to the Top & Mississippi Riverboat",
        category: "Landmarks & History",
        duration: "3 Hours",
        rating: 4.94,
        reviews: 2900,
        price: 55,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 01:00 PM",
        tags: ["630-ft Arch Summit", "Mississippi River", "Westward Expansion"],
        highlights: ["Ride the futuristic capsule tram 630 feet up to the apex observation deck", "Scenic cruise on an authentic paddlewheel riverboat down the Mississippi River"]
      }
    ]
  },
  {
    id: "us-montana",
    name: "Montana",
    stateCode: "MT",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Big Sky Country: Glacier National Park & Yellowstone",
    description: "Endless azure skies spanning Glacier National Park's Going-to-the-Sun Road, Yellowstone's northern range, and world-class luxury ranches.",
    lat: 46.879682,
    lng: -110.362566,
    elevation: "1,400m",
    bestSeason: "June - Sept (Glacier Hiking), Dec - April (Big Sky Skiing)",
    currency: "USD ($)",
    weather: "20°C / Pure mountain air",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-mt-triple-creek",
        name: "Triple Creek Ranch & The Resort at Paws Up",
        type: "Ultra-Luxury Relais & Châteaux Mountain Ranch",
        rating: 4.99,
        reviews: 1420,
        pricePerNight: 1850,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        address: "Bitterroot Valley / Greenough, MT",
        tags: ["Private Log Cabins", "Orvis-Endorsed Fly Fishing", "Horseback Trail Rides"],
        amenities: ["All-Inclusive Gourmet Dining", "Private Hot Tubs", "Helicopter Glacier Tours"],
        description: "Consistently ranked among the top luxury resorts in North America, set in the Bitterroot Mountains."
      }
    ],
    activities: [
      {
        id: "act-mt-glacier-going-to-sun",
        title: "Glacier National Park Going-to-the-Sun Road Vintage Red Bus Tour",
        category: "Alpine & National Parks",
        duration: "6 Hours",
        rating: 4.99,
        reviews: 3800,
        price: 165,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80",
        timeSlot: "08:30 AM - 02:30 PM",
        tags: ["Logan Pass", "Continental Divide", "Glacial Peaks"],
        highlights: ["Ride in a 1930s roll-top canvas Red Bus along engineering marvel cliffside roads", "Cross Logan Pass at 6,646 feet with mountain goats and wildflower meadows"]
      }
    ]
  },
  {
    id: "us-nebraska",
    name: "Nebraska",
    stateCode: "NE",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Sandhills Dunes, Chimney Rock & Sandhill Crane Migration",
    description: "The vast grasslands of the Nebraska Sandhills, the pioneer landmark of Chimney Rock, and the annual migration of 500,000 Sandhill Cranes along the Platte River.",
    lat: 41.492537,
    lng: -99.901813,
    elevation: "800m",
    bestSeason: "March - April (Crane Migration), May - October",
    currency: "USD ($)",
    weather: "22°C / Prairie breeze",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-ne-magnolia",
        name: "The Magnolia Hotel Omaha & Sandhills Golf Lodge",
        type: "Historic Florentine Palazzo Hotel",
        rating: 4.88,
        reviews: 790,
        pricePerNight: 260,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Omaha, NE",
        tags: ["Old Market District", "Bespoke Courtyard", "Omaha Steaks Dining"],
        amenities: ["Complimentary Craft Beer Reception", "Fitness Center", "Historic Courtyard"],
        description: "Built in 1923 modeled after the Bargello palace in Florence, located in downtown Omaha."
      }
    ],
    activities: [
      {
        id: "act-ne-crane-migration",
        title: "Platte River Sandhill Crane Migration VIP Blind Watch",
        category: "Birding & Wildlife",
        duration: "3.5 Hours",
        rating: 4.97,
        reviews: 1100,
        price: 90,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
        timeSlot: "05:30 AM - 09:00 AM",
        tags: ["500,000 Cranes", "Sunrise River Roast", "Audubon Center"],
        highlights: ["Witness hundreds of thousands of Sandhill Cranes take flight simultaneously at dawn", "Private heated riverfront blind access at the Rowe Sanctuary"]
      }
    ]
  },
  {
    id: "us-nevada",
    name: "Nevada",
    stateCode: "NV",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Las Vegas Strip, Lake Tahoe Sapphire Waters & Red Rock Canyon",
    description: "World-famous entertainment and Michelin-starred dining on the Las Vegas Strip, contrasting with the crystalline alpine waters of Lake Tahoe and Valley of Fire.",
    lat: 38.802610,
    lng: -116.419389,
    elevation: "1,500m",
    bestSeason: "Year-Round (Oct - May for Vegas & Deserts, Summer/Winter for Tahoe)",
    currency: "USD ($)",
    weather: "25°C / Warm dry desert",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-nv-wynn",
        name: "Wynn & Encore Las Vegas",
        type: "5-Star Luxury Resort & Casino",
        rating: 4.96,
        reviews: 4800,
        pricePerNight: 480,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "3131 S Las Vegas Blvd, Las Vegas, NV",
        tags: ["Forbes 5-Star Tower Suites", "Lake of Dreams", "Michelin Dining"],
        amenities: ["Private Tower Suites Pool", "18-Hole Championship Golf", "The Spa at Wynn"],
        description: "The gold standard of Las Vegas luxury, featuring fine art gardens, designer boutiques, and celebrated dining."
      }
    ],
    activities: [
      {
        id: "act-nv-vegas-strip-heli",
        title: "Las Vegas Strip Nighttime Neon Helicopter Flight",
        category: "Scenic Aerial & Nightlife",
        duration: "2 Hours",
        rating: 4.98,
        reviews: 4200,
        price: 135,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
        timeSlot: "08:30 PM - 10:30 PM",
        tags: ["Bellagio Fountains", "High Roller", "Neon Skyline"],
        highlights: ["Fly directly over the glowing megaresorts, Bellagio fountains, and the 1,149-foot Stratosphere tower", "Champagne toast before boarding your state-of-the-art ECO-Star helicopter"]
      }
    ]
  },
  {
    id: "us-new-hampshire",
    name: "New Hampshire",
    stateCode: "NH",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "White Mountains, Mount Washington & Autumn Foliage",
    description: "Rugged alpine beauty across the Presidential Range, historic cog railways climbing Mount Washington, and Lake Winnipesaukee retreats.",
    lat: 43.193852,
    lng: -71.572395,
    elevation: "300m",
    bestSeason: "Sept - Oct (Peak Foliage), June - Aug",
    currency: "USD ($)",
    weather: "19°C / Alpine forest breeze",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-nh-omni-mount-washington",
        name: "Omni Mount Washington Resort",
        type: "Grand 1902 Historic Mountain Resort",
        rating: 4.94,
        reviews: 1850,
        pricePerNight: 590,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        address: "Bretton Woods, NH",
        tags: ["Mount Washington Views", "Site of 1944 Bretton Woods Conference", "Canopy Zipline"],
        amenities: ["Alpine Ski Slopes", "Full Spa & Thermal Pools", "Historic Main Dining Room"],
        description: "A National Historic Landmark situated at the foot of Mount Washington with red tile roofs and white facade."
      }
    ],
    activities: [
      {
        id: "act-nh-mount-washington-cog",
        title: "Mount Washington Cog Railway Steam Engine Summit Ascent",
        category: "Heritage Mountain Railway",
        duration: "3.5 Hours",
        rating: 4.97,
        reviews: 2400,
        price: 95,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 01:30 PM",
        tags: ["World's First Mountain Cog", "6,288-ft Summit", "Jacob's Ladder"],
        highlights: ["Ride the historic 1869 cog railway scaling a 37% grade up Jacob's Ladder", "Reach the highest peak in the Northeast with views spanning five states and Canada"]
      }
    ]
  },
  {
    id: "us-new-jersey",
    name: "New Jersey",
    stateCode: "NJ",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Jersey Shore Boardwalks, Cape May Victorian Houses & Princeton",
    description: "Historic Victorian bed & breakfasts in Cape May, iconic Jersey Shore beaches, the lush pine barrens, and prestigious Princeton University.",
    lat: 40.058324,
    lng: -74.405661,
    elevation: "70m",
    bestSeason: "May - October",
    currency: "USD ($)",
    weather: "22°C / Jersey Shore breeze",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-nj-congress-hall",
        name: "Congress Hall & Asbury Ocean Club",
        type: "Historic 1816 Oceanfront Resort",
        rating: 4.91,
        reviews: 1420,
        pricePerNight: 460,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Cape May / Asbury Park, NJ",
        tags: ["America's First Seaside Resort", "Grand Lawn", "Sea Spa"],
        amenities: ["Oceanfront Pool", "Blue Pig Tavern", "Private Beach Tents"],
        description: "America's oldest seaside resort, welcoming presidents and travelers in Cape May since 1816."
      }
    ],
    activities: [
      {
        id: "act-nj-cape-may-trolley",
        title: "Cape May Victorian Mansions & Lighthouse Sailing Cruise",
        category: "Architecture & Maritime",
        duration: "3.5 Hours",
        rating: 4.92,
        reviews: 1650,
        price: 60,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
        timeSlot: "01:30 PM - 05:00 PM",
        tags: ["Gingerbread Architecture", "Cape May Lighthouse", "Dolphin Watch"],
        highlights: ["Narrated open-air trolley tour through the country's largest collection of Victorian homes", "Climb the 199 steps of the 1859 Cape May Lighthouse for views of the Atlantic"]
      }
    ]
  },
  {
    id: "us-new-mexico",
    name: "New Mexico",
    stateCode: "NM",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Land of Enchantment: Santa Fe Adobe, Taos Pueblo & White Sands",
    description: "Adobe architecture, Santa Fe art markets, ancient multi-story Taos Pueblo, and the glistening gypsum dunes of White Sands National Park.",
    lat: 34.519940,
    lng: -105.870090,
    elevation: "1,700m",
    bestSeason: "September - November, March - May",
    currency: "USD ($)",
    weather: "23°C / High desert sunshine",
    image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-nm-five-graces",
        name: "The Inn of The Five Graces",
        type: "Relais & Châteaux Adobe Masterpiece",
        rating: 4.98,
        reviews: 980,
        pricePerNight: 950,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "150 E De Vargas St, Santa Fe, NM",
        tags: ["Historic Barrio de Analco", "Silk Road Antiques", "Tibetan Spa"],
        amenities: ["Custom Mosaic Tile Bathrooms", "Wood-Burning Kiva Fireplaces", "Lapis Room Spa"],
        description: "Located in the historic heart of Santa Fe, adorned with handcrafted mosaics and antique textiles."
      }
    ],
    activities: [
      {
        id: "act-nm-white-sands-taos",
        title: "White Sands National Park Sunset & Taos Pueblo Tour",
        category: "Ancient Culture & Wonders",
        duration: "5 Hours",
        rating: 4.99,
        reviews: 2100,
        price: 130,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
        timeSlot: "02:00 PM - 07:00 PM",
        tags: ["Gypsum Sand Dunes", "1,000-Year-Old Pueblo", "Sunset Glow"],
        highlights: ["Walk across the world's largest gypsum dune field glowing white beneath twilight skies", "Visit 1,000-year-old Taos Pueblo, a UNESCO World Heritage Native American community"]
      }
    ]
  },
  {
    id: "us-new-york",
    name: "New York",
    stateCode: "NY",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Empire State: Manhattan Skylines, Niagara Falls & Adirondacks",
    description: "From Broadway theaters and Central Park in NYC to the thundering cascades of Niagara Falls and the tranquil mountain lakes of the Adirondacks.",
    lat: 43.299428,
    lng: -74.217933,
    elevation: "300m",
    bestSeason: "Year-Round",
    currency: "USD ($)",
    weather: "22°C / Pleasant autumn",
    image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-ny-plaza",
        name: "The Plaza Hotel & The Point Adirondacks",
        type: "5-Star Historic Icon & Great Camp",
        rating: 4.97,
        reviews: 3200,
        pricePerNight: 1100,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Fifth Avenue NYC / Saranac Lake, NY",
        tags: ["Central Park South", "Rockefeller Great Camp", "Guerlain Spa"],
        amenities: ["White-Glove Butler Service", "The Palm Court Afternoon Tea", "Private Lake Charters"],
        description: "Quintessential New York opulence overlooking Central Park alongside historic Adirondack Great Camps."
      }
    ],
    activities: [
      {
        id: "act-ny-broadway-niagara",
        title: "Broadway VIP Backstage & Niagara Falls Maid of the Mist",
        category: "Theater & Natural Wonder",
        duration: "4.5 Hours",
        rating: 4.98,
        reviews: 4500,
        price: 195,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=800&q=80",
        timeSlot: "05:00 PM - 09:30 PM",
        tags: ["Broadway Orchestra", "Maid of the Mist", "Times Square"],
        highlights: ["Front orchestra seats to an award-winning musical with backstage cast toast", "Sail right to the base of the thundering Horseshoe Falls on Maid of the Mist"]
      }
    ]
  },
  {
    id: "us-north-carolina",
    name: "North Carolina",
    stateCode: "NC",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Blue Ridge Parkway, Biltmore Estate & Outer Banks Lighthouses",
    description: "America's largest private home at the Biltmore Estate in Asheville, misty Blue Ridge Parkway vistas, and wild horses on the Outer Banks barrier islands.",
    lat: 35.759573,
    lng: -79.019300,
    elevation: "210m",
    bestSeason: "April - June, Sept - Nov",
    currency: "USD ($)",
    weather: "22°C / Mountain sunshine",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-nc-biltmore-inn",
        name: "The Inn on Biltmore Estate & Omni Grove Park",
        type: "Gilded Age Luxury Mountain Estate",
        rating: 4.96,
        reviews: 2450,
        pricePerNight: 750,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Asheville, NC",
        tags: ["Biltmore 8,000-Acre Estate", "Subterranean Spa Cavern", "Blue Ridge Mountains"],
        amenities: ["Private Winery Tours", "Subterranean Mineral Pools", "Equestrian Center"],
        description: "Luxury accommodations set within George Vanderbilt's historic 8,000-acre estate in Asheville."
      }
    ],
    activities: [
      {
        id: "act-nc-biltmore-chateau",
        title: "Biltmore Chateau Private Rooftop & Blue Ridge Parkway Drive",
        category: "Estate Architecture & Scenery",
        duration: "4.5 Hours",
        rating: 4.99,
        reviews: 3600,
        price: 120,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 02:30 PM",
        tags: ["250-Room Mansion", "Vanderbilt Antiques", "French Renaissance"],
        highlights: ["Exclusive rooftop and private quarters tour of the 250-room French Renaissance chateau", "Drive along the Blue Ridge Parkway overlooking layered blue mountain ridges"]
      }
    ]
  },
  {
    id: "us-north-dakota",
    name: "North Dakota",
    stateCode: "ND",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Theodore Roosevelt National Park & Painted Badlands",
    description: "Rugged painted badlands where Theodore Roosevelt ranched, roaming bison herds, and dark night skies under the Aurora Borealis.",
    lat: 47.551493,
    lng: -101.002012,
    elevation: "600m",
    bestSeason: "May - September",
    currency: "USD ($)",
    weather: "20°C / Northern prairie air",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-nd-rough-riders",
        name: "Rough Riders Hotel",
        type: "Historic Western Luxury Hotel",
        rating: 4.88,
        reviews: 620,
        pricePerNight: 260,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "Medora, ND",
        tags: ["Medora Badlands", "Roosevelt Library", "Theodore's Dining Room"],
        amenities: ["Historic Fireplace Suites", "Private Wine Cellar", "Western Hospitality"],
        description: "Where Theodore Roosevelt once delivered a speech from the balcony, located in the badlands town of Medora."
      }
    ],
    activities: [
      {
        id: "act-nd-roosevelt-badlands",
        title: "Theodore Roosevelt National Park Badlands & Wild Bison Safari",
        category: "Wildlife & Badlands",
        duration: "4 Hours",
        rating: 4.96,
        reviews: 980,
        price: 85,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:00 AM - 01:00 PM",
        tags: ["Wild Bison", "Wind Canyon", "Painted Badlands"],
        highlights: ["Hike the Wind Canyon rim overlooking the meandering Little Missouri River", "Encounter wild bison herds, prairie dogs, and feral horses in the South Unit"]
      }
    ]
  },
  {
    id: "us-ohio",
    name: "Ohio",
    stateCode: "OH",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Rock & Roll Hall of Fame, Hocking Hills Caves & Cedar Point",
    description: "Rock & Roll Hall of Fame in Cleveland, the sunken gorges and waterfalls of Hocking Hills, and world-record roller coasters at Cedar Point.",
    lat: 40.417287,
    lng: -82.907123,
    elevation: "260m",
    bestSeason: "May - October",
    currency: "USD ($)",
    weather: "21°C / Lake Erie breeze",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-oh-ritz-cleveland",
        name: "The Ritz-Carlton Cleveland & Inn at Cedar Falls",
        type: "5-Star Downtown & Hocking Hills Luxury",
        rating: 4.93,
        reviews: 1450,
        pricePerNight: 460,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Cleveland / Logan, OH",
        tags: ["Lake Erie Views", "Hocking Hills Yurts", "TURN Bar & Kitchen"],
        amenities: ["Club Level Concierge", "Forest Geodesic Domes", "Spa Services"],
        description: "Contemporary luxury in downtown Cleveland with rustic yurts and cottages in Hocking Hills."
      }
    ],
    activities: [
      {
        id: "act-oh-rock-hall",
        title: "Rock & Roll Hall of Fame VIP Vault & Hocking Hills Caves",
        category: "Music & Nature",
        duration: "4 Hours",
        rating: 4.97,
        reviews: 2800,
        price: 75,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 02:00 PM",
        tags: ["I.M. Pei Pyramid", "Jimi Hendrix & Beatles", "Old Man's Cave"],
        highlights: ["Explore I.M. Pei's geometric pyramid on Lake Erie housing the treasures of rock legends", "Hike through the sandstone gorge and cascading waterfalls of Old Man's Cave"]
      }
    ]
  },
  {
    id: "us-oklahoma",
    name: "Oklahoma",
    stateCode: "OK",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "First Americans Museum, Route 66 Neon & Western Heritage",
    description: "Rich Native American heritage celebrating 39 tribal nations, iconic Route 66 roadside diners and neon signs, and the National Cowboy Museum.",
    lat: 35.007752,
    lng: -97.092877,
    elevation: "360m",
    bestSeason: "April - June, Sept - Nov",
    currency: "USD ($)",
    weather: "23°C / Southern plains sun",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-ok-skirvin",
        name: "The Skirvin Hilton Oklahoma City & 21c Tulsa",
        type: "1911 Historic Luxury Grand Hotel",
        rating: 4.92,
        reviews: 1350,
        pricePerNight: 310,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "1 Park Ave, Oklahoma City, OK",
        tags: ["Historic 1911 Landmark", "Park Avenue Grill", "Red Piano Lounge"],
        amenities: ["Live Jazz Performances", "Indoor Heated Pool", "Luxury Suites"],
        description: "The city's oldest and most storied hotel, known for its grand ballroom and jazz heritage."
      }
    ],
    activities: [
      {
        id: "act-ok-first-americans",
        title: "First Americans Museum & National Cowboy Heritage Tour",
        category: "Indigenous Culture & West",
        duration: "4 Hours",
        rating: 4.97,
        reviews: 1400,
        price: 65,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:30 AM - 02:30 PM",
        tags: ["39 Tribal Nations", "Native Artwork", "Western Gallery"],
        highlights: ["Explore the state-of-the-art museum sharing the history and arts of Oklahoma's 39 tribal nations", "View masterworks of Frederic Remington and Charles M. Russell"]
      }
    ]
  },
  {
    id: "us-oregon",
    name: "Oregon",
    stateCode: "OR",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Crater Lake Sapphire Depths, Columbia River Gorge & Pinot Noir",
    description: "Deepest lake in America at Crater Lake, thundering Multnomah Falls in the Columbia Gorge, Cannon Beach Haystack Rock, and Willamette Valley Pinot Noir.",
    lat: 43.804133,
    lng: -120.554201,
    elevation: "1,000m",
    bestSeason: "June - October",
    currency: "USD ($)",
    weather: "21°C / Fresh Pacific Northwest air",
    image: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-or-allison-inn",
        name: "The Allison Inn & Spa & Stephanie Inn Cannon Beach",
        type: "5-Star Willamette Wine Estate & Oceanfront Inn",
        rating: 4.97,
        reviews: 1650,
        pricePerNight: 790,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "Newberg (Willamette) / Cannon Beach, OR",
        tags: ["Willamette Valley Vineyards", "JORY Restaurant", "Haystack Rock Views"],
        amenities: ["Spa with Pinot Wine Therapy", "Indoor Pool & Sun Terrace", "Private Wine Cellar"],
        description: "Set in Oregon's renowned wine country, featuring sustainable luxury and farm-to-table cuisine."
      }
    ],
    activities: [
      {
        id: "act-or-columbia-gorge-waterfalls",
        title: "Columbia River Gorge Multnomah Falls & Willamette Wine Tasting",
        category: "Waterfalls & Wine",
        duration: "5.5 Hours",
        rating: 4.99,
        reviews: 3400,
        price: 155,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:30 AM - 03:00 PM",
        tags: ["Multnomah Falls (620 ft)", "Pinot Noir Tasting", "Crown Point"],
        highlights: ["Stand on the bridge over the double-tiered 620-foot Multnomah Falls", "Private vineyard tasting of world-class Pinot Noir and Chardonnay in the Willamette Valley"]
      }
    ]
  },
  {
    id: "us-pennsylvania",
    name: "Pennsylvania",
    stateCode: "PA",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Liberty Bell, Independence Hall, Gettysburg & Fallingwater",
    description: "Where America was born in Philadelphia, historic Gettysburg battlefields, Frank Lloyd Wright's architectural masterpiece Fallingwater, and scenic Pocono Mountains.",
    lat: 41.203322,
    lng: -77.194525,
    elevation: "330m",
    bestSeason: "May - October",
    currency: "USD ($)",
    weather: "22°C / Mid-Atlantic sunshine",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-pa-four-seasons-philly",
        name: "Four Seasons Hotel Philadelphia at Comcast Center & Nemacolin",
        type: "5-Star Sky Sanctuary & Mountain Estate",
        rating: 4.98,
        reviews: 2300,
        pricePerNight: 850,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "1 N 19th St, Philadelphia / Farmington, PA",
        tags: ["Norman Foster Tower", "Jean-Georges Sky Restaurant", "Nemacolin Chateau"],
        amenities: ["Infinity Pool on 57th Floor", "Crystal Spa", "Holistic Wellness Center"],
        description: "Occupying the top 12 floors of Philadelphia's tallest tower, designed by Lord Norman Foster."
      }
    ],
    activities: [
      {
        id: "act-pa-independence-hall",
        title: "Independence Hall, Liberty Bell & Fallingwater Private Tour",
        category: "Founding History & Architecture",
        duration: "4.5 Hours",
        rating: 4.98,
        reviews: 4100,
        price: 95,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:30 AM - 02:00 PM",
        tags: ["Declaration of Independence", "Liberty Bell", "Frank Lloyd Wright"],
        highlights: ["Stand in the Assembly Room where both the Declaration of Independence and US Constitution were signed", "Marvel at the original Liberty Bell and its historic crack"]
      }
    ]
  },
  {
    id: "us-rhode-island",
    name: "Rhode Island",
    stateCode: "RI",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Ocean State: Newport Gilded Age Mansions & Cliff Walk",
    description: "The Gilded Age summer palaces of the Vanderbilt and Astor families in Newport, sailing regattas in Narragansett Bay, and the ocean bluffs of Block Island.",
    lat: 41.580095,
    lng: -71.477429,
    elevation: "60m",
    bestSeason: "May - October",
    currency: "USD ($)",
    weather: "22°C / Atlantic sea breeze",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-ri-ocean-house",
        name: "Ocean House & Castle Hill Inn Newport",
        type: "Forbes Triple 5-Star Oceanfront Grand Hotel",
        rating: 4.99,
        reviews: 1750,
        pricePerNight: 1250,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Watch Hill / Newport, RI",
        tags: ["Private White Sand Beach", "COAST 5-Star Restaurant", "Oceanfront Veranda"],
        amenities: ["OH! Spa", "Yacht Cruises", "Croquet Lawn with Pimm's Cup"],
        description: "One of only a handful of Triple Five-Star hotels in the world, perched over the Atlantic in Watch Hill."
      }
    ],
    activities: [
      {
        id: "act-ri-newport-mansions",
        title: "Newport Gilded Age Mansions (The Breakers & Marble House) & Cliff Walk",
        category: "Gilded Age Heritage",
        duration: "4 Hours",
        rating: 4.98,
        reviews: 3100,
        price: 85,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 02:00 PM",
        tags: ["The Breakers", "Vanderbilt Summer Cottages", "Cliff Walk Ocean Views"],
        highlights: ["Explore Cornelius Vanderbilt II's 70-room Italian Renaissance palace The Breakers", "Walk the 3.5-mile Newport Cliff Walk along crashing ocean waves and gilded mansions"]
      }
    ]
  },
  {
    id: "us-south-carolina",
    name: "South Carolina",
    stateCode: "SC",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Historic Charleston Rainbow Row, Lowcountry & Hilton Head",
    description: "Cobblestone alleys and pastel antebellum mansions in Charleston, Lowcountry oysters and shrimp & grits, and world-class golf on Hilton Head Island.",
    lat: 33.836081,
    lng: -81.163725,
    elevation: "100m",
    bestSeason: "March - May, Sept - Nov",
    currency: "USD ($)",
    weather: "24°C / Coastal Lowcountry warmth",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-sc-the-dewberry",
        name: "The Dewberry Charleston & Montage Palmetto Bluff",
        type: "5-Star Mid-Century Southern Landmark",
        rating: 4.96,
        reviews: 1980,
        pricePerNight: 720,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "334 Meeting St, Charleston, SC",
        tags: ["Mid-Century Luxury", "Citrus Club Rooftop", "The Spa at Dewberry"],
        amenities: ["Rooftop Views of Charleston Harbor", "Handmade Irish Linens", "House Car Chauffeur"],
        description: "Reimagines historic Charleston elegance with custom mid-century furnishings and Southern warmth."
      }
    ],
    activities: [
      {
        id: "act-sc-charleston-historic",
        title: "Charleston Rainbow Row, French Quarter & Fort Sumter Harbor Cruise",
        category: "History & Lowcountry",
        duration: "4 Hours",
        rating: 4.97,
        reviews: 3200,
        price: 90,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:30 AM - 01:30 PM",
        tags: ["Rainbow Row", "Fort Sumter", "The Battery Overlook"],
        highlights: ["Stroll pastel Georgian row houses on Rainbow Row and historic antebellum mansions on The Battery", "Cruise to Fort Sumter where the first shots of the American Civil War were fired in 1861"]
      }
    ]
  },
  {
    id: "us-south-dakota",
    name: "South Dakota",
    stateCode: "SD",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Mount Rushmore, Badlands Gorges & Black Hills Ponderosa Pines",
    description: "The monumental granite sculptures of Mount Rushmore, the jagged lunar canyons of Badlands National Park, and historic Deadwood gold rush lore.",
    lat: 43.969515,
    lng: -99.901813,
    elevation: "700m",
    bestSeason: "May - October",
    currency: "USD ($)",
    weather: "21°C / Clear Black Hills skies",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-sd-kegans-lodge",
        name: "Custer State Park Game Lodge & The Historic Bullock Hotel",
        type: "Historic Presidential Summer White House",
        rating: 4.91,
        reviews: 1100,
        pricePerNight: 350,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "Custer / Deadwood, SD",
        tags: ["Coolidge Summer White House", "1,500 Wild Bison", "Historic Black Hills"],
        amenities: ["Buffalo Safari Jeeps", "Rustic Pine Dining Room", "Deadwood Casino"],
        description: "Served as the Summer White House for President Calvin Coolidge in 1927, set among roaming bison."
      }
    ],
    activities: [
      {
        id: "act-sd-mount-rushmore-badlands",
        title: "Mount Rushmore Monumental Illumination & Badlands Safari",
        category: "Monuments & National Parks",
        duration: "5 Hours",
        rating: 4.98,
        reviews: 2850,
        price: 115,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
        timeSlot: "02:00 PM - 07:00 PM",
        tags: ["Mount Rushmore (60-ft Carvings)", "Crazy Horse", "Badlands Rim"],
        highlights: ["Stand before the 60-foot granite carved faces of Washington, Jefferson, Roosevelt, and Lincoln", "Drive through the dramatic multi-colored sedimentary spires and pinnacles of Badlands National Park"]
      }
    ]
  },
  {
    id: "us-tennessee",
    name: "Tennessee",
    stateCode: "TN",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Music City Nashville, Great Smoky Mountains & Memphis Blues",
    description: "Country music live stages on Nashville's Honky Tonk Highway, the misty ridges of Great Smoky Mountains National Park, and Elvis Presley's Graceland in Memphis.",
    lat: 35.517491,
    lng: -86.580447,
    elevation: "270m",
    bestSeason: "April - June, Sept - Nov",
    currency: "USD ($)",
    weather: "23°C / Pleasant southern breeze",
    image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-tn-blackberry-farm",
        name: "Blackberry Farm & The Hermitage Hotel Nashville",
        type: "World-Renowned Luxury Relais & Châteaux Farm",
        rating: 4.99,
        reviews: 2150,
        pricePerNight: 1650,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Walland (Smoky Mtns) / Nashville, TN",
        tags: ["Foothills Cuisine", "Truffle Dog Hunts", "Grand Dame of Nashville"],
        amenities: ["Barn at Blackberry Farm Dining", "Fly Fishing on Hesse Creek", "Artisan Cheese Making"],
        description: "A celebrated 4,200-acre estate in the Great Smoky Mountains renowned for culinary excellence."
      }
    ],
    activities: [
      {
        id: "act-tn-nashville-music",
        title: "Grand Ole Opry VIP Backstage & Ryman Auditorium Tour",
        category: "Music & Entertainment",
        duration: "3.5 Hours",
        rating: 4.98,
        reviews: 4200,
        price: 110,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=800&q=80",
        timeSlot: "06:00 PM - 09:30 PM",
        tags: ["Grand Ole Opry", "Mother Church of Country", "Artist Dressing Rooms"],
        highlights: ["Walk on the legendary 6-foot oak circle cut from the original Ryman stage", "Explore 18 themed artist dressing rooms and stand on the stage of the world's longest-running radio show"]
      }
    ]
  },
  {
    id: "us-texas",
    name: "Texas",
    stateCode: "TX",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "The Lone Star State: Austin Live Music, San Antonio Alamo & Big Bend",
    description: "The Alamo and River Walk in San Antonio, live music and tech innovation in Austin, Texas barbecue trail, NASA Johnson Space Center, and Big Bend canyons.",
    lat: 31.968599,
    lng: -99.901813,
    elevation: "520m",
    bestSeason: "October - April",
    currency: "USD ($)",
    weather: "26°C / Warm Texas sunshine",
    image: "https://images.unsplash.com/photo-1531218150217-54595bc2b934?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-tx-commodore-perry",
        name: "Commodore Perry Estate, Auberge & The Post Oak Houston",
        type: "5-Star Luxury European Estate & Sky Tower",
        rating: 4.97,
        reviews: 2100,
        pricePerNight: 780,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Austin / Houston, TX",
        tags: ["10-Acre Historic Estate", "Lutie's Garden Restaurant", "Helipad Access"],
        amenities: ["Private Pool Gardens", "Curated Vinyl Libraries", "Forbes 5-Star Spa"],
        description: "A 10-acre Italianate estate blending historic charm with contemporary Austin culture."
      }
    ],
    activities: [
      {
        id: "act-tx-alamo-riverwalk",
        title: "San Antonio Historic Alamo & River Walk VIP Barge Cruise",
        category: "History & Culture",
        duration: "3.5 Hours",
        rating: 4.96,
        reviews: 3800,
        price: 65,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 01:30 PM",
        tags: ["Remember the Alamo", "Cypress River Walk", "Spanish Colonial Missions"],
        highlights: ["Stand in the historic 1718 church of the Alamo where Davy Crockett fought", "Cruise along the cypress-lined San Antonio River Walk beneath stone bridges and cafes"]
      }
    ]
  },
  {
    id: "us-utah",
    name: "Utah",
    stateCode: "UT",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "The Mighty 5: Zion Canyons, Bryce Hoodoos, Arches & Amangiri",
    description: "Home to the world's most dramatic red rock landscapes: Zion National Park's soaring canyon walls, Arches delicate spans, Bryce Canyon hoodoos, and ultra-luxury desert sanctuaries.",
    lat: 39.320980,
    lng: -111.093731,
    elevation: "1,860m",
    bestSeason: "April - June, Sept - Nov (Hiking), Dec - April (Skiing)",
    currency: "USD ($)",
    weather: "22°C / High desert sunshine",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-ut-amangiri",
        name: "Amangiri Canyon Point",
        type: "World-Renowned 5-Star Desert Sanctuary",
        rating: 4.99,
        reviews: 1450,
        pricePerNight: 2850,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
        address: "1 Kayenta Rd, Canyon Point, UT",
        tags: ["600-Acre Red Rock Valley", "Swimming Pool Around 80-ft Rock", "Aman Spa"],
        amenities: ["Private Plunge Pools", "Helicopter Landings", "Navajo Healing Rituals"],
        description: "A world-famous architectural wonder blending seamlessly into 600 acres of Utah's dramatic desert canyons."
      }
    ],
    activities: [
      {
        id: "act-ut-zion-angels-landing",
        title: "Zion National Park Angels Landing & The Narrows Expedition",
        category: "Extreme Hiking & Canyons",
        duration: "6.5 Hours",
        rating: 4.99,
        reviews: 4900,
        price: 195,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80",
        timeSlot: "07:00 AM - 01:30 PM",
        tags: ["1,500-ft Sheer Drop", "Virgin River Narrows", "Chained Ridge"],
        highlights: ["Ascend the thrilling spine of Angels Landing for 360-degree vistas of Zion Canyon", "Wade through the Virgin River between thousand-foot vertical sandstone walls in The Narrows"]
      }
    ]
  },
  {
    id: "us-vermont",
    name: "Vermont",
    stateCode: "VT",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Green Mountains, Maple Syrup, Covered Bridges & Stowe Skiing",
    description: "Picture-perfect New England covered bridges, vibrant scarlet and gold fall foliage in the Green Mountains, craft artisanal cheeses and pure maple syrup.",
    lat: 44.558803,
    lng: -72.577841,
    elevation: "300m",
    bestSeason: "Sept - Oct (Fall Foliage), Dec - March (Skiing), Summer",
    currency: "USD ($)",
    weather: "18°C / Crisp alpine air",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-vt-twin-farms",
        name: "Twin Farms & The Lodge at Spruce Peak",
        type: "5-Star All-Inclusive Relais & Châteaux Estate",
        rating: 4.99,
        reviews: 1200,
        pricePerNight: 2450,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        address: "Barnard / Stowe, VT",
        tags: ["300 Acres of Wildflower Meadows", "Museum-Quality Art", "Private Ski Slopes"],
        amenities: ["All-Inclusive Farm-to-Table Gastronomy", "Private Japanese Furo Tubs", "Private Ski Mountain"],
        description: "Vermont's only luxury all-inclusive Relais & Châteaux, once the retreat of Nobel laureate Sinclair Lewis."
      }
    ],
    activities: [
      {
        id: "act-vt-stowe-maple",
        title: "Stowe Mountain Smugglers' Notch & Artisan Maple Tasting",
        category: "Foliage & Gastronomy",
        duration: "4 Hours",
        rating: 4.96,
        reviews: 1850,
        price: 85,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 02:00 PM",
        tags: ["Mount Mansfield", "Sugarhouse Tour", "Covered Bridges"],
        highlights: ["Ride the Mount Mansfield Gondola SkyRide to the highest peak in Vermont", "Taste pure Grade A amber and dark maple syrups fresh from wood-fired sugarhouses"]
      }
    ]
  },
  {
    id: "us-virginia",
    name: "Virginia",
    stateCode: "VA",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Shenandoah Skyline Drive, Colonial Williamsburg & Monticello",
    description: "The birthplace of presidents featuring Shenandoah National Park's Skyline Drive, Thomas Jefferson's Monticello, Colonial Williamsburg, and Virginia Beach.",
    lat: 37.431573,
    lng: -78.656894,
    elevation: "290m",
    bestSeason: "April - June, Sept - Nov",
    currency: "USD ($)",
    weather: "22°C / Blue Ridge air",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-va-inn-little-washington",
        name: "The Inn at Little Washington & The Omni Homestead",
        type: "3-Star Michelin Country Inn & Historic Springs",
        rating: 4.99,
        reviews: 2100,
        pricePerNight: 1350,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Washington / Hot Springs, VA",
        tags: ["3 Michelin Stars", "Jefferson Mineral Baths", "Blue Ridge Foothills"],
        amenities: ["Patrick O'Connell Culinary Artistry", "Historic Warm Springs Pools", "Falconry"],
        description: "The only 3-Star Michelin restaurant and inn in the DC/Virginia region, celebrated globally."
      }
    ],
    activities: [
      {
        id: "act-va-colonial-williamsburg",
        title: "Colonial Williamsburg Living History & Monticello Estate",
        category: "Living History & Architecture",
        duration: "4.5 Hours",
        rating: 4.97,
        reviews: 2900,
        price: 95,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:30 AM - 02:00 PM",
        tags: ["301-Acre Historic City", "Governor's Palace", "Thomas Jefferson"],
        highlights: ["Step back into the 18th century in the world's largest living history museum with costumed artisans", "Tour Thomas Jefferson's mountaintop neoclassical home and gardens at Monticello"]
      }
    ]
  },
  {
    id: "us-washington",
    name: "Washington",
    stateCode: "WA",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Mount Rainier, Seattle Space Needle & Olympic Rainforest",
    description: "The emerald Pacific Northwest boasting the 14,411-foot volcanic peak of Mount Rainier, the temperate rainforests of Olympic National Park, and Seattle's Space Needle.",
    lat: 47.751074,
    lng: -120.740135,
    elevation: "520m",
    bestSeason: "June - October",
    currency: "USD ($)",
    weather: "20°C / Fresh evergreen air",
    image: "https://images.unsplash.com/photo-1502175353174-a7a70e73b362?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-wa-four-seasons-seattle",
        name: "Four Seasons Hotel Seattle & Salish Lodge & Spa",
        type: "5-Star Puget Sound & Snoqualmie Falls Resort",
        rating: 4.97,
        reviews: 2600,
        pricePerNight: 690,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "99 Union St, Seattle / Snoqualmie, WA",
        tags: ["Elliott Bay Views", "Snoqualmie Falls (268 ft)", "Infinity Pool Over Puget Sound"],
        amenities: ["Goldfinch Tavern Dining", "Heated Rooftop Pool", "The Spa at Salish Lodge"],
        description: "Perched along Elliott Bay steps from Pike Place Market, with lodge retreats atop thundering Snoqualmie Falls."
      }
    ],
    activities: [
      {
        id: "act-wa-mount-rainier-heli",
        title: "Mount Rainier Glaciers VIP Helicopter & Olympic National Park",
        category: "Alpine & Volcanoes",
        duration: "5 Hours",
        rating: 4.99,
        reviews: 3500,
        price: 265,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:00 AM - 02:00 PM",
        tags: ["14,411-ft Summit", "Paradise Meadows", "Active Volcano"],
        highlights: ["Fly past 25 major glaciers cascading down the 14,411-foot volcanic peak of Mount Rainier", "Hike through the subalpine wildflower meadows of Paradise Valley"]
      }
    ]
  },
  {
    id: "us-west-virginia",
    name: "West Virginia",
    stateCode: "WV",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "New River Gorge National Park & The Historic Greenbrier",
    description: "America's newest national park at New River Gorge, the luxury bunker history of The Greenbrier, and rugged Appalachian mountain whitewater.",
    lat: 38.597626,
    lng: -80.454903,
    elevation: "460m",
    bestSeason: "May - October",
    currency: "USD ($)",
    weather: "21°C / Mountain valley breeze",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-wv-greenbrier",
        name: "The Greenbrier",
        type: "National Historic Landmark Resort & Secret Bunker",
        rating: 4.95,
        reviews: 2800,
        pricePerNight: 650,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "101 Main St W, White Sulphur Springs, WV",
        tags: ["Dorothy Draper Decor", "Secret Cold War Bunker", "11,000-Acre Estate"],
        amenities: ["White Sulphur Springs Mineral Spa", "Championship Golf Courses", "Falconry & Gun Club"],
        description: "Known as 'America's Resort' since 1778, having hosted 28 US presidents and royalty."
      }
    ],
    activities: [
      {
        id: "act-wv-new-river-gorge",
        title: "New River Gorge Bridge Catwalk & Class V Whitewater Rafting",
        category: "Extreme Adventure & National Park",
        duration: "5 Hours",
        rating: 4.98,
        reviews: 2100,
        price: 160,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80",
        timeSlot: "09:30 AM - 02:30 PM",
        tags: ["876-ft High Catwalk", "Class V Rapids", "Gorge Overlook"],
        highlights: ["Walk the 24-inch catwalk 876 feet above the roaring river beneath the New River Gorge Bridge", "Tackle legendary Class IV-V rapids in the Lower Gorge canyon"]
      }
    ]
  },
  {
    id: "us-wisconsin",
    name: "Wisconsin",
    stateCode: "WI",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Door County Peninsula, Apostle Islands Sea Caves & Kohler Spa",
    description: "Lake Michigan's Door County maritime villages, sea caves and lighthouses of the Apostle Islands on Lake Superior, and championship golf in Kohler.",
    lat: 43.784440,
    lng: -88.787868,
    elevation: "320m",
    bestSeason: "May - October",
    currency: "USD ($)",
    weather: "21°C / Great Lakes summer",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-wi-american-club",
        name: "The American Club Resort & Whistling Straits",
        type: "Forbes 5-Star Historic Resort & Golf",
        rating: 4.97,
        reviews: 1850,
        pricePerNight: 720,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        address: "Kohler, WI",
        tags: ["Ryder Cup Whistling Straits", "Kohler Waters Spa", "Historic Red Brick Tudor"],
        amenities: ["Four Championship Golf Courses", "Hydrotherapy Mineral Water Spa", "Immersion Suites"],
        description: "The Midwest's only Forbes Five-Star resort hotel, home to the dramatic Whistling Straits golf course."
      }
    ],
    activities: [
      {
        id: "act-wi-apostle-sea-caves",
        title: "Apostle Islands Sea Caves Kayaking & Door County Fish Boil",
        category: "Great Lakes Kayak & Culture",
        duration: "4.5 Hours",
        rating: 4.97,
        reviews: 1920,
        price: 110,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80",
        timeSlot: "10:00 AM - 02:30 PM",
        tags: ["Red Sandstone Sea Caves", "Lake Superior", "Door County Tradition"],
        highlights: ["Paddle through sculpted red sandstone sea arches and vaulted marine caverns in Lake Superior", "Experience an authentic traditional outdoor Door County whitefish boil dinner"]
      }
    ]
  },
  {
    id: "us-wyoming",
    name: "Wyoming",
    stateCode: "WY",
    country: "United States",
    continent: "North America",
    tier: "state",
    regionId: "usa",
    tagline: "Yellowstone Geysers, Grand Teton Peaks & Jackson Hole",
    description: "Grand Prismatic Spring and Old Faithful in Yellowstone, the cathedral-like granite spires of the Grand Tetons, and authentic cowboy culture in Jackson Hole.",
    lat: 43.075968,
    lng: -107.290284,
    elevation: "2,040m",
    bestSeason: "May - Sept (Yellowstone & Tetons), Dec - April (Jackson Hole Skiing)",
    currency: "USD ($)",
    weather: "20°C / Pure mountain sun",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80",
    livingSpaces: [
      {
        id: "stay-wy-amangani",
        name: "Amangani & Four Seasons Jackson Hole",
        type: "5-Star East Gros Ventre Butte Sanctuary",
        rating: 4.99,
        reviews: 2100,
        pricePerNight: 1950,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        address: "1535 NE Butte Rd, Jackson, WY",
        tags: ["Teton Mountain Range Views", "Heated Infinity Pool", "Ski-In Access"],
        amenities: ["Panoramic Terrace", "Wildlife Safari Guides", "Aman Spa & Wellness"],
        description: "Perched on the crest of East Gros Ventre Butte, looking out across the Snake River Valley to the Grand Tetons."
      }
    ],
    activities: [
      {
        id: "act-wy-yellowstone-grand-teton",
        title: "Yellowstone Grand Prismatic & Lamar Valley Wildlife Safari",
        category: "Geothermal & Mega-Fauna",
        duration: "7 Hours",
        rating: 4.99,
        reviews: 5200,
        price: 245,
        currency: "USD",
        image: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=800&q=80",
        timeSlot: "07:30 AM - 02:30 PM",
        tags: ["Grand Prismatic Spring", "Grizzly Bears & Wolves", "Old Faithful"],
        highlights: ["Marvel at the rainbow-colored microbial rings of the 370-foot Grand Prismatic Spring", "Spot wild grizzly bears, bison herds, and wolf packs in America's Serengeti, Lamar Valley"]
      }
    ]
  }
];
