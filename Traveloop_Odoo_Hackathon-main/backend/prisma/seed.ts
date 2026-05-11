import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ──────────────────────────────────────────────────────────────
// 20 Cities (per TRD Section 10.1)
// ──────────────────────────────────────────────────────────────
const cities = [
  { name: "Paris", country: "France", region: "Western Europe", cost_index: 150, popularity_score: 95, description: "The City of Light — art, fashion, and gastronomy at every corner.", image_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800" },
  { name: "Tokyo", country: "Japan", region: "East Asia", cost_index: 120, popularity_score: 98, description: "A dazzling blend of ultra-modern and traditional culture.", image_url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800" },
  { name: "New York", country: "USA", region: "North America", cost_index: 200, popularity_score: 97, description: "The city that never sleeps — iconic skyline and endless energy.", image_url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800" },
  { name: "Barcelona", country: "Spain", region: "Southern Europe", cost_index: 110, popularity_score: 92, description: "Gaudi, beaches, and world-class tapas.", image_url: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800" },
  { name: "Bangkok", country: "Thailand", region: "Southeast Asia", cost_index: 55, popularity_score: 90, description: "Vibrant street life, ornate temples, and legendary street food.", image_url: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800" },
  { name: "Amsterdam", country: "Netherlands", region: "Western Europe", cost_index: 130, popularity_score: 88, description: "Canals, cycling, and world-renowned museums.", image_url: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800" },
  { name: "Dubai", country: "UAE", region: "Middle East", cost_index: 180, popularity_score: 91, description: "Futuristic skyline, luxury shopping, and desert adventures.", image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800" },
  { name: "Rome", country: "Italy", region: "Southern Europe", cost_index: 115, popularity_score: 93, description: "Ancient ruins, Renaissance art, and the best pasta in the world.", image_url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800" },
  { name: "Singapore", country: "Singapore", region: "Southeast Asia", cost_index: 140, popularity_score: 89, description: "Garden city with stunning architecture and diverse cuisine.", image_url: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800" },
  { name: "London", country: "UK", region: "Western Europe", cost_index: 180, popularity_score: 96, description: "Royal heritage, West End shows, and iconic pubs.", image_url: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800" },
  { name: "Bali", country: "Indonesia", region: "Southeast Asia", cost_index: 45, popularity_score: 87, description: "Tropical paradise with rice terraces, temples, and surf.", image_url: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800" },
  { name: "Istanbul", country: "Turkey", region: "Middle East", cost_index: 70, popularity_score: 85, description: "Where East meets West — bazaars, mosques, and Bosphorus views.", image_url: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800" },
  { name: "Prague", country: "Czech Republic", region: "Eastern Europe", cost_index: 75, popularity_score: 84, description: "Fairy-tale architecture and world-famous beer culture.", image_url: "https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800" },
  { name: "Sydney", country: "Australia", region: "Oceania", cost_index: 160, popularity_score: 88, description: "Harbour Bridge, Opera House, and stunning coastal walks.", image_url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800" },
  { name: "Lisbon", country: "Portugal", region: "Southern Europe", cost_index: 90, popularity_score: 86, description: "Pastel-colored hills, fado music, and pasteis de nata.", image_url: "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800" },
  { name: "Mexico City", country: "Mexico", region: "North America", cost_index: 65, popularity_score: 83, description: "Rich history, vibrant art scene, and incredible street food.", image_url: "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800" },
  { name: "Cairo", country: "Egypt", region: "North Africa", cost_index: 50, popularity_score: 80, description: "Pyramids, pharaohs, and the mighty Nile.", image_url: "https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=800" },
  { name: "Vienna", country: "Austria", region: "Western Europe", cost_index: 120, popularity_score: 85, description: "Imperial palaces, classical music, and legendary coffee houses.", image_url: "https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=800" },
  { name: "Seoul", country: "South Korea", region: "East Asia", cost_index: 95, popularity_score: 87, description: "K-pop, tech innovation, and centuries-old palaces.", image_url: "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=800" },
  { name: "Cape Town", country: "South Africa", region: "Sub-Saharan Africa", cost_index: 80, popularity_score: 82, description: "Table Mountain, wine country, and stunning coastline.", image_url: "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800" },
];

// ──────────────────────────────────────────────────────────────
// Activities per city (5+ per city, covering different types)
// ──────────────────────────────────────────────────────────────
const activitiesByCity: Record<string, Array<{ name: string; type: string; cost: number; duration_mins: number; description: string }>> = {
  Paris: [
    { name: "Eiffel Tower Visit", type: "sightseeing", cost: 28, duration_mins: 120, description: "Ascend the iconic iron tower for panoramic views of Paris." },
    { name: "Seine River Cruise", type: "sightseeing", cost: 22, duration_mins: 90, description: "Glide past illuminated monuments on the Seine." },
    { name: "Louvre Museum", type: "culture", cost: 20, duration_mins: 180, description: "Home to the Mona Lisa and 35,000 works of art." },
    { name: "Montmartre Food Tour", type: "food", cost: 65, duration_mins: 150, description: "Taste your way through the artistic hilltop neighborhood." },
    { name: "Day Trip to Versailles", type: "day_trip", cost: 40, duration_mins: 360, description: "Explore the opulent palace and gardens of Louis XIV." },
  ],
  Tokyo: [
    { name: "Senso-ji Temple", type: "culture", cost: 0, duration_mins: 60, description: "Tokyo\u0027s oldest temple in the heart of Asakusa." },
    { name: "Tsukiji Outer Market Tour", type: "food", cost: 45, duration_mins: 120, description: "Sample the freshest sushi and street bites in Tokyo." },
    { name: "Shibuya Crossing Experience", type: "sightseeing", cost: 0, duration_mins: 30, description: "Stand in the world\u0027s busiest pedestrian crossing." },
    { name: "teamLab Borderless", type: "culture", cost: 32, duration_mins: 150, description: "Immersive digital art museum with infinite rooms." },
    { name: "Mt. Fuji Day Trip", type: "day_trip", cost: 85, duration_mins: 480, description: "Full-day excursion to Japan\u0027s sacred mountain." },
  ],
  "New York": [
    { name: "Statue of Liberty & Ellis Island", type: "sightseeing", cost: 24, duration_mins: 240, description: "Ferry ride and tour of America\u0027s most famous landmark." },
    { name: "Central Park Walking Tour", type: "sightseeing", cost: 0, duration_mins: 120, description: "Explore 843 acres of green in the heart of Manhattan." },
    { name: "Broadway Show", type: "culture", cost: 120, duration_mins: 180, description: "Catch a world-class theater performance on Broadway." },
    { name: "Chelsea Market Food Hall", type: "food", cost: 35, duration_mins: 90, description: "Artisanal food vendors in a converted factory." },
    { name: "Top of the Rock", type: "sightseeing", cost: 40, duration_mins: 60, description: "Observation deck with stunning skyline views." },
  ],
  Barcelona: [
    { name: "La Sagrada Familia", type: "sightseeing", cost: 26, duration_mins: 90, description: "Gaudi\u0027s unfinished masterpiece basilica." },
    { name: "Park Guell", type: "sightseeing", cost: 10, duration_mins: 120, description: "Colorful mosaic park designed by Gaudi." },
    { name: "La Boqueria Market", type: "food", cost: 20, duration_mins: 90, description: "Barcelona\u0027s famous covered market on La Rambla." },
    { name: "Gothic Quarter Walk", type: "culture", cost: 0, duration_mins: 120, description: "Wander medieval streets full of history and charm." },
    { name: "Barceloneta Beach", type: "adventure", cost: 0, duration_mins: 180, description: "Relax on the city\u0027s most popular beach." },
  ],
  Bangkok: [
    { name: "Grand Palace & Wat Phra Kaew", type: "sightseeing", cost: 15, duration_mins: 120, description: "Thailand\u0027s most sacred Buddhist temple complex." },
    { name: "Chatuchak Weekend Market", type: "shopping", cost: 5, duration_mins: 180, description: "One of the world\u0027s largest outdoor markets." },
    { name: "Street Food Tour by Tuk-Tuk", type: "food", cost: 35, duration_mins: 180, description: "Hop between Bangkok\u0027s best street food stalls." },
    { name: "Wat Arun at Sunset", type: "culture", cost: 3, duration_mins: 60, description: "The Temple of Dawn glowing in evening light." },
    { name: "Floating Market Day Trip", type: "day_trip", cost: 40, duration_mins: 300, description: "Visit Damnoen Saduak floating market." },
  ],
  Amsterdam: [
    { name: "Anne Frank House", type: "culture", cost: 16, duration_mins: 90, description: "The hiding place where Anne Frank wrote her diary." },
    { name: "Rijksmuseum", type: "culture", cost: 22, duration_mins: 180, description: "Dutch masterpieces including Rembrandt\u0027s Night Watch." },
    { name: "Canal Cruise", type: "sightseeing", cost: 18, duration_mins: 75, description: "Cruise through Amsterdam\u0027s UNESCO-listed canals." },
    { name: "Vondelpark Cycling", type: "adventure", cost: 12, duration_mins: 120, description: "Rent a bike and explore the city\u0027s green heart." },
    { name: "Jordaan Food Walk", type: "food", cost: 55, duration_mins: 150, description: "Taste Dutch treats in the charming Jordaan district." },
  ],
  Dubai: [
    { name: "Burj Khalifa Observation", type: "sightseeing", cost: 45, duration_mins: 90, description: "Visit the top of the world\u0027s tallest building." },
    { name: "Desert Safari", type: "adventure", cost: 70, duration_mins: 360, description: "Dune bashing, camel rides, and BBQ dinner under the stars." },
    { name: "Dubai Mall & Aquarium", type: "shopping", cost: 35, duration_mins: 180, description: "Shop and visit the massive indoor aquarium." },
    { name: "Old Dubai Souks Walk", type: "culture", cost: 0, duration_mins: 120, description: "Explore the Gold and Spice souks in historic Deira." },
    { name: "Dubai Marina Dinner Cruise", type: "food", cost: 80, duration_mins: 150, description: "Fine dining while cruising the glittering marina." },
  ],
  Rome: [
    { name: "Colosseum & Roman Forum", type: "sightseeing", cost: 18, duration_mins: 180, description: "Walk through ancient Rome\u0027s gladiatorial arena." },
    { name: "Vatican Museums & Sistine Chapel", type: "culture", cost: 20, duration_mins: 240, description: "Michelangelo\u0027s ceiling and centuries of papal art." },
    { name: "Trastevere Food Tour", type: "food", cost: 55, duration_mins: 180, description: "Eat your way through Rome\u0027s most charming neighborhood." },
    { name: "Trevi Fountain & Spanish Steps", type: "sightseeing", cost: 0, duration_mins: 60, description: "Toss a coin and climb the famous staircase." },
    { name: "Pantheon Visit", type: "culture", cost: 5, duration_mins: 45, description: "Marvel at the best-preserved ancient Roman building." },
  ],
  Singapore: [
    { name: "Gardens by the Bay", type: "sightseeing", cost: 20, duration_mins: 120, description: "Supertree Grove and Cloud Forest dome." },
    { name: "Hawker Centre Food Tour", type: "food", cost: 15, duration_mins: 120, description: "Michelin-starred street food at Maxwell or Lau Pa Sat." },
    { name: "Marina Bay Sands SkyPark", type: "sightseeing", cost: 26, duration_mins: 60, description: "Rooftop views over the Singapore skyline." },
    { name: "Sentosa Island", type: "adventure", cost: 45, duration_mins: 300, description: "Beaches, Universal Studios, and adventure sports." },
    { name: "Chinatown Heritage Walk", type: "culture", cost: 0, duration_mins: 90, description: "Explore temples, shophouses, and traditional crafts." },
  ],
  London: [
    { name: "Tower of London", type: "sightseeing", cost: 33, duration_mins: 180, description: "See the Crown Jewels and 1,000 years of history." },
    { name: "British Museum", type: "culture", cost: 0, duration_mins: 180, description: "Free entry to one of the world\u0027s greatest museums." },
    { name: "Borough Market", type: "food", cost: 25, duration_mins: 120, description: "London\u0027s oldest and most famous food market." },
    { name: "West End Musical", type: "culture", cost: 65, duration_mins: 180, description: "World-class theater in London\u0027s theater district." },
    { name: "Thames River Cruise", type: "sightseeing", cost: 20, duration_mins: 90, description: "Cruise past Big Ben, the Eye, and Tower Bridge." },
  ],
  Bali: [
    { name: "Tegallalang Rice Terraces", type: "sightseeing", cost: 5, duration_mins: 120, description: "Iconic terraced rice paddies in Ubud." },
    { name: "Uluwatu Temple Sunset", type: "culture", cost: 5, duration_mins: 120, description: "Cliff-top temple with traditional Kecak fire dance." },
    { name: "Ubud Cooking Class", type: "food", cost: 30, duration_mins: 240, description: "Learn to cook Balinese cuisine from scratch." },
    { name: "Surfing at Kuta Beach", type: "adventure", cost: 20, duration_mins: 120, description: "Beginner-friendly waves and surf lessons." },
    { name: "Nusa Penida Day Trip", type: "day_trip", cost: 55, duration_mins: 480, description: "Boat trip to stunning Kelingking Beach cliffs." },
  ],
  Istanbul: [
    { name: "Hagia Sophia", type: "culture", cost: 25, duration_mins: 90, description: "A masterpiece of Byzantine architecture." },
    { name: "Grand Bazaar", type: "shopping", cost: 0, duration_mins: 120, description: "One of the world\u0027s oldest and largest covered markets." },
    { name: "Bosphorus Cruise", type: "sightseeing", cost: 15, duration_mins: 120, description: "Sail between Europe and Asia on the Bosphorus strait." },
    { name: "Turkish Breakfast Experience", type: "food", cost: 20, duration_mins: 90, description: "Lavish traditional breakfast spread with dozens of dishes." },
    { name: "Topkapi Palace", type: "culture", cost: 20, duration_mins: 120, description: "Ottoman imperial palace with stunning courtyards." },
  ],
  Prague: [
    { name: "Prague Castle", type: "sightseeing", cost: 14, duration_mins: 180, description: "The world\u0027s largest ancient castle complex." },
    { name: "Charles Bridge Walk", type: "sightseeing", cost: 0, duration_mins: 60, description: "Iconic 14th-century bridge with baroque statues." },
    { name: "Czech Beer Tasting", type: "food", cost: 25, duration_mins: 120, description: "Sample the best of Czech brewing traditions." },
    { name: "Old Town Square & Astronomical Clock", type: "culture", cost: 0, duration_mins: 90, description: "Watch the 600-year-old clock\u0027s hourly show." },
    { name: "Kutna Hora Day Trip", type: "day_trip", cost: 35, duration_mins: 300, description: "Visit the famous Bone Church and silver mines." },
  ],
  Sydney: [
    { name: "Sydney Opera House Tour", type: "culture", cost: 30, duration_mins: 90, description: "Behind-the-scenes tour of the iconic venue." },
    { name: "Bondi to Coogee Coastal Walk", type: "adventure", cost: 0, duration_mins: 150, description: "Stunning 6km cliff-top walk between beaches." },
    { name: "Sydney Harbour Bridge Climb", type: "adventure", cost: 180, duration_mins: 210, description: "Climb to the summit of the Harbour Bridge." },
    { name: "Taronga Zoo", type: "sightseeing", cost: 45, duration_mins: 240, description: "Wildlife park with harbour views." },
    { name: "The Rocks Food Tour", type: "food", cost: 60, duration_mins: 150, description: "Historic precinct with artisan food vendors." },
  ],
  Lisbon: [
    { name: "Belem Tower & Monastery", type: "sightseeing", cost: 10, duration_mins: 120, description: "UNESCO sites and the birthplace of pasteis de nata." },
    { name: "Tram 28 Ride", type: "sightseeing", cost: 3, duration_mins: 45, description: "Iconic yellow tram through Lisbon\u0027s historic hills." },
    { name: "Alfama Fado Night", type: "culture", cost: 30, duration_mins: 120, description: "Live fado music in Lisbon\u0027s oldest neighborhood." },
    { name: "Time Out Market", type: "food", cost: 25, duration_mins: 90, description: "Curated food hall with Lisbon\u0027s top chefs." },
    { name: "Sintra Day Trip", type: "day_trip", cost: 35, duration_mins: 360, description: "Fairy-tale palaces nestled in misty mountains." },
  ],
  "Mexico City": [
    { name: "Frida Kahlo Museum", type: "culture", cost: 13, duration_mins: 120, description: "The Blue House — Frida\u0027s birthplace and studio." },
    { name: "Teotihuacan Pyramids", type: "day_trip", cost: 40, duration_mins: 360, description: "Climb the ancient Pyramid of the Sun." },
    { name: "Street Taco Tour", type: "food", cost: 30, duration_mins: 180, description: "Taste authentic tacos al pastor, suadero, and more." },
    { name: "Chapultepec Castle", type: "sightseeing", cost: 5, duration_mins: 120, description: "Hilltop castle with murals and city views." },
    { name: "Xochimilco Floating Gardens", type: "adventure", cost: 20, duration_mins: 240, description: "Colorful trajineras through ancient canals." },
  ],
  Cairo: [
    { name: "Great Pyramids of Giza", type: "sightseeing", cost: 20, duration_mins: 180, description: "The last surviving Wonder of the Ancient World." },
    { name: "Egyptian Museum", type: "culture", cost: 12, duration_mins: 180, description: "Tutankhamun\u0027s golden mask and thousands of artifacts." },
    { name: "Khan el-Khalili Bazaar", type: "shopping", cost: 0, duration_mins: 120, description: "Bustling medieval market in Islamic Cairo." },
    { name: "Nile Felucca Ride", type: "sightseeing", cost: 10, duration_mins: 90, description: "Traditional sailboat cruise on the Nile." },
    { name: "Cairo Street Food Walk", type: "food", cost: 15, duration_mins: 120, description: "Koshari, ful, and taameya — Cairo\u0027s best bites." },
  ],
  Vienna: [
    { name: "Schonbrunn Palace", type: "sightseeing", cost: 22, duration_mins: 180, description: "Former imperial summer residence with stunning gardens." },
    { name: "Vienna State Opera", type: "culture", cost: 50, duration_mins: 180, description: "World-famous opera house with standing-room tickets." },
    { name: "Naschmarkt Food Tour", type: "food", cost: 40, duration_mins: 120, description: "Vienna\u0027s most popular market since the 16th century." },
    { name: "St. Stephen\u0027s Cathedral", type: "culture", cost: 6, duration_mins: 60, description: "Gothic cathedral with panoramic tower views." },
    { name: "Danube River Cruise", type: "sightseeing", cost: 25, duration_mins: 120, description: "Scenic cruise along the Blue Danube." },
  ],
  Seoul: [
    { name: "Gyeongbokgung Palace", type: "culture", cost: 3, duration_mins: 120, description: "Grand Joseon dynasty palace with guard changing ceremony." },
    { name: "Myeongdong Shopping District", type: "shopping", cost: 0, duration_mins: 180, description: "K-beauty, fashion, and buzzing street food stalls." },
    { name: "Korean BBQ Experience", type: "food", cost: 25, duration_mins: 90, description: "Grill premium beef at a traditional Korean restaurant." },
    { name: "Bukchon Hanok Village", type: "culture", cost: 0, duration_mins: 90, description: "Charming traditional Korean houses between palaces." },
    { name: "DMZ Tour", type: "day_trip", cost: 50, duration_mins: 480, description: "Visit the world\u0027s most heavily fortified border." },
  ],
  "Cape Town": [
    { name: "Table Mountain Hike", type: "adventure", cost: 15, duration_mins: 240, description: "Hike or cable car to the flat-topped summit." },
    { name: "Cape Peninsula Day Tour", type: "day_trip", cost: 60, duration_mins: 480, description: "Chapman\u0027s Peak, penguins at Boulders Beach, Cape Point." },
    { name: "V&A Waterfront", type: "shopping", cost: 0, duration_mins: 180, description: "Harbourside shops, restaurants, and the Two Oceans Aquarium." },
    { name: "Bo-Kaap Walking Tour", type: "culture", cost: 10, duration_mins: 90, description: "Colorful houses and Cape Malay culture." },
    { name: "Cape Winelands Tour", type: "food", cost: 55, duration_mins: 360, description: "Wine tasting in Stellenbosch and Franschhoek." },
  ],
};

async function main() {
  console.log("Seeding Traveloop database...\n");

  // Clear existing data (in correct order for FK constraints)
  await prisma.stopActivity.deleteMany();
  await prisma.tripNote.deleteMany();
  await prisma.packingItem.deleteMany();
  await prisma.tripStop.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();

  console.log("Cleared existing data");

  // Seed cities
  for (const cityData of cities) {
    const city = await prisma.city.create({ data: cityData });
    console.log(`Created city: ${city.name}`);

    // Seed activities for this city
    const cityActivities = activitiesByCity[cityData.name];
    if (cityActivities) {
      for (const actData of cityActivities) {
        await prisma.activity.create({
          data: {
            city_id: city.id,
            name: actData.name,
            type: actData.type,
            cost: actData.cost,
            duration_mins: actData.duration_mins,
            description: actData.description,
          },
        });
      }
      console.log(`  Added ${cityActivities.length} activities`);
    }
  }

  const cityCount = await prisma.city.count();
  const activityCount = await prisma.activity.count();
  console.log(`\nSeeding complete: ${cityCount} cities, ${activityCount} activities`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
