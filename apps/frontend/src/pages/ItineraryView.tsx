import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useTrip, useTripStats } from '../hooks/useTrips';
import PageLoader from '../components/ui/PageLoader';
import {
  MapPin,
  Calendar,
  DollarSign,
  Share2,
  Copy,
  Edit3,
  Receipt,
  StickyNote,
  Clock,
  ChevronDown,
} from 'lucide-react';

const COLORS = ['#001b26', '#E8604C', '#059669', '#d97706', '#6366f1', '#94a3b8'];

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'TBD';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ItineraryView() {
  const navigate = useNavigate();
  const { trips, activeTrip, setActiveTrip } = useStore();

  const { data: tripDetail, isLoading: detailLoading } = useTrip(activeTrip?.id || '');
  const { data: tripStats, isLoading: statsLoading } = useTripStats(activeTrip?.id || '');

  if (activeTrip && (detailLoading || statsLoading)) {
    return <PageLoader />;
  }

  const budget = (activeTrip as any)?.total_budget ? Number((activeTrip as any).total_budget) : 0;
  const spent = tripStats?.totalExpenses || 0;
  const remaining = budget - spent;

  const sections = tripDetail?.stops?.map((stop) => {
    const cost = stop.activities?.reduce((sum, sa) => {
      const saCost = sa.custom_cost !== null ? Number(sa.custom_cost) : (sa.activity ? Number(sa.activity.cost) : 0);
      return sum + saCost;
    }, 0) || 0;

    return {
      id: stop.id,
      title: stop.city?.name || stop.custom_city_name || 'Stop',
      budget: cost,
      description: `${stop.activities?.length || 0} activities planned`,
      dateRange: `${formatDate(stop.arrival_date)} - ${formatDate(stop.departure_date)}`,
    };
  }) || [];

  const budgetData = sections.length > 0 ? sections.map((s: any, i: number) => ({
    name: s.title,
    value: s.budget,
    color: COLORS[i % COLORS.length],
    percent: budget > 0 ? Math.round((s.budget / budget) * 100) : 0,
  })) : [];

  const destination = tripDetail?.stops?.[0]?.city?.name || tripDetail?.stops?.[0]?.custom_city_name || 'Multiple Destinations';
  const startDate = formatDate((activeTrip as any)?.start_date);
  const endDate = formatDate((activeTrip as any)?.end_date);
  const coverImage = (activeTrip as any)?.cover_photo_url || '';
  const status: string = 'upcoming'; // Basic fallback, we can use TripStatusBadge logic if needed

  return (
    <div className="page-transition">
      {/* Trip Switcher Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#E8604C] text-[10px] font-bold uppercase tracking-[0.2em]">
            <Clock className="w-3 h-3" />
            <span>Master Itinerary</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0b1c30] font-heading tracking-tight">Your Journeys</h1>
        </div>
        
        <div className="relative group min-w-[280px]">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#E8604C]">
            <MapPin className="w-4 h-4" />
          </div>
          <select
            value={activeTrip?.id || ''}
            onChange={(e) => {
              const trip = trips.find((t) => t.id === e.target.value);
              if (trip) setActiveTrip(trip);
            }}
            className="w-full appearance-none bg-white border border-[#e2e8f0] text-[#0b1c30] text-sm font-semibold rounded-2xl pl-11 pr-10 py-3 focus:outline-none focus:ring-4 focus:ring-[#E8604C]/10 focus:border-[#E8604C] transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            <option value="" disabled>Switch to another trip...</option>
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-[#94a3b8]">
            <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
          </div>
        </div>
      </div>

      {activeTrip ? (
        <>
          <div className="card overflow-hidden mb-8 group">
            <div className="relative h-48 sm:h-72">
              {coverImage ? (
                <img src={coverImage} alt={activeTrip.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#001b26] to-[#0d313f]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#001b26] via-[#001b26]/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`badge px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    status === 'ongoing' ? 'bg-[#E8604C] text-white shadow-lg shadow-[#E8604C]/30' :
                    status === 'upcoming' ? 'bg-[#059669] text-white shadow-lg shadow-[#059669]/20' : 'bg-white/20 text-white backdrop-blur-md'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1.5 inline-block" />
                    {status}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading tracking-tight mb-3">{activeTrip.name}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-white/70 text-sm">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{destination}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{startDate} - {endDate}</span>
              <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />₹{budget.toLocaleString()} budget</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 p-4 border-t border-[#f1f5f9]">
          <button onClick={() => navigate(`/itinerary/build/${activeTrip.id}`)} className="btn-ghost text-sm">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          <button className="btn-ghost text-sm">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
          <button className="btn-ghost text-sm">
            <Copy className="w-3.5 h-3.5" /> Copy Trip
          </button>
          <button onClick={() => navigate('/invoice')} className="btn-ghost text-sm ml-auto">
            <Receipt className="w-3.5 h-3.5" /> View Invoice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Itinerary Timeline */}
        <div className="lg:col-span-2 space-y-1">
          <h2 className="text-xl font-bold text-[#0b1c30] font-heading mb-4">Itinerary</h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-[#e2e8f0]" />
            
            <div className="space-y-4">
              {sections.map((section: any, index: number) => (
                <div key={section.id} className="relative flex gap-4">
                  {/* Timeline dot */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                      {index + 1}
                    </div>
                  </div>

                  <div className="card p-5 flex-1 card-interactive">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-[#0b1c30] font-heading">{section.title}</h3>
                      <span className="badge bg-[#f1f5f9] text-[#64748B]" style={{ color: COLORS[index % COLORS.length] }}>
                        ₹{section.budget.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-[#64748B] mt-1">{section.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-[#94a3b8]">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{section.dateRange}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Full day</span>
                    </div>
                  </div>
                </div>
              ))}
              {sections.length === 0 && (
                <div className="card p-12 text-center bg-[#f8fafc] border-dashed border-2 border-[#e2e8f0]">
                  <Calendar className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
                  <p className="text-[#64748B] text-sm font-medium">No sections added to this itinerary yet.</p>
                  <button onClick={() => navigate(`/itinerary/build/${activeTrip.id}`)} className="btn-primary mt-4 py-2 text-xs">
                    Start Building
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {tripDetail?.notes && (tripDetail.notes as any[]).length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-[#0b1c30] font-heading mb-4">Trip Notes</h2>
              <div className="space-y-3">
                {(tripDetail.notes as any[]).map((note) => (
                  <div key={note.id} className="card p-4 border-l-4 border-l-[#E8604C]">
                    <div className="flex items-center gap-2 mb-1">
                      <StickyNote className="w-4 h-4 text-[#E8604C]" />
                      <h4 className="font-semibold text-[#0b1c30] text-sm">{note.content}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Budget Sidebar */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="font-bold text-[#0b1c30] font-heading mb-4">Budget Breakdown</h3>
            
            {/* Mini donut */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {budgetData.reduce((acc, item, i) => {
                    const offset = acc.offset;
                    acc.elements.push(
                      <circle
                        key={i}
                        cx="18" cy="18" r="14"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="3.5"
                        strokeDasharray={`${item.percent * 0.88} ${88 - item.percent * 0.88}`}
                        strokeDashoffset={-offset * 0.88}
                      />
                    );
                    acc.offset += item.percent;
                    return acc;
                  }, { elements: [] as React.ReactElement[], offset: 0 }).elements}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-[#0b1c30] font-heading">{sections.length}</span>
                  <span className="text-[10px] text-[#94a3b8]">Sections</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {budgetData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#64748B]">{item.name}</span>
                  </span>
                  <span className="font-medium text-[#0b1c30]">₹{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-bold text-[#0b1c30] font-heading mb-4">Budget Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Total Budget</span>
                <span className="font-semibold text-[#0b1c30]">₹{budget.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">Total Spent</span>
                <span className="font-semibold text-[#E8604C]">₹{spent.toLocaleString()}</span>
              </div>
              <div className="border-t border-[#f1f5f9] pt-3 flex justify-between text-sm">
                <span className="text-[#64748B]">Remaining</span>
                <span className={`font-bold ${remaining >= 0 ? 'text-[#059669]' : 'text-[#dc2626]'}`}>
                  ₹{remaining.toLocaleString()}
                </span>
              </div>
              <div className="mt-2">
                <div className="h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#001b26] rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(budget > 0 ? (spent / budget) * 100 : 0, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[#94a3b8] mt-1">
                  {budget > 0 ? Math.round((spent / budget) * 100) : 0}% of budget used
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      ) : (
        <div className="text-center py-24 bg-[#f8fafc] rounded-3xl border-2 border-dashed border-[#e2e8f0]">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-[#001b26]/5 flex items-center justify-center mx-auto mb-6 text-[#E8604C]">
              <MapPin className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-[#0b1c30] font-heading mb-3">No Adventure Selected</h2>
            <p className="text-[#64748B] mb-8 leading-relaxed">
              To view or build an itinerary, please select one of your upcoming journeys from the trip switcher above.
            </p>
            <button 
              onClick={() => navigate('/trips')} 
              className="px-8 py-3 bg-[#001b26] text-white rounded-2xl font-bold hover:bg-[#002a3a] transition-all shadow-lg shadow-[#001b26]/20"
            >
              Browse All Trips
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
