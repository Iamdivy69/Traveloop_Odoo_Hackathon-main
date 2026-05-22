import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, SlidersHorizontal, Star, TrendingDown, ArrowUpAZ, Globe, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCities, useCity, type City, type CityFilters } from '../hooks/useCities';
import CityDetailDrawer from '../components/cities/CityDetailDrawer';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular', icon: Star },
  { value: 'cost', label: 'Lowest Cost', icon: TrendingDown },
  { value: 'name', label: 'A–Z', icon: ArrowUpAZ },
] as const;

function CostBadge({ cost }: { cost: number }) {
  const level = Math.min(5, Math.ceil(cost / 500));
  return (
    <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
      {'₹'.repeat(level)}
      <span className="text-slate-300">{'₹'.repeat(5 - level)}</span>
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-slate-200 rounded w-3/4" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
        <div className="h-8 bg-slate-200 rounded-lg w-full mt-4" />
      </div>
    </div>
  );
}

function CityCard({ city, onClick }: { city: City; onClick: () => void }) {
  const fallbackImg = `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      onClick={onClick}
      className="card-interactive overflow-hidden flex flex-col h-full group cursor-pointer"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={city.image_url || fallbackImg}
          alt={city.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <h3 className="text-white font-bold font-heading text-lg leading-tight drop-shadow">{city.name}</h3>
            <p className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />{city.country}{city.region ? `, ${city.region}` : ''}
            </p>
          </div>
          <span className="bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            {city.popularity_score}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {city.description && (
          <p className="text-sm text-slate-500 line-clamp-2 flex-1 mb-3">{city.description}</p>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Cost Index</span>
            <CostBadge cost={Number(city.cost_index)} />
          </div>
          <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">
            {city._count?.activities ?? 0} activities
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function CitySearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [sort, setSort] = useState<CityFilters['sort']>('popularity');
  const [page, setPage] = useState(1);

  // Debounce search 400ms
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const filters: CityFilters = {
    q: debouncedQuery || undefined,
    sort,
    page,
    limit: 12,
  };

  const { data, isLoading, isError } = useCities(filters);
  const { data: cityDetail } = useCity(selectedCity);

  const handleSort = useCallback((val: CityFilters['sort']) => {
    setSort(val);
    setPage(1);
  }, []);

  return (
    <div className="page-transition max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-1">Destinations</p>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading">Explore Cities</h1>
        <p className="text-slate-500 text-sm mt-1.5">
          Discover destinations, browse activities, and add them to your trips.
        </p>
      </div>

      {/* Search & Sort Bar */}
      <div className="card p-4 mb-8 sticky top-4 z-10 shadow-md">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="city-search"
              type="text"
              placeholder="Search cities, countries, or regions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-[#E8604C] focus:ring-1 focus:ring-[#E8604C] outline-none text-sm transition-all"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <div className="flex gap-1.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSort(opt.value)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    sort === opt.value
                      ? 'bg-[#E8604C] text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-500 hover:border-[#E8604C]/40'
                  }`}
                >
                  <opt.icon className="w-3 h-3" />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isError ? (
        <div className="text-center py-20 card">
          <Globe className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 font-heading">Failed to load cities</h3>
          <p className="text-slate-400 text-sm mt-1">Please check your connection and try again.</p>
        </div>
      ) : !data?.items.length ? (
        <div className="text-center py-20 card">
          <Globe className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#0b1c30] font-heading">No destinations found</h3>
          <p className="text-slate-400 text-sm mt-1">Try a different search or adjust filters.</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              {data.total} destination{data.total !== 1 ? 's' : ''} found
            </p>
          </div>
          <AnimatePresence mode="popLayout">
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.items.map((city) => (
                <CityCard
                  key={city.id}
                  city={city}
                  onClick={() => setSelectedCity(city.id)}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-40 hover:border-[#E8604C] transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">Page {page} of {data.totalPages}</span>
              <button
                disabled={!data.hasNext}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium disabled:opacity-40 hover:border-[#E8604C] transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* City Detail Drawer */}
      <CityDetailDrawer
        city={cityDetail ?? null}
        open={!!selectedCity}
        onClose={() => setSelectedCity(null)}
      />
    </div>
  );
}
