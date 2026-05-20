export interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
  costIndex: string;
  popularity: number;
  activities: string[];
}

export interface Activity {
  id: string;
  name: string;
  type: string;
  cost: string;
  duration: string;
  image: string;
  description: string;
  destination: string;
}

export const destinations: Destination[] = [
  { id: 'd1', name: 'Paris', country: 'France', image: '/images/dest-paris.jpg', description: 'City of lights, romance, and world-class cuisine', costIndex: 'High', popularity: 95, activities: ['Culture', 'Food', 'Sightseeing'] },
  { id: 'd2', name: 'Tokyo', country: 'Japan', image: '/images/dest-tokyo.jpg', description: 'Where ancient tradition meets futuristic innovation', costIndex: 'Medium', popularity: 92, activities: ['Culture', 'Food', 'Nightlife'] },
  { id: 'd3', name: 'Reykjavik', country: 'Iceland', image: '/images/dest-iceland.jpg', description: 'Gateway to the land of fire and ice', costIndex: 'High', popularity: 78, activities: ['Outdoors', 'Nature', 'Adventure'] },
  { id: 'd4', name: 'Santorini', country: 'Greece', image: '/images/dest-santorini.jpg', description: 'Iconic white-washed buildings with stunning sunsets', costIndex: 'High', popularity: 88, activities: ['Culture', 'Food', 'Outdoors'] },
  { id: 'd5', name: 'Bali', country: 'Indonesia', image: '/images/dest-bali.jpg', description: 'Tropical paradise with rich cultural heritage', costIndex: 'Low', popularity: 90, activities: ['Outdoors', 'Culture', 'Relaxation'] },
  { id: 'd6', name: 'Machu Picchu', country: 'Peru', image: '/images/dest-machupicchu.jpg', description: 'Ancient Incan citadel in the clouds', costIndex: 'Medium', popularity: 85, activities: ['Outdoors', 'History', 'Culture'] },
  { id: 'd7', name: 'Maldives', country: 'Maldives', image: '/images/dest-maldives.jpg', description: 'Crystal clear waters and overwater luxury', costIndex: 'Very High', popularity: 82, activities: ['Outdoors', 'Relaxation', 'Water Sports'] },
  { id: 'd8', name: 'New York', country: 'USA', image: '/images/dest-newyork.jpg', description: 'The city that never sleeps', costIndex: 'High', popularity: 93, activities: ['Culture', 'Food', 'Nightlife'] },
  { id: 'd9', name: 'Dubai', country: 'UAE', image: '/images/dest-dubai.jpg', description: 'Ultra-modern oasis in the desert', costIndex: 'High', popularity: 87, activities: ['Food', 'Nightlife', 'Shopping'] },
  { id: 'd10', name: 'Swiss Alps', country: 'Switzerland', image: '/images/dest-swiss.jpg', description: 'Majestic mountains and pristine lakes', costIndex: 'Very High', popularity: 80, activities: ['Outdoors', 'Nature', 'Skiing'] },
  { id: 'd11', name: 'Marrakech', country: 'Morocco', image: '/images/dest-morocco.jpg', description: 'Vibrant markets and rich cultural tapestry', costIndex: 'Low', popularity: 75, activities: ['Culture', 'Food', 'History'] },
  { id: 'd12', name: 'Sydney', country: 'Australia', image: '/images/dest-sydney.jpg', description: 'Harbor city with iconic landmarks', costIndex: 'High', popularity: 84, activities: ['Outdoors', 'Culture', 'Beaches'] },
  { id: 'd13', name: 'Rome', country: 'Italy', image: '/images/dest-rome.jpg', description: 'The eternal city with millennia of history', costIndex: 'Medium', popularity: 91, activities: ['Culture', 'Food', 'History'] },
  { id: 'd14', name: 'Cape Town', country: 'South Africa', image: '/images/dest-capetown.jpg', description: 'Stunning coastlines and mountain vistas', costIndex: 'Medium', popularity: 76, activities: ['Outdoors', 'Nature', 'Culture'] },
  { id: 'd15', name: 'London', country: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800', description: 'Historic landmarks meet modern culture', costIndex: 'Very High', popularity: 94, activities: ['Culture', 'Food', 'Nightlife'] },
  { id: 'd16', name: 'Kyoto', country: 'Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800', description: 'Traditional temples, gardens, and geisha districts', costIndex: 'High', popularity: 89, activities: ['Culture', 'Outdoors', 'History'] },
  { id: 'd17', name: 'Singapore', country: 'Singapore', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=800', description: 'Futuristic gardens and diverse street food', costIndex: 'Very High', popularity: 86, activities: ['Culture', 'Food', 'Architecture'] },
  { id: 'd18', name: 'Barcelona', country: 'Spain', image: 'https://images.unsplash.com/photo-1583422409516-15eba534e402?auto=format&fit=crop&q=80&w=800', description: 'Gaudí architecture and vibrant Mediterranean life', costIndex: 'Medium', popularity: 92, activities: ['Culture', 'Food', 'Nightlife'] },
  { id: 'd19', name: 'Rio de Janeiro', country: 'Brazil', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=800', description: 'Iconic beaches and lush mountain landscapes', costIndex: 'Medium', popularity: 83, activities: ['Outdoors', 'Beaches', 'Nightlife'] },
  { id: 'd21', name: 'Amsterdam', country: 'Netherlands', image: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?auto=format&fit=crop&q=80&w=800', description: 'Charming canals and world-class art museums', costIndex: 'High', popularity: 90, activities: ['Culture', 'Food', 'Nightlife'] },
  { id: 'd22', name: 'Prague', country: 'Czechia', image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&q=80&w=800', description: 'The City of a Hundred Spires with fairytale charm', costIndex: 'Low', popularity: 85, activities: ['Culture', 'History', 'Nightlife'] },
  { id: 'd23', name: 'Seoul', country: 'South Korea', image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&q=80&w=800', description: 'Dynamic metropolis blending palaces with high-tech', costIndex: 'Medium', popularity: 87, activities: ['Culture', 'Food', 'Nightlife'] },
  { id: 'd24', name: 'Bangkok', country: 'Thailand', image: 'https://images.unsplash.com/photo-1508009603885-247a505b3310?auto=format&fit=crop&q=80&w=800', description: 'Bustling street life and ornate shrines', costIndex: 'Low', popularity: 91, activities: ['Culture', 'Food', 'Nightlife'] },
];

export const activities: Activity[] = [
  { id: 'a1', name: 'Eiffel Tower Skip-the-Line', type: 'Sightseeing', cost: '€35', duration: '2-3 hours', image: '/images/dest-paris.jpg', description: 'Priority access to the iconic iron lady with summit views', destination: 'Paris' },
  { id: 'a2', name: 'Louvre Museum Guided Tour', type: 'Museums', cost: '€45', duration: '3 hours', image: '/images/dest-paris.jpg', description: 'Expert-guided tour through the world\'s largest art museum', destination: 'Paris' },
  { id: 'a3', name: 'Seine River Dinner Cruise', type: 'Food Tours', cost: '€85', duration: '2.5 hours', image: '/images/dest-paris.jpg', description: 'Romantic dinner cruise along the illuminated Seine', destination: 'Paris' },
  { id: 'a4', name: 'Tsukiji Fish Market Tour', type: 'Food Tours', cost: '¥8,000', duration: '3 hours', image: '/images/dest-tokyo.jpg', description: 'Early morning sushi breakfast and market exploration', destination: 'Tokyo' },
  { id: 'a5', name: 'Mt. Fuji Day Trip', type: 'Sightseeing', cost: '¥12,000', duration: '10 hours', image: '/images/dest-tokyo.jpg', description: 'Scenic day trip to Japan\'s iconic mountain', destination: 'Tokyo' },
  { id: 'a6', name: 'Northern Lights Tour', type: 'Adventure', cost: 'ISK 15,000', duration: '4 hours', image: '/images/dest-iceland.jpg', description: 'Hunt for the aurora borealis with expert guides', destination: 'Reykjavik' },
  { id: 'a7', name: 'Blue Lagoon Experience', type: 'Relaxation', cost: 'ISK 12,000', duration: '3 hours', image: '/images/dest-iceland.jpg', description: 'Soak in geothermal waters surrounded by lava fields', destination: 'Reykjavik' },
  { id: 'a8', name: 'Golden Circle Tour', type: 'Sightseeing', cost: 'ISK 10,000', duration: '8 hours', image: '/images/dest-iceland.jpg', description: 'Classic route through Iceland\'s natural wonders', destination: 'Reykjavik' },
  { id: 'a9', name: 'Sunset Wine Tasting', type: 'Food Tours', cost: '€65', duration: '2 hours', image: '/images/dest-santorini.jpg', description: 'Sample volcanic wines with caldera sunset views', destination: 'Santorini' },
  { id: 'a10', name: 'Ubud Rice Terrace Walk', type: 'Nature', cost: 'IDR 150,000', duration: '2 hours', image: '/images/dest-bali.jpg', description: 'Guided walk through UNESCO-recognized rice terraces', destination: 'Bali' },
  { id: 'a11', name: 'Colosseum Underground Tour', type: 'History', cost: '€55', duration: '3 hours', image: '/images/dest-rome.jpg', description: 'Exclusive access to underground chambers and arena floor', destination: 'Rome' },
  { id: 'a12', name: 'Vatican Museums Early Access', type: 'Museums', cost: '€50', duration: '3 hours', image: '/images/dest-rome.jpg', description: 'Beat the crowds with early morning Sistine Chapel access', destination: 'Rome' },
  { id: 'a13', name: 'Desert Safari & Camp', type: 'Adventure', cost: 'AED 350', duration: '6 hours', image: '/images/dest-dubai.jpg', description: 'Dune bashing, camel rides, and Bedouin dinner', destination: 'Dubai' },
  { id: 'a14', name: 'Safari Game Drive', type: 'Wildlife', cost: 'ZAR 2,500', duration: '4 hours', image: '/images/dest-safari.jpg', description: 'Spot the Big Five in their natural habitat', destination: 'Cape Town' },
  { id: 'a15', name: 'Table Mountain Cableway', type: 'Sightseeing', cost: 'ZAR 400', duration: '2 hours', image: '/images/dest-capetown.jpg', description: '360-degree rotating cable car to the summit', destination: 'Cape Town' },
  { id: 'a16', name: 'Paragliding Tandem Flight', type: 'Adventure', cost: 'CHF 180', duration: '1.5 hours', image: '/images/dest-swiss.jpg', description: 'Soar over Interlaken with breathtaking alpine views', destination: 'Swiss Alps' },
  { id: 'a17', name: 'Snorkeling with Mantas', type: 'Diving', cost: '$120', duration: '3 hours', image: '/images/dest-maldives.jpg', description: 'Swim alongside gentle manta rays at a cleaning station', destination: 'Maldives' },
  { id: 'a18', name: 'Harbor Bridge Climb', type: 'Adventure', cost: 'A$268', duration: '3.5 hours', description: 'Scale the iconic Sydney Harbour Bridge for panoramic views', image: '/images/dest-sydney.jpg', destination: 'Sydney' },
  { id: 'a19', name: 'British Museum Highlight Tour', type: 'Culture', cost: '£25', duration: '2 hours', image: 'https://images.unsplash.com/photo-1518974459163-852432ad4520?auto=format&fit=crop&q=80&w=800', description: 'Explore the world\'s greatest artifacts with a professional guide', destination: 'London' },
  { id: 'a20', name: 'London Eye Sunset Flight', type: 'Sightseeing', cost: '£38', duration: '30 mins', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800', description: 'Panoramic views of the London skyline at dusk', destination: 'London' },
  { id: 'a21', name: 'Borough Market Food Crawl', type: 'Food', cost: '£45', duration: '3 hours', image: 'https://images.unsplash.com/photo-1533777324545-d4bc5947a160?auto=format&fit=crop&q=80&w=800', description: 'Taste your way through London\'s most famous food market', destination: 'London' },
  { id: 'a22', name: 'Fushimi Inari Morning Hike', type: 'Outdoors', cost: 'Free', duration: '2-3 hours', image: 'https://images.unsplash.com/photo-1478338173525-5738ede2132b?auto=format&fit=crop&q=80&w=800', description: 'Walk through thousands of vermilion torii gates', destination: 'Kyoto' },
  { id: 'a23', name: 'Arashiyama Bamboo Forest', type: 'Outdoors', cost: 'Free', duration: '1.5 hours', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800', description: 'Ethereal walk through the towering bamboo groves', destination: 'Kyoto' },
  { id: 'a24', name: 'Tea Ceremony Experience', type: 'Culture', cost: '¥4,500', duration: '1 hour', image: 'https://images.unsplash.com/photo-1544634076-a196a1ff4cd1?auto=format&fit=crop&q=80&w=800', description: 'Traditional Japanese matcha preparation and tasting', destination: 'Kyoto' },
  { id: 'a25', name: 'Gardens by the Bay Light Show', type: 'Sightseeing', cost: 'Free', duration: '1 hour', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&q=80&w=800', description: 'Spectacular music and light show at the Supertree Grove', destination: 'Singapore' },
  { id: 'a26', name: 'Hawker Center Food Tour', type: 'Food', cost: '$35', duration: '2.5 hours', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800', description: 'Discover Singapore\'s world-famous street food culture', destination: 'Singapore' },
  { id: 'a27', name: 'Sagrada Familia Priority Tour', type: 'Culture', cost: '€35', duration: '1.5 hours', image: 'https://images.unsplash.com/photo-1583422409516-15eba534e402?auto=format&fit=crop&q=80&w=800', description: 'Marvel at Gaudí\'s unfinished masterpiece', destination: 'Barcelona' },
  { id: 'a28', name: 'Gothic Quarter Night Walk', type: 'History', cost: '€20', duration: '2 hours', image: 'https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?auto=format&fit=crop&q=80&w=800', description: 'Hidden stories of the medieval heart of Barcelona', destination: 'Barcelona' },
  { id: 'a29', name: 'Christ the Redeemer Cog Train', type: 'Sightseeing', cost: 'R$110', duration: '2 hours', image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=800', description: 'Train ride through Tijuca Forest to the iconic statue', destination: 'Rio de Janeiro' },
  { id: 'a30', name: 'Copacabana Beach Bike Tour', type: 'Outdoors', cost: 'R$85', duration: '3 hours', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800', description: 'Cycle along the world\'s most famous shoreline', destination: 'Rio de Janeiro' },
  { id: 'a31', name: 'Gyeongbokgung Palace Photo Tour', type: 'Culture', cost: '₩25,000', duration: '2 hours', image: 'https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&q=80&w=800', description: 'Professional photoshoot in traditional Hanbok attire', destination: 'Seoul' },
  { id: 'a32', name: 'Myeongdong Street Food Safari', type: 'Food', cost: '₩30,000', duration: '2 hours', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=800', description: 'Taste all the crazy street food Seoul has to offer', destination: 'Seoul' },
  { id: 'a33', name: 'Grand Palace Guided Visit', type: 'Culture', cost: '฿500', duration: '3 hours', image: 'https://images.unsplash.com/photo-1508009603885-247a505b3310?auto=format&fit=crop&q=80&w=800', description: 'Be dazzled by the intricate gold leaf and glass mosaics', destination: 'Bangkok' },
  { id: 'a34', name: 'Chao Phraya Dinner Cruise', type: 'Food', cost: '฿1,200', duration: '2 hours', image: 'https://images.unsplash.com/photo-1563492065561-36d31044afe1?auto=format&fit=crop&q=80&w=800', description: 'Romantic dinner passing the illuminated Wat Arun', destination: 'Bangkok' },
];
