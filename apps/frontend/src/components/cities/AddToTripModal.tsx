import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Loader2, CheckCircle2, MapPin } from 'lucide-react';
import { useTrips, useTrip, type TripStop } from '../../hooks/useTrips';
import { useAddActivityToStop, type Activity } from '../../hooks/useCities';

interface Props {
  activity: Activity | null;
  open: boolean;
  onClose: () => void;
}

export default function AddToTripModal({ activity, open, onClose }: Props) {
  const [step, setStep] = useState<'trip' | 'stop'>('trip');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<TripStop | null>(null);
  const [stopSearch, setStopSearch] = useState('');
  const [done, setDone] = useState(false);

  // Paginated trips list — only used to display trip names for selection
  const { data: tripsData, isLoading: tripsLoading } = useTrips({ limit: 50 });

  // Fetch the FULL single trip detail (includes stops) when a trip is selected
  const { data: tripDetail, isLoading: tripDetailLoading } = useTrip(selectedTripId ?? '');

  const addActivity = useAddActivityToStop();

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('trip');
      setSelectedTripId(null);
      setSelectedStop(null);
      setStopSearch('');
      setDone(false);
    }, 300);
  };

  const handleSelectTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    setSelectedStop(null);
    setStopSearch('');
    setStep('stop');
  };

  const handleConfirm = async () => {
    if (!selectedTripId || !selectedStop || !activity) return;
    try {
      await addActivity.mutateAsync({
        tripId: selectedTripId,
        stopId: selectedStop.id,
        activityId: activity.id,
      });
      setDone(true);
      setTimeout(handleClose, 1500);
    } catch {
      // error shown below
    }
  };

  // Use stops from the detail fetch (not the list fetch)
  const stops: TripStop[] = tripDetail?.stops ?? [];
  const filteredStops = stops.filter((stop) => {
    const cityName = (stop.city?.name || stop.custom_location || '').toLowerCase();
    const countryName = (stop.city?.country || '').toLowerCase();
    return cityName.includes(stopSearch.toLowerCase()) || countryName.includes(stopSearch.toLowerCase());
  });
  const selectedTripName = tripsData?.items.find((t) => t.id === selectedTripId)?.name ?? '';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="modal-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-[#0b1c30] font-heading">Add to Trip</h3>
                {activity && (
                  <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[260px]">
                    {activity.name}
                  </p>
                )}
              </div>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {done ? (
                <div className="flex flex-col items-center py-8 gap-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                  <p className="font-semibold text-[#0b1c30]">Added successfully!</p>
                </div>
              ) : step === 'trip' ? (
                <div>
                  <p className="text-sm text-slate-500 mb-4">Select which trip to add this activity to:</p>
                  {tripsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#E8604C]" />
                    </div>
                  ) : !tripsData?.items.length ? (
                    <p className="text-sm text-center text-slate-400 py-6">
                      You have no trips yet. Create one first.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {tripsData.items.map((trip) => (
                        <button
                          key={trip.id}
                          id={`select-trip-${trip.id}`}
                          onClick={() => handleSelectTrip(trip.id)}
                          className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 hover:border-[#E8604C] hover:bg-slate-50 transition-all text-left group"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#0b1c30]">{trip.name}</p>
                            <p className="text-xs text-slate-400">{trip._count?.stops ?? 0} stop(s)</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#E8604C] transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => { setStep('trip'); setSelectedStop(null); setSelectedTripId(null); }}
                    className="text-xs text-[#E8604C] hover:underline mb-4 inline-flex items-center gap-1"
                  >
                    ← Back to trips
                  </button>
                  <p className="text-sm text-slate-500 mb-3">
                    Select a stop in <strong className="text-[#0b1c30]">{selectedTripName}</strong>:
                  </p>

                  {tripDetailLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-[#E8604C]" />
                    </div>
                  ) : stops.length === 0 ? (
                    <p className="text-sm text-center text-slate-400 py-4">
                      This trip has no stops yet. Add stops in the itinerary builder first.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Search stops by city or country..."
                        value={stopSearch}
                        onChange={(e) => setStopSearch(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#E8604C] transition-all"
                      />
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {filteredStops.length === 0 ? (
                          <p className="text-xs text-center text-slate-400 py-4">
                            No matching stops found.
                          </p>
                        ) : (
                          filteredStops.map((stop) => (
                            <button
                              key={stop.id}
                              id={`select-stop-${stop.id}`}
                              onClick={() => setSelectedStop(stop)}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                                selectedStop?.id === stop.id
                                  ? 'border-[#E8604C] bg-[#E8604C]/5'
                                  : 'border-slate-200 hover:border-[#E8604C]/40'
                              }`}
                            >
                              <MapPin className="w-4 h-4 text-[#E8604C] flex-shrink-0" />
                              <div>
                                <p className="text-sm font-semibold text-[#0b1c30]">{stop.city?.name || stop.custom_location}</p>
                                <p className="text-xs text-slate-400">{stop.city?.country || 'Custom Stop'}</p>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {addActivity.isError && (
                    <p className="text-xs text-red-500 mt-3">
                      Failed to add activity. Please try again.
                    </p>
                  )}

                  <button
                    id="confirm-add-activity"
                    disabled={!selectedStop || addActivity.isPending || tripDetailLoading}
                    onClick={handleConfirm}
                    className="w-full mt-5 py-3 rounded-xl bg-[#E8604C] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d44f3c] transition-colors flex items-center justify-center gap-2"
                  >
                    {addActivity.isPending ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                    ) : (
                      'Confirm & Add'
                    )}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
