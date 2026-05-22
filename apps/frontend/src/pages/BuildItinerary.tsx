import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Calendar, DollarSign, Clock, Plus, Trash2,
  ChevronDown, ChevronUp, ArrowUp, ArrowDown, Loader2, AlertTriangle,
  Activity, BarChart2, Globe, Lock,
} from 'lucide-react';
import { useTrip, useTripStats } from '../hooks/useTrips';
import { useStops, useDeleteStop, useReorderStops } from '../hooks/useStops';
import { useRemoveStopActivity } from '../hooks/useStopActivities';
import AddStopModal from '../components/itinerary/AddStopModal';
import ActivityPickerModal from '../components/itinerary/ActivityPickerModal';

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatCurrency(amount?: number | null, fallback = '—') {
  if (amount == null) return fallback;
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function daysBetween(a?: string | null, b?: string | null) {
  if (!a || !b) return 0;
  return Math.max(0, Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

interface ActivityPickerTarget {
  stopId: string;
  cityId?: string;
  cityName: string;
}

export default function BuildItinerary() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const { data: trip, isLoading: tripLoading, isError: tripError } = useTrip(tripId!);
  const { data: stops = [], isLoading: stopsLoading } = useStops(tripId!);
  const { data: stats } = useTripStats(tripId!);

  const deleteStop = useDeleteStop(tripId!);
  const reorderStops = useReorderStops(tripId!);
  const removeActivity = useRemoveStopActivity(tripId!);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [addStopOpen, setAddStopOpen] = useState(false);
  const [activityTarget, setActivityTarget] = useState<ActivityPickerTarget | null>(null);

  const toggleCollapse = (stopId: string) =>
    setCollapsed((prev) => ({ ...prev, [stopId]: !prev[stopId] }));

  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...stops].sort((a, b) => a.order_index - b.order_index);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;
    [newOrder[index], newOrder[targetIdx]] = [newOrder[targetIdx], newOrder[index]];
    reorderStops.mutate(newOrder.map((s) => s.id));
  };

  if (!tripId) return null;

  if (tripLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8604C]" />
      </div>
    );
  }

  if (tripError || !trip) {
    return (
      <div className="card p-12 text-center max-w-md mx-auto mt-16">
        <AlertTriangle className="w-10 h-10 text-[#E8604C] mx-auto mb-3" />
        <h3 className="font-bold text-[#0b1c30] text-lg mb-1">Trip not found</h3>
        <p className="text-[#64748B] text-sm mb-5">This trip doesn't exist or you don't have access to it.</p>
        <button onClick={() => navigate('/trips')} className="btn-primary text-sm">Back to My Trips</button>
      </div>
    );
  }

  const sortedStops = [...stops].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="page-transition max-w-6xl">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/trips')}
          className="p-2 rounded-xl text-[#64748B] hover:text-[#0b1c30] hover:bg-[#f1f5f9] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[#0b1c30] font-heading truncate">{trip.name}</h1>
          <div className="flex items-center gap-3 mt-0.5 text-sm text-[#64748B]">
            {trip.start_date ? (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
              </span>
            ) : (
              <span className="text-[#94a3b8] italic text-xs">No dates set</span>
            )}
            {trip.is_public
              ? <span className="flex items-center gap-1 text-[#2563eb] text-xs font-semibold"><Globe className="w-3 h-3" /> Public</span>
              : <span className="flex items-center gap-1 text-xs font-semibold text-[#94a3b8]"><Lock className="w-3 h-3" /> Private</span>
            }
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* ── Sidebar ── */}
        <aside className="lg:w-72 shrink-0 space-y-4">
          {/* Trip Summary card */}
          <div className="bg-white rounded-2xl border border-[#f1f5f9] p-5 shadow-sm">
            <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-4">Trip Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-[#64748B]"><MapPin className="w-4 h-4 text-[#E8604C]" /> Stops</span>
                <span className="text-sm font-bold text-[#0b1c30]">{stats?.totalStops ?? sortedStops.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-[#64748B]"><Activity className="w-4 h-4 text-[#3b82f6]" /> Activities</span>
                <span className="text-sm font-bold text-[#0b1c30]">{stats?.totalActivities ?? '—'}</span>
              </div>
              {stats?.dayCount != null && stats.dayCount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-[#64748B]"><Clock className="w-4 h-4 text-[#8b5cf6]" /> Days</span>
                  <span className="text-sm font-bold text-[#0b1c30]">{stats.dayCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Budget card */}
          {trip.total_budget != null && (
            <div className="bg-white rounded-2xl border border-[#f1f5f9] p-5 shadow-sm">
              <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-widest mb-4">Budget</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-[#64748B]"><DollarSign className="w-4 h-4 text-[#059669]" /> Total</span>
                  <span className="text-sm font-bold text-[#0b1c30]">{formatCurrency(Number(trip.total_budget))}</span>
                </div>
                {stats?.totalExpenses != null && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-[#64748B]"><BarChart2 className="w-4 h-4 text-[#f59e0b]" /> Spent</span>
                    <span className="text-sm font-bold text-[#E8604C]">{formatCurrency(stats.totalExpenses)}</span>
                  </div>
                )}
                {stats?.remainingBudget != null && (
                  <>
                    <div className="h-px bg-[#f1f5f9]" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-[#64748B]">Remaining</span>
                      <span className={`text-sm font-bold ${stats.remainingBudget >= 0 ? 'text-[#059669]' : 'text-[#E8604C]'}`}>
                        {formatCurrency(stats.remainingBudget)}
                      </span>
                    </div>
                    {/* Budget bar */}
                    <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          stats.remainingBudget >= 0 ? 'bg-[#059669]' : 'bg-[#E8604C]'
                        }`}
                        style={{
                          width: `${Math.min(100, (stats.totalExpenses / Number(trip.total_budget)) * 100)}%`,
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* ── Main: Timeline ── */}
        <div className="flex-1 min-w-0">
          {stopsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#f1f5f9] p-5 animate-pulse">
                  <div className="h-4 bg-[#f1f5f9] rounded-lg w-1/3 mb-3" />
                  <div className="h-3 bg-[#f1f5f9] rounded-lg w-1/2" />
                </div>
              ))}
            </div>
          ) : sortedStops.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-dashed border-[#e2e8f0] p-14 text-center"
            >
              <MapPin className="w-12 h-12 text-[#e2e8f0] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-[#0b1c30] mb-1">No stops yet</h3>
              <p className="text-sm text-[#64748B] mb-6">Add your first city stop to start building your itinerary.</p>
              <button
                onClick={() => setAddStopOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E8604C] text-white text-sm font-semibold rounded-xl hover:bg-[#d44e3b] transition-all"
              >
                <Plus className="w-4 h-4" /> Add First Stop
              </button>
            </motion.div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              {sortedStops.length > 1 && (
                <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-gradient-to-b from-[#E8604C]/40 via-[#3b82f6]/30 to-[#8b5cf6]/40 z-0" />
              )}

              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {sortedStops.map((stop, index) => {
                    const isCollapsed = collapsed[stop.id];
                    const nights = daysBetween(stop.arrival_date, stop.departure_date);
                    const subtotal = stop.activities.reduce((sum, sa) => {
                      const cost = sa.custom_cost != null ? Number(sa.custom_cost) : sa.activity ? Number(sa.activity.cost) : 0;
                      return sum + cost;
                    }, 0);

                    return (
                      <motion.div
                        key={stop.id}
                        layout
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 } }}
                        exit={{ opacity: 0, x: 16 }}
                        className="relative z-10"
                      >
                        {/* Stop number bubble */}
                        <div className="absolute left-0 top-5 w-12 h-12 rounded-full bg-gradient-to-br from-[#E8604C] to-[#f59e0b] flex items-center justify-center text-white font-bold text-sm shadow-md z-10">
                          {index + 1}
                        </div>

                        <div className="ml-16 bg-white rounded-2xl border border-[#f1f5f9] shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                          {/* Stop header */}
                          <div className="flex items-start gap-3 p-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-[#0b1c30] text-base">{stop.city?.name || stop.custom_city_name}</h3>
                                {stop.city?.country && <span className="text-xs text-[#94a3b8]">{stop.city.country}</span>}
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-[#64748B]">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(stop.arrival_date)} → {formatDate(stop.departure_date)}
                                </span>
                                <span>{nights} night{nights !== 1 ? 's' : ''}</span>
                                {subtotal > 0 && (
                                  <span className="flex items-center gap-1 text-[#E8604C] font-semibold">
                                    <DollarSign className="w-3 h-3" />{formatCurrency(subtotal)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleMoveStop(index, 'up')}
                                disabled={index === 0 || reorderStops.isPending}
                                className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0b1c30] hover:bg-[#f1f5f9] disabled:opacity-30 transition-all"
                                title="Move up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveStop(index, 'down')}
                                disabled={index === sortedStops.length - 1 || reorderStops.isPending}
                                className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0b1c30] hover:bg-[#f1f5f9] disabled:opacity-30 transition-all"
                                title="Move down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => toggleCollapse(stop.id)}
                                className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#0b1c30] hover:bg-[#f1f5f9] transition-all"
                                title={isCollapsed ? 'Expand' : 'Collapse'}
                              >
                                {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                onClick={() => deleteStop.mutate(stop.id)}
                                disabled={deleteStop.isPending}
                                className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#E8604C] hover:bg-[#fef2f2] transition-all"
                                title="Delete stop"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Activity list */}
                          <AnimatePresence>
                            {!isCollapsed && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-[#f1f5f9] px-4 py-3">
                                  {stop.activities.length === 0 ? (
                                    <p className="text-xs text-[#94a3b8] italic py-2">No activities yet.</p>
                                  ) : (
                                    <div className="space-y-2 mb-3">
                                      {stop.activities.map((sa) => {
                                        const title = sa.custom_title || sa.activity?.title || 'Untitled activity';
                                        const cost = sa.custom_cost != null ? Number(sa.custom_cost) : sa.activity ? Number(sa.activity.cost) : 0;
                                        return (
                                          <div key={sa.id} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] transition-colors group">
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium text-[#0b1c30] truncate">{title}</p>
                                              <div className="flex items-center gap-3 mt-0.5">
                                                {sa.scheduled_time && (
                                                  <span className="text-xs text-[#94a3b8] flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />{sa.scheduled_time}
                                                  </span>
                                                )}
                                                {cost > 0 && (
                                                  <span className="text-xs text-[#64748B] font-medium">
                                                    {formatCurrency(cost)}
                                                  </span>
                                                )}
                                                {!sa.activity_id && (
                                                  <span className="text-[10px] bg-[#fef3c7] text-[#d97706] px-1.5 py-0.5 rounded-full font-semibold">Custom</span>
                                                )}
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => removeActivity.mutate({ stopId: stop.id, saId: sa.id })}
                                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-[#94a3b8] hover:text-[#E8604C] hover:bg-[#fef2f2] transition-all"
                                              title="Remove activity"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  <button
                                    onClick={() => setActivityTarget({
                                      stopId: stop.id,
                                      cityId: stop.city_id,
                                      cityName: stop.city?.name || stop.custom_city_name || 'Custom Stop',
                                    })}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-[#E8604C] hover:text-[#d44e3b] transition-colors py-1"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> Add Activity
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Add Stop button */}
                <motion.button
                  layout
                  onClick={() => setAddStopOpen(true)}
                  className="ml-16 w-full py-4 border-2 border-dashed border-[#e2e8f0] rounded-2xl text-[#94a3b8] hover:border-[#E8604C] hover:text-[#E8604C] transition-all flex items-center justify-center gap-2 text-sm font-semibold"
                >
                  <Plus className="w-4 h-4" /> Add Another Stop
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <AddStopModal
        tripId={tripId!}
        isOpen={addStopOpen}
        onClose={() => setAddStopOpen(false)}
      />

      {activityTarget && (
        <ActivityPickerModal
          tripId={tripId!}
          stopId={activityTarget.stopId}
          cityId={activityTarget.cityId}
          cityName={activityTarget.cityName}
          isOpen={!!activityTarget}
          onClose={() => setActivityTarget(null)}
        />
      )}
    </div>
  );
}
