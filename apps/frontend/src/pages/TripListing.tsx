import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Calendar, DollarSign, Share2, Trash2, Eye, Plus,
  Globe, Lock, MapPin, ChevronRight, Loader2, AlertTriangle, X,
  Facebook, Twitter, Linkedin, Link as LinkIcon, ClipboardList,
  Plane, Clock, MoreHorizontal,
} from 'lucide-react';
import { useTrips, useDeleteTrip, type Trip, type TripFilters } from '../hooks/useTrips';


type TabStatus = 'all' | 'upcoming' | 'active' | 'past' | 'draft';

const TABS: { key: TabStatus; label: string }[] = [
  { key: 'all', label: 'All Trips' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'active', label: 'Active' },
  { key: 'past', label: 'Past' },
  { key: 'draft', label: 'Drafts' },
];

const EMPTY_MESSAGES: Record<TabStatus, { icon: React.ReactNode; title: string; subtitle: string }> = {
  all: { icon: <Plane className="w-10 h-10 text-[#e2e8f0]" />, title: 'No trips yet', subtitle: "Your adventures start here. Plan your first trip!" },
  upcoming: { icon: <Calendar className="w-10 h-10 text-[#e2e8f0]" />, title: 'No upcoming trips', subtitle: "Nothing on the horizon yet. Start planning!" },
  active: { icon: <Clock className="w-10 h-10 text-[#e2e8f0]" />, title: "You're not travelling right now", subtitle: "Trips that are currently in progress will appear here." },
  past: { icon: <MapPin className="w-10 h-10 text-[#e2e8f0]" />, title: 'No past trips', subtitle: "Completed adventures will be archived here." },
  draft: { icon: <ClipboardList className="w-10 h-10 text-[#e2e8f0]" />, title: 'No drafts', subtitle: "Trips without dates are saved as drafts." },
};

const TRIP_GRADIENTS = [
  'from-[#E8604C] to-[#f59e0b]',
  'from-[#3b82f6] to-[#8b5cf6]',
  'from-[#059669] to-[#0ea5e9]',
  'from-[#ec4899] to-[#f43f5e]',
  'from-[#f59e0b] to-[#ef4444]',
  'from-[#6366f1] to-[#a855f7]',
];

function tripGradient(id: string) {
  const idx = id.charCodeAt(0) % TRIP_GRADIENTS.length;
  return TRIP_GRADIENTS[idx];
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function TripCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-[#f1f5f9] overflow-hidden animate-pulse">
      <div className="h-44 bg-[#f1f5f9]" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-[#f1f5f9] rounded-lg w-3/4" />
        <div className="h-3 bg-[#f1f5f9] rounded-lg w-1/2" />
        <div className="h-3 bg-[#f1f5f9] rounded-lg w-2/3" />
        <div className="h-9 bg-[#f1f5f9] rounded-xl mt-4" />
      </div>
    </div>
  );
}

function TripStatusBadge({ trip }: { trip: Trip }) {
  const now = new Date();
  const start = trip.start_date ? new Date(trip.start_date) : null;
  const end = trip.end_date ? new Date(trip.end_date) : null;

  if (!start) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f1f5f9] text-[#64748B]">Draft</span>;
  if (end && end < now) return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f0fdf4] text-[#16a34a]">Completed</span>;
  if (start <= now && end && end >= now) return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E8604C] text-white"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />Active</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#eff6ff] text-[#2563eb]">Upcoming</span>;
}

export default function TripListing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabStatus>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [shareTrip, setShareTrip] = useState<Trip | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const deleteTrip = useDeleteTrip();

  // Debounce search
  const debounceRef = useState<ReturnType<typeof setTimeout>>(null!)[0];
  const handleSearchChange = useCallback((val: string) => {
    setSearch(val);
    clearTimeout(debounceRef);
    const t = setTimeout(() => { setDebouncedSearch(val); setPage(1); }, 400);
    // @ts-ignore store ref
    (handleSearchChange as any)._t = t;
  }, []);

  const filters: TripFilters = {
    ...(activeTab !== 'all' && { status: activeTab }),
    ...(debouncedSearch && { search: debouncedSearch }),
    page,
    limit: 8,
  };

  const { data, isLoading, isError } = useTrips(filters);
  const trips = data?.items ?? [];
  const hasNext = data?.hasNext ?? false;

  const handleTabChange = (tab: TabStatus) => {
    setActiveTab(tab);
    setPage(1);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteTrip.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const handleShare = (platform: string, trip: Trip) => {
    const url = `${window.location.origin}/shared/${trip.share_token}`;
    const text = `Check out my trip: ${trip.name} on Traveloop!`;
    if (platform === 'copy') { navigator.clipboard.writeText(url); }
    else if (platform === 'twitter') window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`);
    else if (platform === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
    else if (platform === 'linkedin') window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(trip.name)}`);
  };

  const emptyState = EMPTY_MESSAGES[activeTab];

  return (
    <div className="page-transition">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading">My Trips</h1>
          <p className="text-[#64748B] text-sm mt-1">
            {data ? `${data.total} trip${data.total !== 1 ? 's' : ''} in total` : 'Manage your adventures'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              id="trip-search"
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search trips…"
              className="pl-9 pr-4 py-2.5 text-sm w-52 bg-white border border-[#e2e8f0] rounded-xl text-[#0b1c30] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#E8604C]/30 focus:border-[#E8604C] transition-all"
            />
          </div>
          <button
            id="new-trip-btn"
            onClick={() => navigate('/trips/new')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#E8604C] text-white text-sm font-semibold rounded-xl hover:bg-[#d44e3b] transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" /> New Trip
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            onClick={() => handleTabChange(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-[#001b26] text-white shadow-sm'
                : 'bg-white text-[#64748B] border border-[#e2e8f0] hover:bg-[#f1f5f9] hover:text-[#0b1c30]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Trip Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <TripCardSkeleton />
          <TripCardSkeleton />
          <TripCardSkeleton />
        </div>
      ) : isError ? (
        <div className="card p-12 text-center">
          <AlertTriangle className="w-10 h-10 text-[#E8604C] mx-auto mb-3" />
          <p className="text-[#64748B]">Failed to load trips. Please try again.</p>
        </div>
      ) : trips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-14 text-center"
        >
          <div className="mx-auto mb-4">{emptyState.icon}</div>
          <h3 className="font-bold text-[#0b1c30] text-lg mb-1">{emptyState.title}</h3>
          <p className="text-[#64748B] text-sm mb-6">{emptyState.subtitle}</p>
          {activeTab !== 'past' && (
            <button onClick={() => navigate('/trips/new')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E8604C] text-white text-sm font-semibold rounded-xl hover:bg-[#d44e3b] transition-all">
              <Plus className="w-4 h-4" /> Plan a Trip
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {trips.map((trip, i) => (
                <motion.div
                  key={trip.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white rounded-2xl border border-[#f1f5f9] overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Cover image / gradient */}
                  <div className="relative h-44 overflow-hidden flex-shrink-0">
                    {trip.cover_photo_url ? (
                      <img
                        src={trip.cover_photo_url}
                        alt={trip.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${tripGradient(trip.id)} flex items-center justify-center`}>
                        <MapPin className="w-10 h-10 text-white/40" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <TripStatusBadge trip={trip} />
                    </div>
                    {/* Action menu */}
                    <div className="absolute top-3 right-3">
                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === trip.id ? null : trip.id); }}
                          className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#64748B] hover:bg-white hover:text-[#0b1c30] transition-colors shadow-sm"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                          {openMenu === trip.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: -4 }}
                              className="absolute right-0 top-10 z-20 w-40 bg-white rounded-xl shadow-xl border border-[#f1f5f9] py-1 overflow-hidden"
                            >
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  import('../store/useStore').then(({ useStore }) => {
                                    useStore.getState().setActiveTrip(trip);
                                    navigate('/itinerary/view');
                                  });
                                  setOpenMenu(null); 
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#0b1c30] hover:bg-[#f8fafc] transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#64748B]" /> View
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); setShareTrip(trip); setOpenMenu(null); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#0b1c30] hover:bg-[#f8fafc] transition-colors"
                              >
                                <Share2 className="w-3.5 h-3.5 text-[#64748B]" /> Share
                              </button>
                              <div className="h-px bg-[#f1f5f9] my-1" />
                              <button
                                onClick={(e) => { e.stopPropagation(); setDeleteId(trip.id); setOpenMenu(null); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[#E8604C] hover:bg-[#fef2f2] transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    {trip.is_public && (
                      <div className="absolute bottom-3 right-3">
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-[10px] font-bold text-[#2563eb]">
                          <Globe className="w-2.5 h-2.5" /> Public
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-[#0b1c30] font-heading text-base leading-snug mb-2 line-clamp-1">
                      {trip.name}
                    </h3>

                    {/* Dates */}
                    {trip.start_date ? (
                      <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-3">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {formatDate(trip.start_date)}
                        {trip.end_date && <> → {formatDate(trip.end_date)}</>}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] italic mb-3">
                        <Calendar className="w-3.5 h-3.5" /> No dates set
                      </div>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-xs text-[#94a3b8] mt-auto mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {trip._count?.stops ?? 0} stop{(trip._count?.stops ?? 0) !== 1 ? 's' : ''}
                      </span>
                      {trip.total_budget && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {Number(trip.total_budget).toLocaleString('en-IN')}
                        </span>
                      )}
                      {trip.is_public
                        ? <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-[#2563eb]" /> Public</span>
                        : <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Private</span>
                      }
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => navigate(`/itinerary/build/${trip.id}`)}
                      className="w-full py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-semibold text-[#64748B] hover:bg-[#f8fafc] hover:text-[#0b1c30] hover:border-[#E8604C] transition-all flex items-center justify-center gap-1.5 group/btn"
                    >
                      Build Itinerary <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Load more */}
          {hasNext && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-6 py-2.5 bg-white border border-[#e2e8f0] text-sm font-semibold text-[#64748B] rounded-xl hover:bg-[#f8fafc] hover:text-[#0b1c30] transition-all"
              >
                Load more trips
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Modals ── */}


      {/* Delete confirm */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-[#001b26]/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteId(null)} />
            <motion.div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <div className="w-12 h-12 rounded-full bg-[#fef2f2] flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-[#E8604C]" />
              </div>
              <h3 className="text-lg font-bold text-[#0b1c30] font-heading mb-2">Delete Trip?</h3>
              <p className="text-sm text-[#64748B] mb-6">This will permanently delete the trip and all its stops, activities, and notes. This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-semibold text-[#64748B] hover:bg-[#f1f5f9] transition-all">Cancel</button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteTrip.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-[#E8604C] text-white text-sm font-semibold hover:bg-[#d44e3b] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                >
                  {deleteTrip.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting…</> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share modal */}
      <AnimatePresence>
        {shareTrip && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-[#001b26]/40 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShareTrip(null)} />
            <motion.div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
              <button onClick={() => setShareTrip(null)} className="absolute top-4 right-4 p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0b1c30] hover:bg-[#f1f5f9] transition-colors"><X className="w-4 h-4" /></button>
              <div className="w-12 h-12 rounded-full bg-[#f1f5f9] flex items-center justify-center mb-4"><Share2 className="w-6 h-6 text-[#0b1c30]" /></div>
              <h3 className="text-lg font-bold text-[#0b1c30] font-heading mb-1">Share "{shareTrip.name}"</h3>
              <p className="text-sm text-[#64748B] mb-5">Share your itinerary with friends and family.</p>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { key: 'copy', icon: <LinkIcon className="w-5 h-5" />, label: 'Copy', bg: 'border-[#e2e8f0] text-[#64748B] hover:bg-[#f1f5f9]' },
                  { key: 'facebook', icon: <Facebook className="w-5 h-5" />, label: 'Facebook', bg: 'bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white' },
                  { key: 'twitter', icon: <Twitter className="w-5 h-5" />, label: 'X', bg: 'bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white' },
                  { key: 'linkedin', icon: <Linkedin className="w-5 h-5" />, label: 'LinkedIn', bg: 'bg-[#0A66C2]/10 text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white' },
                ].map(({ key, icon, label, bg }) => (
                  <button key={key} onClick={() => handleShare(key, shareTrip)} className="flex flex-col items-center gap-1.5 group">
                    <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${bg}`}>{icon}</div>
                    <span className="text-[10px] font-semibold text-[#64748B]">{label}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 p-2.5 bg-[#f8fafc] rounded-xl border border-[#f1f5f9]">
                <span className="truncate text-xs text-[#64748B] flex-1 font-mono">{`${window.location.origin}/shared/${shareTrip.share_token}`}</span>
                <button onClick={() => handleShare('copy', shareTrip)} className="text-xs font-bold text-[#E8604C] hover:text-[#d44e3b] shrink-0 transition-colors">Copy</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Click-outside for action menus */}
      {openMenu && <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />}
    </div>
  );
}
