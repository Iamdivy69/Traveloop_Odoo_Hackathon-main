import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { destinations, activities } from '../data/destinations';
import {
  Search,
  Clock,
  DollarSign,
  Plus,
  Star,
  Bookmark,
  Mountain,
  UtensilsCrossed,
  Sparkles,
  Landmark,
} from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  Outdoors: Mountain,
  Culture: Landmark,
  Food: UtensilsCrossed,
  Nightlife: Sparkles,
};

export default function ActivitySearch() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [viewMode, setViewMode] = useState<'cities' | 'activities'>('cities');

  const filteredCities = useMemo(() => {
    return destinations.filter((d) => {
      const matchSearch = !searchQuery ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.country.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = !activeCategory || d.activities.includes(activeCategory);
      return matchSearch && matchType;
    });
  }, [searchQuery, activeCategory]);

  const filteredActivities = useMemo(() => {
    return activities.filter((a) => {
      const matchSearch = !searchQuery ||
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.destination.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCity = !selectedCity || a.destination === selectedCity;
      return matchSearch && matchCity;
    });
  }, [searchQuery, selectedCity]);

  const categories = ['Outdoors', 'Culture', 'Food', 'Nightlife'];

  return (
    <div className="page-transition">
      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-[#0b1c30] font-heading mb-2">
          Where do you want to go?
        </h1>
        <p className="text-[#64748B] max-w-lg mx-auto">
          Discover curated itineraries, hidden gems, and expert local recommendations for your next adventure.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="card flex items-center p-1.5">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cities, countries, or activities..."
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-transparent focus:outline-none text-sm text-[#0b1c30] placeholder:text-[#94a3b8]"
            />
          </div>
          <button 
            onClick={() => {
              if (searchQuery) {
                // If there's a search query, we could potentially trigger a specific view or just let the filter handle it
                console.log('Exploring:', searchQuery);
              }
            }}
            className="btn-primary py-3 px-6 text-sm rounded-xl"
          >
            Explore
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat] || Star;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-[#001b26] text-white'
                  : 'bg-white text-[#64748B] border border-[#e2e8f0] hover:bg-[#f1f5f9] hover:text-[#0b1c30]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat}
            </button>
          );
        })}
        <button 
          onClick={() => alert('Saved items feature coming soon!')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all bg-white text-[#E8604C] border border-[#E8604C]/20 hover:bg-[#E8604C]/5`}
        >
          <Bookmark className="w-4 h-4" />
          Saved
        </button>
      </div>

      {/* Trending Destinations */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#0b1c30] font-heading">Trending Destinations</h2>
            <p className="text-sm text-[#94a3b8] mt-0.5">Highly rated by the Traveloop community right now.</p>
          </div>
          <button 
            onClick={() => navigate('/cities')}
            className="text-sm text-[#64748B] hover:text-[#0b1c30] font-medium flex items-center gap-1 transition-colors"
          >
            View all <span className="text-lg">→</span>
          </button>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[220px] lg:auto-rows-[260px]">
          {filteredCities.slice(0, 5).map((dest, i) => (
            <div
              key={dest.id}
              role="button"
              tabIndex={0}
              onClick={() => { setSelectedCity(dest.name); setViewMode('activities'); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedCity(dest.name); setViewMode('activities'); e.preventDefault(); } }}
              className={`group relative rounded-2xl overflow-hidden text-left cursor-pointer ${
                i === 0 ? 'row-span-2 col-span-1 lg:col-span-2' : ''
              }`}
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Bookmark */}
              <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#64748B] hover:text-[#E8604C] transition-colors z-10">
                <Bookmark className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
                {i === 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge bg-[#E8604C] text-white text-[10px]">CULTURE</span>
                    <span className="badge bg-white/20 text-white text-[10px] backdrop-blur-sm flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> {dest.popularity ? (dest.popularity / 20).toFixed(1) : '4.9'}
                    </span>
                  </div>
                )}
                <h3 className={`text-white font-bold font-heading ${i === 0 ? 'text-2xl lg:text-3xl' : 'text-base'}`}>
                  {dest.name}, {dest.country}
                </h3>
                {i === 0 && (
                  <p className="text-white/60 text-sm mt-1 line-clamp-2">{dest.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity List when city selected */}
      {selectedCity && viewMode === 'activities' && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-[#0b1c30] font-heading">Activities in {selectedCity}</h2>
            <button onClick={() => { setSelectedCity(''); setViewMode('cities'); }} className="text-sm text-[#94a3b8] hover:text-[#64748B]">Clear</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="card p-4 flex gap-4 card-interactive">
                <img src={activity.image} alt={activity.name} className="w-24 h-20 rounded-xl object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-[#0b1c30] text-sm">{activity.name}</h3>
                      <p className="text-xs text-[#94a3b8] mt-0.5">{activity.destination} · {activity.type}</p>
                    </div>
                    <button className="p-2 rounded-xl bg-[#E8604C]/8 text-[#E8604C] hover:bg-[#E8604C]/15 transition-colors flex-shrink-0">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-[#94a3b8]">
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{activity.cost}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{activity.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
