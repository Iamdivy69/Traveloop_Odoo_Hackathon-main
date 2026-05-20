import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/authStore';
import { destinations } from '../data/destinations';
import {
  ArrowRight,
  TrendingUp,
  Compass,
  Heart,
  Plane,
  MoreHorizontal,
  Users,
} from 'lucide-react';
import { useState, useMemo } from 'react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { trips } = useStore();
  const { user } = useAuthStore();
  const [searchQuery] = useState('');

  const upcomingTrips = trips.filter((t) => t.status === 'upcoming');
  const ongoingTrips = trips.filter((t) => t.status === 'ongoing');
  const completedTrips = trips.filter((t) => t.status === 'completed');
  const activeTrip = [...ongoingTrips, ...upcomingTrips][0];
  
  // Real-time countries visited based on unique destinations from completed/ongoing trips
  const uniqueCountries = useMemo(() => {
    const dests = trips.filter(t => t.status !== 'upcoming').map(t => {
      // Very simple extraction: if destination is "Paris, France", returns "France"
      const parts = t.destination.split(', ');
      return parts[parts.length - 1];
    });
    return new Set(dests).size || 0;
  }, [trips]);

  const filteredDestinations = useMemo(() => {
    if (!searchQuery) return destinations;
    const q = searchQuery.toLowerCase();
    return destinations.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.country.toLowerCase().includes(q) ||
        d.activities.some((a) => a.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="page-transition">
      {/* ── Welcome Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading">
            Welcome back, {user?.first_name || 'Alex'}!
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Your intelligent concierge is ready to help you explore.
          </p>
        </div>
        <button
          onClick={() => navigate('/trips/new')}
          className="btn-primary self-start"
        >
          <Plane className="w-4 h-4" />
          Plan a New Trip
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left Column (2/3) ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Planning Card */}
          {activeTrip ? (
            <div>
              <h2 className="text-h4 font-heading font-bold text-[#0b1c30] mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E8604C]" />
                Continue Planning
              </h2>
              <div className="card overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-56 h-44 sm:h-auto flex-shrink-0 relative">
                    <img src={activeTrip.coverImage} alt={activeTrip.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className={`badge ${activeTrip.status === 'ongoing' ? 'badge-coral' : 'badge-warning'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {activeTrip.status === 'ongoing' ? 'In Progress' : 'Upcoming'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-[#0b1c30] font-heading">{activeTrip.name}</h3>
                        <p className="text-sm text-[#64748B] mt-0.5">
                          {activeTrip.startDate} - {activeTrip.endDate} • {activeTrip.sections?.length || 6} Days
                        </p>
                      </div>
                      <button className="p-1.5 rounded-lg hover:bg-[#f1f5f9] text-[#94a3b8] transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Flight route */}
                    <div className="flex items-center gap-3 mt-4 text-sm text-[#64748B]">
                      <div className="flex items-center gap-1.5">
                        <Plane className="w-4 h-4 rotate-[-45deg] text-[#E8604C]" />
                        <span className="font-medium text-[#0b1c30]">JFK</span>
                      </div>
                      <div className="flex-1 border-t border-dashed border-[#e2e8f0] relative">
                        <Plane className="w-3 h-3 text-[#94a3b8] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Plane className="w-4 h-4 rotate-[135deg] text-[#001b26]" />
                        <span className="font-medium text-[#0b1c30]">CDG</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-5">
                      <div className="flex -space-x-2">
                        <div className="w-7 h-7 rounded-full bg-[#E8604C] flex items-center justify-center text-white text-[10px] font-bold border-2 border-white">
                          {user?.first_name?.[0] || 'A'}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#001b26] flex items-center justify-center text-white text-[10px] font-bold border-2 border-white">+2</div>
                      </div>
                      <button 
                        onClick={() => navigate('/itinerary/view')}
                        className="text-sm font-heading font-semibold text-[#E8604C] hover:text-[#ae311e] flex items-center gap-1 transition-colors"
                      >
                        Resume Planning <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Compass className="w-12 h-12 text-[#e2e8f0] mx-auto mb-3" />
              <p className="text-[#64748B] mb-4">No trips planned yet. Start your journey!</p>
              <button onClick={() => navigate('/trips/new')} className="btn-primary">
                Plan Your First Trip
              </button>
            </div>
          )}

          {/* Past Trips Section */}
          {completedTrips.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3 mt-8">
                <h2 className="text-h4 font-heading font-bold text-[#0b1c30]">Past Trips</h2>
                <button
                  onClick={() => navigate('/trips')}
                  className="text-sm text-[#64748B] hover:text-[#0b1c30] font-medium flex items-center gap-1 transition-colors"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {completedTrips.slice(0, 2).map((trip) => (
                  <div 
                    key={trip.id}
                    onClick={() => navigate('/itinerary/view')}
                    className="card p-4 flex items-center gap-4 cursor-pointer hover:border-[#e2e8f0] transition-colors"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#f1f5f9]">
                      <img src={trip.coverImage || '/images/dest-paris.jpg'} alt={trip.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0b1c30]">{trip.name}</h3>
                      <p className="text-xs text-[#64748B] mt-0.5">{trip.startDate}</p>
                      <span className="inline-block mt-1 badge badge-success px-2 py-0.5 text-[10px]">Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Destinations */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-h4 font-heading font-bold text-[#0b1c30]">Recommended for You</h2>
              <button
                onClick={() => navigate('/search')}
                className="text-sm text-[#64748B] hover:text-[#0b1c30] font-medium flex items-center gap-1 transition-colors"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredDestinations.slice(0, 3).map((dest) => (
                <div
                  key={dest.id}
                  onClick={() => navigate('/trips/new')}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5] text-left cursor-pointer"
                >
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  
                  {/* Save Button */}
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#64748B] hover:text-[#E8604C] transition-colors z-10">
                    <Heart className="w-4 h-4" />
                  </button>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-bold text-base font-heading">{dest.name},</h3>
                      <span className="text-white/80 text-sm">{dest.country}</span>
                    </div>
                    <p className="text-white/60 text-xs">{dest.activities.slice(0, 3).join(' • ')}</p>
                    {dest.costIndex && (
                      <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-medium">
                        <TrendingUp className="w-3 h-3" />
                        {dest.costIndex}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column (1/3) ── */}
        <div className="space-y-6">
          {/* Traveler Status Card */}
          <div className="rounded-2xl bg-gradient-to-br from-[#001b26] to-[#0d313f] p-5 text-white">
            <p className="text-overline text-white/50 uppercase mb-3">Traveler Status</p>
            <p className="stat-value font-heading">
              {uniqueCountries}
              <span className="text-base font-normal text-white/60 ml-2">Countries Visited</span>
            </p>
            <div className="mt-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#E8604C] rounded-full transition-all duration-1000" style={{ width: `${Math.min((uniqueCountries / 10) * 100, 100)}%` }} />
            </div>
            <p className="text-xs text-white/40 mt-2">{Math.max(10 - uniqueCountries, 0)} more countries to reach Gold Explorer</p>
          </div>

          {/* Community Highlights */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#E8604C]" />
              <h3 className="text-lg font-bold text-[#0b1c30] font-heading">Community Highlights</h3>
            </div>

            <div className="space-y-4">
              {[
                { title: '7 Days in Reykjavik: A Winter Guide', author: 'Mark T.', saves: '2k', tags: ['Nature', 'Winter'] },
                { title: 'Hidden Gems of the Amalfi Coast', author: 'Sarah W.', saves: '1.5k', tags: ['Coastal', 'Food'] },
              ].map((post, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f1f5f9] flex items-center justify-center text-[#64748B] font-bold text-xs flex-shrink-0">
                    {post.author[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0b1c30] leading-tight">{post.title}</p>
                    <p className="text-xs text-[#94a3b8] mt-0.5">by {post.author} • {post.saves} saves</p>
                    <div className="flex gap-1.5 mt-1.5">
                      {post.tags.map((tag) => (
                        <span key={tag} className="badge badge-primary text-[10px]">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/community')}
              className="w-full mt-4 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-medium text-[#64748B] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-all"
            >
              Explore Community
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
