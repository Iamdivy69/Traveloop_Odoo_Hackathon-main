import { useState } from 'react';
import { Search, MapPin, Plus, Filter, Star, DollarSign, Globe, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_CITIES = [
  {
    id: 1,
    name: 'Paris',
    country: 'France',
    region: 'Europe',
    image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&q=80&w=800',
    costIndex: 4,
    popularity: 4.8,
    description: 'City of light, art, and exquisite cuisine.',
  },
  {
    id: 2,
    name: 'Kyoto',
    country: 'Japan',
    region: 'Asia',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',
    costIndex: 3,
    popularity: 4.9,
    description: 'Historic temples, traditional gardens, and geisha districts.',
  },
  {
    id: 3,
    name: 'New York City',
    country: 'USA',
    region: 'North America',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=800',
    costIndex: 5,
    popularity: 4.7,
    description: 'The city that never sleeps, known for its skyline and culture.',
  },
  {
    id: 4,
    name: 'Bali',
    country: 'Indonesia',
    region: 'Asia',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800',
    costIndex: 2,
    popularity: 4.6,
    description: 'Tropical paradise with beaches, temples, and yoga retreats.',
  },
  {
    id: 5,
    name: 'Rome',
    country: 'Italy',
    region: 'Europe',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=800',
    costIndex: 3,
    popularity: 4.8,
    description: 'Ancient ruins, spectacular food, and vibrant street life.',
  },
  {
    id: 6,
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Africa',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&q=80&w=800',
    costIndex: 2,
    popularity: 4.5,
    description: 'Stunning coastal views, mountains, and rich history.',
  },
  {
    id: 7,
    name: 'Rio de Janeiro',
    country: 'Brazil',
    region: 'South America',
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&q=80&w=800',
    costIndex: 3,
    popularity: 4.6,
    description: 'Iconic beaches, lush mountains, and vibrant Carnival culture.',
  },
  {
    id: 8,
    name: 'Sydney',
    country: 'Australia',
    region: 'Oceania',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&q=80&w=800',
    costIndex: 4,
    popularity: 4.7,
    description: 'Spectacular harbor city with iconic architecture and beaches.',
  },

  {
    id: 10,
    name: 'Cairo',
    country: 'Egypt',
    region: 'Africa',
    image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&q=80&w=800',
    costIndex: 2,
    popularity: 4.4,
    description: 'Gateway to ancient pyramids and the mighty Nile River.',
  },
  {
    id: 11,
    name: 'Cusco',
    country: 'Peru',
    region: 'South America',
    image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?auto=format&fit=crop&q=80&w=800',
    costIndex: 2,
    popularity: 4.9,
    description: 'High-altitude city and gateway to majestic Machu Picchu.',
  },
  {
    id: 12,
    name: 'Vancouver',
    country: 'Canada',
    region: 'North America',
    image: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&q=80&w=800',
    costIndex: 4,
    popularity: 4.6,
    description: 'A bustling west coast seaport surrounded by majestic mountains.',
  },
  {
    id: 13,
    name: 'Santorini',
    country: 'Greece',
    region: 'Europe',
    image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80&w=800',
    costIndex: 4,
    popularity: 4.9,
    description: 'Iconic white-washed buildings with stunning Aegean sunsets.',
  },

];

const REGIONS = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'];

export default function CitySearch() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [addedCities, setAddedCities] = useState<number[]>([]);

  const filteredCities = MOCK_CITIES.filter((city) => {
    const matchesSearch = city.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          city.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'All' || city.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const toggleCity = (id: number) => {
    setAddedCities((prev) => 
      prev.includes(id) ? prev.filter((cityId) => cityId !== id) : [...prev, id]
    );
  };

  return (
    <div className="page-transition max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold tracking-widest text-[#94a3b8] uppercase mb-1">DISCOVER</p>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading">City Search</h1>
        <p className="text-[#64748B] text-sm mt-2">Find and add perfect destinations to your itinerary.</p>
      </div>

      {/* Search and Filters */}
      <div className="card p-4 mb-8 sticky top-4 z-10">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Search by city or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#e2e8f0] focus:border-[#E8604C] focus:ring-1 focus:ring-[#E8604C] outline-none transition-all text-sm text-[#0b1c30]"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#f1f5f9] rounded-lg border border-[#e2e8f0] mr-2">
              <Filter className="w-4 h-4 text-[#64748B]" />
              <span className="text-xs font-medium text-[#64748B]">Region:</span>
            </div>
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRegion === region
                    ? 'bg-[#E8604C] text-white shadow-sm'
                    : 'bg-white border border-[#e2e8f0] text-[#64748B] hover:border-[#E8604C]/30 hover:bg-[#f8fafc]'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCities.map((city) => {
          const isAdded = addedCities.includes(city.id);
          return (
            <div key={city.id} className="card-interactive overflow-hidden flex flex-col h-full group">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={city.image} 
                  alt={city.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="badge bg-white/90 backdrop-blur-sm text-[#0b1c30] shadow-sm">
                    <Star className="w-3 h-3 text-[#ffcc66] fill-current mr-1" />
                    {city.popularity}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-2">
                  <h3 className="text-lg font-bold text-[#0b1c30] font-heading flex items-center justify-between">
                    {city.name}
                  </h3>
                  <div className="flex items-center text-[#64748B] text-xs mt-1 gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {city.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {city.region}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-[#64748B] line-clamp-2 mb-4 flex-1">
                  {city.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#f1f5f9]">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[#94a3b8]">Cost Index:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <DollarSign 
                          key={i} 
                          className={`w-3 h-3 ${i < city.costIndex ? 'text-[#059669]' : 'text-[#e2e8f0]'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleCity(city.id)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                      isAdded 
                        ? 'bg-[#ecfdf5] text-[#059669] border border-[#059669]/20' 
                        : 'bg-[#001b26] text-white hover:bg-[#0b1c30] shadow-sm'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Navigation className="w-3 h-3" />
                        Added to Trip
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Add to Trip
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCities.length === 0 && (
        <div className="text-center py-20 card">
          <Globe className="w-12 h-12 text-[#e2e8f0] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#0b1c30] font-heading">No cities found</h3>
          <p className="text-[#64748B] text-sm mt-2">Try adjusting your search or region filter.</p>
        </div>
      )}

      {addedCities.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button 
            onClick={() => navigate('/itinerary/build')}
            className="btn-primary shadow-lg shadow-[#E8604C]/20 px-6 py-3 flex items-center gap-2 animate-bounce"
          >
            Go to Itinerary Builder
            <span className="bg-white text-[#E8604C] text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
              {addedCities.length}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
