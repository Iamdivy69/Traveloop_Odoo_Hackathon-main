import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, DollarSign, Plus, Tag, Loader2 } from 'lucide-react';
import type { CityDetail, Activity } from '../../hooks/useCities';
import AddToTripModal from './AddToTripModal';

const CATEGORY_COLORS: Record<string, string> = {
  CULTURE: 'bg-purple-100 text-purple-700',
  ADVENTURE: 'bg-orange-100 text-orange-700',
  FOOD: 'bg-yellow-100 text-yellow-700',
  NATURE: 'bg-green-100 text-green-700',
  SHOPPING: 'bg-pink-100 text-pink-700',
  NIGHTLIFE: 'bg-indigo-100 text-indigo-700',
  WELLNESS: 'bg-teal-100 text-teal-700',
  HISTORY: 'bg-amber-100 text-amber-700',
  OTHER: 'bg-slate-100 text-slate-600',
};

function ActivityCard({
  activity,
  onAdd,
}: {
  activity: Activity;
  onAdd: (activity: Activity) => void;
}) {
  const cat = (activity.type || 'OTHER').toUpperCase();
  const colorClass = CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.OTHER;

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:border-[#E8604C]/30 hover:bg-slate-50 transition-all group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${colorClass}`}>
            {cat}
          </span>
          {activity.duration_mins && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
              <Clock className="w-2.5 h-2.5" />{activity.duration_mins}m
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-800 leading-tight">{activity.name}</p>
        {activity.description && (
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{activity.description}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <span className="text-sm font-bold text-emerald-600 flex items-center gap-0.5">
          <DollarSign className="w-3 h-3" />{Number(activity.cost).toFixed(0)}
        </span>
        <button
          id={`add-activity-${activity.id}`}
          onClick={() => onAdd(activity)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#001b26] text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-all hover:bg-[#0b1c30]"
        >
          <Plus className="w-2.5 h-2.5" /> Add to Trip
        </button>
      </div>
    </div>
  );
}

// ─── Main Drawer ─────────────────────────────────────────────────
interface Props {
  city: CityDetail | null;
  open: boolean;
  onClose: () => void;
}

export default function CityDetailDrawer({ city, open, onClose }: Props) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Group activities by type/category
  const grouped = city?.activities?.reduce<Record<string, Activity[]>>((acc, act) => {
    const cat = (act.type || 'OTHER').toUpperCase();
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(act);
    return acc;
  }, {}) ?? {};

  const fallbackImg = `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1600`;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-white z-50 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header image */}
            <div className="relative h-52 flex-shrink-0">
              <img
                src={city?.image_url || fallbackImg}
                alt={city?.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <button
                id="close-city-drawer"
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {city && (
                <div className="absolute bottom-4 left-5 right-5">
                  <h2 className="text-2xl font-bold text-white font-heading">{city.name}</h2>
                  <p className="text-white/70 text-sm flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {city.country}{city.region ? `, ${city.region}` : ''}
                  </p>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {!city ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-6 h-6 text-[#E8604C] animate-spin" />
                </div>
              ) : (
                <div className="p-5 space-y-6">
                  {/* Description */}
                  {city.description && (
                    <p className="text-sm text-slate-500 leading-relaxed">{city.description}</p>
                  )}

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3 text-center">
                      <p className="text-lg font-bold text-[#0b1c30]">{city._count?.activities ?? 0}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">Activities</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-center">
                      <p className="text-lg font-bold text-[#0b1c30]">{city._count?.stops ?? 0}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">Planned Visits</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 text-center">
                      <p className="text-lg font-bold text-emerald-600">
                        {'₹'.repeat(Math.min(5, Math.ceil(Number(city.cost_index) / 500)))}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide">Cost Level</p>
                    </div>
                  </div>

                  {/* Activities grouped by category */}
                  {Object.keys(grouped).length > 0 ? (
                    <div className="space-y-5">
                      <h3 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-[#E8604C]" /> Activities by Category
                      </h3>
                      {Object.entries(grouped).map(([cat, activities]) => (
                        <div key={cat}>
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">{cat}</p>
                          <div className="space-y-2">
                            {activities.map((act) => (
                              <ActivityCard
                                key={act.id}
                                activity={act}
                                onAdd={setSelectedActivity}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 rounded-xl border-2 border-dashed border-slate-200">
                      <p className="text-sm text-slate-400">No activities listed yet for this city.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add to Trip Modal */}
      <AddToTripModal
        activity={selectedActivity}
        open={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </>
  );
}
