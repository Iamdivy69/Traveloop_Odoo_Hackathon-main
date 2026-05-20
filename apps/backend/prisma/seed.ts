import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ActivityType =
  | "sightseeing"
  | "food"
  | "adventure"
  | "culture"
  | "nightlife"
  | "wellness";

type CitySeed = {
  name: string;
  country: string;
  region: string;
  cost_index: number;
  popularity_score: number;
  description: string;
  image_url: string;
};

type ActivitySeed = {
  name: string;
  type: ActivityType;
  cost: number;
  duration_mins: number;
  description: string;
};

const cities: CitySeed[] = [
  {
    name: "Paris",
    country: "France",
    region: "Île-de-France",
    cost_index: 185,
    popularity_score: 96,
    description:
      "Art, fashion, and world-class dining along the Seine — from the Eiffel Tower to hidden bistros.",
    image_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800",
  },
  {
    name: "Tokyo",
    country: "Japan",
    region: "Kanto",
    cost_index: 165,
    popularity_score: 98,
    description:
      "Neon skylines, serene shrines, and unbeatable food halls in one of the world’s great megacities.",
    image_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
  },
  {
    name: "Bali",
    country: "Indonesia",
    region: "Lesser Sunda Islands",
    cost_index: 55,
    popularity_score: 92,
    description:
      "Volcanic peaks, terraced rice fields, surf breaks, and restorative spa culture across the island.",
    image_url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800",
  },
  {
    name: "New York",
    country: "USA",
    region: "New York",
    cost_index: 220,
    popularity_score: 97,
    description:
      "Broadway, museums, skyline views, and a 24/7 food scene — the classic American city break.",
    image_url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
  },
  {
    name: "Dubai",
    country: "UAE",
    region: "Dubai Emirate",
    cost_index: 195,
    popularity_score: 91,
    description:
      "Ultramodern towers, desert dunes, and waterfront dining at the crossroads of the Gulf.",
    image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
  },
  {
    name: "Bangkok",
    country: "Thailand",
    region: "Central Thailand",
    cost_index: 52,
    popularity_score: 93,
    description:
      "Gilded temples, longtail boats on the Chao Phraya, and legendary street food on every corner.",
    image_url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800",
  },
  {
    name: "Cape Town",
    country: "South Africa",
    region: "Western Cape",
    cost_index: 78,
    popularity_score: 88,
    description:
      "Table Mountain, Atlantic surf, wine valleys, and a vibrant mix of cultures beneath the peaks.",
    image_url: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800",
  },
  {
    name: "Rome",
    country: "Italy",
    region: "Lazio",
    cost_index: 125,
    popularity_score: 94,
    description:
      "Layered history from the Colosseum to Baroque piazzas — plus pasta, gelato, and aperitivo.",
    image_url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800",
  },
  {
    name: "Barcelona",
    country: "Spain",
    region: "Catalonia",
    cost_index: 118,
    popularity_score: 93,
    description:
      "Gaudí architecture, Mediterranean beaches, and tapas bars spilling into lively lanes.",
    image_url: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800",
  },
  {
    name: "Singapore",
    country: "Singapore",
    region: "Singapore",
    cost_index: 175,
    popularity_score: 90,
    description:
      "Futuristic gardens, hawker legends, and seamless transit in a compact, green city-state.",
    image_url: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800",
  },
];

const activitiesByCity: Record<string, ActivitySeed[]> = {
  Paris: [
    {
      name: "Eiffel Tower & Trocadéro",
      type: "sightseeing",
      cost: 28,
      duration_mins: 120,
      description:
        "Timed entry to the iron lattice icon and skyline photos from the Trocadéro esplanade.",
    },
    {
      name: "Louvre Masterpieces Tour",
      type: "culture",
      cost: 22,
      duration_mins: 180,
      description:
        "Focus on crown jewels like the Mona Lisa plus quieter wings of painting and sculpture.",
    },
    {
      name: "Le Marais Pastry & Bistros",
      type: "food",
      cost: 72,
      duration_mins: 150,
      description:
        "Guided tasting of viennoiserie, cheese, and small plates in historic Marais lanes.",
    },
    {
      name: "Seine Evening Cruise",
      type: "sightseeing",
      cost: 24,
      duration_mins: 90,
      description: "Illuminated bridges and monuments from the water after sunset.",
    },
    {
      name: "Montmartre Wine Bar Evening",
      type: "nightlife",
      cost: 55,
      duration_mins: 120,
      description: "Natural wines and small plates near Sacré-Cœur as the quartier winds down.",
    },
  ],
  Tokyo: [
    {
      name: "Senso-ji & Nakamise",
      type: "culture",
      cost: 0,
      duration_mins: 90,
      description: "Tokyo’s oldest temple, thunder gate, and traditional snack stalls.",
    },
    {
      name: "Tsukiji Outer Market Breakfast",
      type: "food",
      cost: 48,
      duration_mins: 120,
      description: "Chef-led grazing on tamago, grilled seafood, and seasonal produce.",
    },
    {
      name: "Shibuya Sky & Scramble",
      type: "sightseeing",
      cost: 18,
      duration_mins: 75,
      description: "Open-air deck above the world-famous pedestrian scramble.",
    },
    {
      name: "teamLab Planets",
      type: "culture",
      cost: 32,
      duration_mins: 120,
      description: "Walk-through digital installations and mirrored water rooms.",
    },
    {
      name: "Onsen & Massage in Odaiba",
      type: "wellness",
      cost: 65,
      duration_mins: 150,
      description: "Rooftop baths, sauna rounds, and a therapeutic massage slot.",
    },
  ],
  Bali: [
    {
      name: "Tegallalang Rice Terraces",
      type: "sightseeing",
      cost: 5,
      duration_mins: 120,
      description: "Sunrise viewpoints and gentle walks through sculpted paddies near Ubud.",
    },
    {
      name: "Ubud Balinese Cooking Class",
      type: "food",
      cost: 35,
      duration_mins: 240,
      description: "Market shop, spice paste prep, and a family-style lunch you helped cook.",
    },
    {
      name: "Mount Batur Sunrise Trek",
      type: "adventure",
      cost: 45,
      duration_mins: 300,
      description: "Early climb to a volcanic crater rim as dawn breaks over Lake Batur.",
    },
    {
      name: "Uluwatu Temple & Kecak",
      type: "culture",
      cost: 12,
      duration_mins: 150,
      description: "Clifftop sea temple plus fire-trance kecak performance at dusk.",
    },
    {
      name: "Jungle Spa & Flower Bath",
      type: "wellness",
      cost: 85,
      duration_mins: 150,
      description:
        "Open-air treatment suites, Balinese massage, and a floral soak overlooking the jungle.",
    },
  ],
  "New York": [
    {
      name: "Statue of Liberty & Ellis Island",
      type: "sightseeing",
      cost: 24,
      duration_mins: 240,
      description: "Ferry, pedestal or crown options, and immigration museum exhibits.",
    },
    {
      name: "Metropolitan Museum of Art",
      type: "culture",
      cost: 30,
      duration_mins: 180,
      description: "Highlights tour across Egyptian, European painting, and American wings.",
    },
    {
      name: "Chelsea Market Food Crawl",
      type: "food",
      cost: 40,
      duration_mins: 90,
      description: "Tacos, doughnuts, and artisan bites inside the historic factory complex.",
    },
    {
      name: "Brooklyn Bridge & DUMBO Walk",
      type: "sightseeing",
      cost: 0,
      duration_mins: 120,
      description: "Classic bridge crossing ending at waterfront views of Manhattan.",
    },
    {
      name: "Greenwich Village Jazz Night",
      type: "nightlife",
      cost: 35,
      duration_mins: 150,
      description: "Intimate club set in a basement venue with late-night sets.",
    },
  ],
  Dubai: [
    {
      name: "Burj Khalifa At the Top",
      type: "sightseeing",
      cost: 48,
      duration_mins: 90,
      description: "Fast-track entry to observation decks above the Downtown skyline.",
    },
    {
      name: "Desert Safari & BBQ",
      type: "adventure",
      cost: 75,
      duration_mins: 360,
      description: "Dune bashing, camel ride, henna, and dinner under the stars.",
    },
    {
      name: "Al Fahidi & Abra Crossing",
      type: "culture",
      cost: 2,
      duration_mins: 120,
      description: "Wind-tower neighborhood, coffee museum, and a wooden abra across the creek.",
    },
    {
      name: "Emirati Lunch Experience",
      type: "food",
      cost: 55,
      duration_mins: 90,
      description: "Shared platters of machboos, salads, and luqaimat in a heritage house.",
    },
    {
      name: "Luxury Hammam Ritual",
      type: "wellness",
      cost: 120,
      duration_mins: 120,
      description: "Steam, kessa exfoliation, and argan-oil massage in a five-star spa.",
    },
  ],
  Bangkok: [
    {
      name: "Grand Palace & Wat Phra Kaew",
      type: "culture",
      cost: 16,
      duration_mins: 150,
      description: "Gilded halls, Emerald Buddha chapel, and manicured palace grounds.",
    },
    {
      name: "Chinatown Street Food Circuit",
      type: "food",
      cost: 30,
      duration_mins: 180,
      description: "Yaowarat after dark: crab omelets, pepper soup, and mango sticky rice.",
    },
    {
      name: "Longtail Canal Adventure",
      type: "adventure",
      cost: 40,
      duration_mins: 150,
      description: "Weave through khlongs, floating kitchens, and stilted neighborhoods.",
    },
    {
      name: "Wat Arun Golden Hour",
      type: "sightseeing",
      cost: 4,
      duration_mins: 75,
      description: "Climb the prang of the Temple of Dawn as the river turns amber.",
    },
    {
      name: "Thonglor Rooftop Cocktails",
      type: "nightlife",
      cost: 45,
      duration_mins: 120,
      description: "Craft cocktails and city lights from a high-rise lounge.",
    },
  ],
  "Cape Town": [
    {
      name: "Table Mountain Cableway",
      type: "sightseeing",
      cost: 28,
      duration_mins: 150,
      description: "Rotating cable car to the plateau plus short walks above the cloud line.",
    },
    {
      name: "Lion’s Head Sunrise Hike",
      type: "adventure",
      cost: 0,
      duration_mins: 180,
      description: "Chains and ladders to a 360° dawn view over the Atlantic seaboard.",
    },
    {
      name: "Bo-Kaap Heritage Walk",
      type: "culture",
      cost: 15,
      duration_mins: 90,
      description: "Cape Malay history, spice shops, and the technicolor house facades.",
    },
    {
      name: "Constantia Wine & Lunch",
      type: "food",
      cost: 85,
      duration_mins: 240,
      description: "Estate tastings paired with Cape Dutch architecture and mountain vistas.",
    },
    {
      name: "Camps Bay Sunset Aperitif",
      type: "nightlife",
      cost: 35,
      duration_mins: 90,
      description: "Ocean-facing terraces and chilled local wines as the sun drops.",
    },
  ],
  Rome: [
    {
      name: "Colosseum & Forum",
      type: "sightseeing",
      cost: 20,
      duration_mins: 200,
      description: "Skip-the-line arena floor perspective plus Roman Forum ruins.",
    },
    {
      name: "Vatican Museums & Sistine",
      type: "culture",
      cost: 22,
      duration_mins: 240,
      description: "Raphael Rooms, Gallery of Maps, and Michelangelo’s ceiling finale.",
    },
    {
      name: "Trastevere Supper Stroll",
      type: "food",
      cost: 68,
      duration_mins: 180,
      description: "Supplì, carbonara, and gelato between ivy-draped trattorias.",
    },
    {
      name: "Appian Way Bike Ride",
      type: "adventure",
      cost: 40,
      duration_mins: 210,
      description: "Cobblestone aqueducts and catacombs on a guided pedal route.",
    },
    {
      name: "Testaccio Late Night",
      type: "nightlife",
      cost: 42,
      duration_mins: 150,
      description: "Warehouse clubs and natural wine bars in Rome’s food-forward quarter.",
    },
  ],
  Barcelona: [
    {
      name: "Sagrada Família Interior",
      type: "sightseeing",
      cost: 28,
      duration_mins: 100,
      description: "Forest-like columns, stained glass light, and Gaudí’s unfinished spires.",
    },
    {
      name: "Picasso Museum & El Born",
      type: "culture",
      cost: 14,
      duration_mins: 120,
      description: "Blue Period masterpieces woven into a medieval palace neighborhood.",
    },
    {
      name: "Pintxos Crawl in Gràcia",
      type: "food",
      cost: 52,
      duration_mins: 150,
      description: "Basque-style small plates and vermut on leafy plazas.",
    },
    {
      name: "Montjuïc Cable & Castle",
      type: "adventure",
      cost: 15,
      duration_mins: 150,
      description: "Harbor cable car, civil-war fortress, and panoramic city viewpoints.",
    },
    {
      name: "Flamenco Tablao",
      type: "nightlife",
      cost: 38,
      duration_mins: 90,
      description: "Intimate guitar, song, and dance set with a drink included.",
    },
  ],
  Singapore: [
    {
      name: "Gardens by the Bay",
      type: "sightseeing",
      cost: 22,
      duration_mins: 120,
      description: "Supertree Grove, Cloud Forest mist mountain, and Flower Dome.",
    },
    {
      name: "Hawker Centre Heritage Trail",
      type: "food",
      cost: 18,
      duration_mins: 120,
      description: "Chicken rice, laksa, and kopi across Maxwell, Chinatown, and Old Airport.",
    },
    {
      name: "National Gallery Singapore",
      type: "culture",
      cost: 20,
      duration_mins: 150,
      description: "Southeast Asian modern art inside the restored City Hall wing.",
    },
    {
      name: "Marina Bay Rooftop Night",
      type: "nightlife",
      cost: 32,
      duration_mins: 120,
      description: "Skyline cocktails where the bay lights reflect off the water.",
    },
    {
      name: "Sentosa Spa Day",
      type: "wellness",
      cost: 95,
      duration_mins: 180,
      description: "Hydrotherapy pools, aromatherapy massage, and quiet garden time.",
    },
  ],
};

async function main() {
  console.log("Seeding Traveloop reference data (idempotent upserts)...\n");

  let cityCount = 0;
  let activityCount = 0;

  for (const cityData of cities) {
    const city = await prisma.city.upsert({
      where: {
        name_country: { name: cityData.name, country: cityData.country },
      },
      create: {
        name: cityData.name,
        country: cityData.country,
        region: cityData.region,
        cost_index: cityData.cost_index,
        popularity_score: cityData.popularity_score,
        description: cityData.description,
        image_url: cityData.image_url,
      },
      update: {
        region: cityData.region,
        cost_index: cityData.cost_index,
        popularity_score: cityData.popularity_score,
        description: cityData.description,
        image_url: cityData.image_url,
      },
    });
    cityCount += 1;

    const acts = activitiesByCity[cityData.name];
    if (!acts?.length) {
      console.warn(`No activities defined for ${cityData.name}; skipping.`);
      continue;
    }

    for (const act of acts) {
      await prisma.activity.upsert({
        where: {
          city_id_name: { city_id: city.id, name: act.name },
        },
        create: {
          city_id: city.id,
          name: act.name,
          type: act.type,
          cost: act.cost,
          duration_mins: act.duration_mins,
          description: act.description,
        },
        update: {
          type: act.type,
          cost: act.cost,
          duration_mins: act.duration_mins,
          description: act.description,
        },
      });
      activityCount += 1;
    }

    console.log(`Upserted ${cityData.name}: ${acts.length} activities`);
  }

  console.log(
    `\nDone: ${cityCount} cities upserted, ${activityCount} activity upserts processed.`,
  );
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
