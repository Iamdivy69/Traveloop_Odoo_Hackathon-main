import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plane,
  Compass,
  MapPin,
  ArrowRight,
  Heart,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  Star,
  Wallet,
  Plus,
  ChevronRight,
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard';
import type { Trip } from '../hooks/useTrips';
import type { City } from '../hooks/useCities';
import type { CommunityPost } from '../hooks/useCommunity';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function formatDateRange(start?: string, end?: string): string {
  if (!start) return '—';
  const fmt = (s: string) =>
    new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

function daysUntil(date?: string): number | null {
  if (!date) return null;
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function daysElapsed(start?: string): number {
  if (!start) return 0;
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(start).getTime()) / (1000 * 60 * 60 * 24))
  );
}

function totalDays(start?: string, end?: string): number {
  if (!start || !end) return 0;
  return Math.max(
    1,
    Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
    )
  );
}

function initials(firstName?: string, lastName?: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase() || '?';
}

function authorName(post: CommunityPost): string {
  const { first_name, last_name, username } = post.user;
  return username ? `@${username}` : `${first_name} ${last_name}`;
}

function avatarColor(id: string): string {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-rose-500 to-pink-600',
  ];
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

// ─────────────────────────────────────────────
// Skeleton components
// ─────────────────────────────────────────────

const shimmer =
  'bg-gradient-to-r from-[#f1f5f9] via-[#e2e8f0] to-[#f1f5f9] bg-[length:200%_100%] animate-[shimmer_1.4s_ease-in-out_infinite]';

function SkeletonLine({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) {
  return <div className={`${shimmer} ${w} ${h} rounded-lg`} />;
}

function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`card p-5 space-y-3 ${className}`}>
      <SkeletonLine w="w-3/5" h="h-5" />
      <SkeletonLine w="w-full" h="h-3" />
      <SkeletonLine w="w-4/5" h="h-3" />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero */}
      <div className="rounded-3xl bg-gradient-to-br from-[#001b26] to-[#0d313f] p-8 space-y-4">
        <div className={`${shimmer} h-8 w-72 rounded-xl opacity-30`} />
        <div className={`${shimmer} h-5 w-96 rounded-xl opacity-20`} />
        <div className="flex gap-3 pt-2">
          <div className={`${shimmer} h-11 w-40 rounded-xl opacity-20`} />
          <div className={`${shimmer} h-11 w-48 rounded-xl opacity-20`} />
        </div>
      </div>

      {/* Active trip */}
      <div className="card overflow-hidden flex flex-col sm:flex-row">
        <div className={`${shimmer} sm:w-56 h-48 flex-shrink-0`} />
        <div className="flex-1 p-6 space-y-4">
          <SkeletonLine w="w-2/3" h="h-6" />
          <SkeletonLine w="w-1/2" h="h-4" />
          <div className={`${shimmer} h-2 w-full rounded-full`} />
          <div className="flex gap-4">
            <SkeletonLine w="w-1/4" h="h-4" />
            <SkeletonLine w="w-1/4" h="h-4" />
          </div>
        </div>
      </div>

      {/* Upcoming trips */}
      <div className="flex gap-4 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`${shimmer} flex-shrink-0 w-52 h-40 rounded-2xl`} />
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${shimmer} h-48 rounded-2xl`} />
        ))}
      </div>

      {/* Community */}
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Section container with staggered animation
// ─────────────────────────────────────────────

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' as const },
  }),
};

function Section({
  index,
  children,
  className = '',
}: {
  index: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      custom={index}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Section header row
// ─────────────────────────────────────────────

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-h4 font-heading font-bold text-[#0b1c30]">{title}</h2>
      {action && (
        <button
          onClick={onAction}
          className="text-sm font-semibold text-[#64748B] hover:text-[#0b1c30] flex items-center gap-1 transition-colors"
        >
          {action} <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// A — Hero Section
// ─────────────────────────────────────────────

function HeroSection({
  firstName,
}: {
  firstName: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#001b26] via-[#0d313f] to-[#003344] p-7 sm:p-10 text-white">
      {/* Decorative blobs */}
      <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-[#E8604C]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-8 left-16 w-40 h-40 rounded-full bg-[#18a5a5]/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <p className="text-overline text-white/50 mb-2 uppercase tracking-widest text-xs">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white leading-tight">
            {getGreeting()}, <span className="text-[#E8604C]">{firstName}</span>!
          </h1>
          <p className="mt-2 text-white/60 text-sm sm:text-base max-w-md">
            Ready to plan your next adventure? The world is waiting for you.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            id="dashboard-plan-trip-btn"
            onClick={() => navigate('/trips/new')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E8604C] hover:bg-[#ae311e] text-white font-heading font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Plan New Trip
          </button>
          <button
            id="dashboard-explore-btn"
            onClick={() => navigate('/search-cities')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-heading font-semibold text-sm transition-all duration-200 border border-white/15"
          >
            <Compass className="w-4 h-4" />
            Explore Destinations
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// B — Active Trip Card
// ─────────────────────────────────────────────

function ActiveTripCard({ trip }: { trip: Trip }) {
  const navigate = useNavigate();
  const elapsed = daysElapsed(trip.start_date);
  const total = totalDays(trip.start_date, trip.end_date);
  const progress = total > 0 ? Math.min((elapsed / total) * 100, 100) : 0;
  const stopsLeft = trip._count?.stops ?? 0;
  const budget = trip.total_budget;

  return (
    <div className="card overflow-hidden border-l-4 border-l-[#E8604C]">
      <div className="flex flex-col sm:flex-row">
        {/* Cover image */}
        <div className="sm:w-56 h-48 sm:h-auto flex-shrink-0 relative bg-[#f1f5f9]">
          {trip.cover_photo_url ? (
            <img
              src={trip.cover_photo_url}
              alt={trip.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#001b26] to-[#0d313f] flex items-center justify-center">
              <Plane className="w-12 h-12 text-white/20" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="badge badge-coral flex items-center gap-1 shadow">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E8604C] animate-pulse" />
              Active
            </span>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xl font-heading font-bold text-[#0b1c30] leading-tight">
                  {trip.name}
                </h3>
                <p className="text-sm text-[#64748B] mt-1">
                  {formatDateRange(trip.start_date, trip.end_date)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-[#94a3b8] mb-1.5">
                <span>Day {elapsed} of {total}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#E8604C] to-[#ae311e] rounded-full transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex gap-6 mt-4">
              <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
                <MapPin className="w-4 h-4 text-[#E8604C]" />
                <span className="font-semibold text-[#0b1c30]">{stopsLeft}</span>
                <span>stops</span>
              </div>
              {budget != null && (
                <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
                  <Wallet className="w-4 h-4 text-[#18a5a5]" />
                  <span className="font-semibold text-[#0b1c30]">
                    ${budget.toLocaleString()}
                  </span>
                  <span>budget</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              id="dashboard-continue-planning-btn"
              onClick={() => navigate(`/itinerary/build/${trip.id}`)}
              className="btn-primary text-sm"
            >
              Continue Planning <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoActiveTrip() {
  const navigate = useNavigate();
  return (
    <div className="card p-10 text-center flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-[#f1f5f9] flex items-center justify-center">
        <Compass className="w-8 h-8 text-[#94a3b8]" />
      </div>
      <div>
        <h3 className="font-heading font-bold text-[#0b1c30] text-lg">No active trip</h3>
        <p className="text-[#64748B] text-sm mt-1">Start planning your next adventure!</p>
      </div>
      <button
        id="dashboard-first-trip-btn"
        onClick={() => navigate('/trips/new')}
        className="btn-primary"
      >
        <Plus className="w-4 h-4" />
        Plan Your First Trip
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// C — Upcoming Trips (horizontal scroll)
// ─────────────────────────────────────────────

function UpcomingTripCard({ trip }: { trip: Trip }) {
  const navigate = useNavigate();
  const countdown = daysUntil(trip.start_date);

  return (
    <div
      id={`dashboard-upcoming-trip-${trip.id}`}
      onClick={() => navigate(`/itinerary/build/${trip.id}`)}
      className="group flex-shrink-0 w-52 rounded-2xl overflow-hidden cursor-pointer bg-[#f8fafc] border border-[#e2e8f0] hover:border-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-32 bg-gradient-to-br from-[#001b26] to-[#0d313f]">
        {trip.cover_photo_url ? (
          <img
            src={trip.cover_photo_url}
            alt={trip.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Plane className="w-10 h-10 text-white/20" />
          </div>
        )}
        {countdown != null && (
          <div className="absolute top-2 right-2">
            <span className="badge badge-warning shadow text-[10px]">
              <Clock className="w-3 h-3" />
              {countdown > 0 ? `${countdown}d` : 'Today!'}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-heading font-bold text-[#0b1c30] truncate">{trip.name}</h3>
        <p className="text-xs text-[#94a3b8] mt-0.5">{formatDateRange(trip.start_date, trip.end_date)}</p>
        <div className="flex items-center gap-1 mt-2 text-xs text-[#64748B]">
          <MapPin className="w-3 h-3" />
          <span>{trip._count?.stops ?? 0} stops</span>
        </div>
      </div>
    </div>
  );
}

function UpcomingTripsSection({ trips }: { trips: Trip[] }) {
  const navigate = useNavigate();

  if (trips.length === 0) {
    return (
      <div className="card p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-[#f1f5f9] flex items-center justify-center flex-shrink-0">
          <Calendar className="w-6 h-6 text-[#94a3b8]" />
        </div>
        <div>
          <p className="font-semibold text-[#0b1c30] text-sm">No upcoming trips</p>
          <p className="text-xs text-[#64748B] mt-0.5">Plan something exciting to look forward to!</p>
        </div>
        <button onClick={() => navigate('/trips/new')} className="btn-secondary ml-auto text-sm">
          <Plus className="w-4 h-4" /> New Trip
        </button>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="Upcoming Trips" action="View All" onAction={() => navigate('/trips')} />
      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
        {trips.map((trip) => (
          <UpcomingTripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// D — Popular Destinations (4-card grid)
// ─────────────────────────────────────────────

function CityCard({ city }: { city: City }) {
  const navigate = useNavigate();

  return (
    <div
      id={`dashboard-city-${city.id}`}
      onClick={() => navigate('/search-cities')}
      className="group relative rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer"
    >
      {city.image_url ? (
        <img
          src={city.image_url}
          alt={city.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-[#001b26] to-[#003344]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

      {/* Popularity badge */}
      <div className="absolute top-3 right-3">
        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-[#0b1c30]">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          Popular
        </span>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-white font-heading font-bold text-base leading-tight">{city.name}</h3>
        <p className="text-white/70 text-xs mt-0.5">{city.country}</p>
        <div className="flex items-center gap-1 mt-2 text-white/60 text-xs">
          <TrendingUp className="w-3 h-3" />
          <span>{city._count?.activities ?? 0} activities</span>
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 ring-2 ring-[#E8604C] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
}

function PopularDestinationsSection({ cities }: { cities: City[] }) {
  const navigate = useNavigate();

  if (cities.length === 0) return null;

  return (
    <div>
      <SectionHeader
        title="Popular Destinations"
        action="Explore All"
        onAction={() => navigate('/search-cities')}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cities.map((city) => (
          <CityCard key={city.id} city={city} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// E — Community Highlights
// ─────────────────────────────────────────────

function CommunityPostCard({ post }: { post: CommunityPost }) {
  const navigate = useNavigate();
  const colorClass = avatarColor(post.user.id);

  return (
    <div
      id={`dashboard-community-post-${post.id}`}
      onClick={() => navigate('/community')}
      className="card p-4 cursor-pointer hover:border-[#E8604C]/30 transition-colors flex items-start gap-3"
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
      >
        {post.user.photo_url ? (
          <img
            src={post.user.photo_url}
            alt={authorName(post)}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials(post.user.first_name, post.user.last_name)
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-semibold text-[#0b1c30] truncate">{authorName(post)}</p>
          <span className="text-xs text-[#94a3b8] flex-shrink-0">
            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        <p className="text-sm text-[#64748B] mt-0.5 line-clamp-2 leading-relaxed">
          {post.content}
        </p>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-[#94a3b8]">
          <Heart className="w-3 h-3" />
          <span>{post.likes} likes</span>
          {post.trip && (
            <>
              <span className="mx-1">·</span>
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{post.trip.name}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CommunityHighlightsSection({ posts }: { posts: CommunityPost[] }) {
  const navigate = useNavigate();

  return (
    <div>
      <SectionHeader
        title="Community Highlights"
        action="Join the Community"
        onAction={() => navigate('/community')}
      />
      {posts.length === 0 ? (
        <div className="card p-8 text-center">
          <Users className="w-10 h-10 text-[#e2e8f0] mx-auto mb-3" />
          <p className="text-[#64748B] text-sm">No community posts yet. Be the first to share!</p>
          <button
            onClick={() => navigate('/community')}
            className="btn-secondary mt-4 text-sm"
          >
            Go to Community
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <CommunityPostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// F — Recent Trips (past 2)
// ─────────────────────────────────────────────

function RecentTripCard({ trip }: { trip: Trip }) {
  const navigate = useNavigate();

  return (
    <div
      id={`dashboard-recent-trip-${trip.id}`}
      onClick={() => navigate(`/itinerary/build/${trip.id}`)}
      className="card-interactive card overflow-hidden cursor-pointer"
    >
      <div className="relative h-36 bg-gradient-to-br from-[#001b26] to-[#0d313f]">
        {trip.cover_photo_url ? (
          <img
            src={trip.cover_photo_url}
            alt={trip.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Plane className="w-10 h-10 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-heading font-bold text-base leading-tight truncate">
            {trip.name}
          </h3>
          <p className="text-white/70 text-xs mt-0.5">
            {formatDateRange(trip.start_date, trip.end_date)}
          </p>
        </div>
        <div className="absolute top-3 right-3">
          <span className="badge badge-success text-[10px]">Completed</span>
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
          <MapPin className="w-4 h-4 text-[#18a5a5]" />
          <span>{trip._count?.stops ?? 0} stops visited</span>
        </div>
        {trip._count?.expenses != null && (
          <div className="flex items-center gap-1.5 text-sm text-[#64748B]">
            <Wallet className="w-4 h-4 text-[#E8604C]" />
            <span>{trip._count.expenses} expenses</span>
          </div>
        )}
      </div>
    </div>
  );
}

function RecentTripsSection({ trips }: { trips: Trip[] }) {
  const navigate = useNavigate();

  if (trips.length === 0) return null;

  return (
    <div>
      <SectionHeader title="Recent Trips" action="View All" onAction={() => navigate('/trips')} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {trips.map((trip) => (
          <RecentTripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────

export default function Dashboard() {
  const {
    activeTrip,
    upcomingTrips,
    recentTrips,
    popularCities,
    communityHighlights,
    profile,
    isLoading,
  } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const firstName = profile?.first_name ?? 'Explorer';

  return (
    <div className="space-y-8">
      {/* A — Hero */}
      <Section index={0}>
        <HeroSection firstName={firstName} />
      </Section>

      {/* B — Active Trip */}
      <Section index={1}>
        <div>
          <SectionHeader title="Currently Travelling" />
          {activeTrip ? <ActiveTripCard trip={activeTrip} /> : <NoActiveTrip />}
        </div>
      </Section>

      {/* C — Upcoming Trips */}
      <Section index={2}>
        <UpcomingTripsSection trips={upcomingTrips} />
      </Section>

      {/* D — Popular Destinations */}
      <Section index={3}>
        <PopularDestinationsSection cities={popularCities} />
      </Section>

      {/* E — Community Highlights */}
      <Section index={4}>
        <CommunityHighlightsSection posts={communityHighlights} />
      </Section>

      {/* F — Recent Trips */}
      {recentTrips.length > 0 && (
        <Section index={5}>
          <RecentTripsSection trips={recentTrips} />
        </Section>
      )}
    </div>
  );
}
