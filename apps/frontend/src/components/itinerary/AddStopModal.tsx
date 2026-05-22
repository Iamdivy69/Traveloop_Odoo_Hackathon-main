import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, MapPin, Calendar, FileText, Loader2 } from 'lucide-react';
import { useCities } from '../../hooks/useCities';
import { useCreateStop } from '../../hooks/useStops';

interface AddStopModalProps {
  tripId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStopModal({ tripId, isOpen, onClose }: AddStopModalProps) {
  const createStop = useCreateStop(tripId);
  const [citySearch, setCitySearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<{ id: string; name: string; country: string } | null>(null);
  const [form, setForm] = useState({ arrival_date: '', departure_date: '', notes: '' });
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { data: citiesData, isFetching } = useCities(
    debouncedSearch.length >= 2 ? { q: debouncedSearch } : { q: '' }
  );
  const cities = citiesData?.items ?? [];

  useEffect(() => {
    if (isOpen) {
      setCitySearch(''); setDebouncedSearch('');
      setSelectedCity(null);
      setForm({ arrival_date: '', departure_date: '', notes: '' });
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(citySearch), 350);
    return () => clearTimeout(debounceRef.current);
  }, [citySearch]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedCity && !citySearch.trim()) { setError('Please select a city or type a custom name'); return; }
    if (!form.arrival_date) { setError('Arrival date is required'); return; }
    if (!form.departure_date) { setError('Departure date is required'); return; }
    if (new Date(form.departure_date) <= new Date(form.arrival_date)) {
      setError('Departure must be after arrival'); return;
    }
    try {
      await createStop.mutateAsync({
        ...(selectedCity ? { city_id: selectedCity.id } : { custom_city_name: citySearch.trim() }),
        arrival_date: form.arrival_date,
        departure_date: form.departure_date,
        ...(form.notes && { notes: form.notes }),
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to add stop');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-[#001b26]/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
          >
            <div className="h-1.5 bg-[#3b82f6]" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-[#0b1c30] font-heading">Add a Stop</h2>
                  <p className="text-sm text-[#64748B] mt-0.5">Search for a city and set your dates.</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl text-[#94a3b8] hover:text-[#0b1c30] hover:bg-[#f1f5f9] transition-colors"><X className="w-4 h-4" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* City search */}
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                    City <span className="text-[#E8604C]">*</span>
                  </label>
                  {selectedCity ? (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#eff6ff] border border-[#bfdbfe]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#2563eb]" />
                        <span className="text-sm font-semibold text-[#1e40af]">{selectedCity.name}, {selectedCity.country}</span>
                      </div>
                      <button type="button" onClick={() => setSelectedCity(null)} className="text-[#3b82f6] hover:text-[#1d4ed8] text-xs font-semibold transition-colors">Change</button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                      <input
                        id="stop-city-search"
                        type="text"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        placeholder="Search for a city, or type a custom name…"
                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0b1c30] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6] transition-all"
                        autoComplete="off"
                      />
                      {isFetching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#94a3b8]" />}
                      {debouncedSearch.length >= 2 && cities.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white rounded-xl border border-[#e2e8f0] shadow-lg max-h-48 overflow-y-auto">
                          {cities.map((city: any) => (
                            <button
                              key={city.id}
                              type="button"
                              onClick={() => { setSelectedCity({ id: city.id, name: city.name, country: city.country }); setCitySearch(''); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-left hover:bg-[#f8fafc] transition-colors border-b border-[#f1f5f9] last:border-0"
                            >
                              <MapPin className="w-3.5 h-3.5 text-[#94a3b8] shrink-0" />
                              <span className="font-medium text-[#0b1c30]">{city.name}</span>
                              <span className="text-[#94a3b8] text-xs ml-auto">{city.country}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {debouncedSearch.length >= 2 && !isFetching && cities.length === 0 && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#059669] bg-[#ecfdf5] p-2.5 rounded-lg border border-[#a7f3d0]">
                          No cities found. "{debouncedSearch}" will be added as a custom stop.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Arrival</span>
                    </label>
                    <input
                      id="stop-arrival"
                      type="date"
                      value={form.arrival_date}
                      onChange={(e) => setForm({ ...form, arrival_date: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Departure</span>
                    </label>
                    <input
                      id="stop-departure"
                      type="date"
                      value={form.departure_date}
                      min={form.arrival_date || undefined}
                      onChange={(e) => setForm({ ...form, departure_date: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6] transition-all"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Notes (optional)</span>
                  </label>
                  <textarea
                    id="stop-notes"
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Accommodation, things to do, reminders…"
                    className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0b1c30] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6] resize-none transition-all"
                  />
                </div>

                {error && <p className="text-sm text-[#E8604C] bg-[#fef2f2] rounded-xl px-4 py-2.5">{error}</p>}

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-semibold text-[#64748B] hover:bg-[#f1f5f9] transition-all">Cancel</button>
                  <button
                    type="submit"
                    disabled={createStop.isPending}
                    className="flex-1 py-2.5 rounded-xl bg-[#3b82f6] text-white text-sm font-semibold hover:bg-[#2563eb] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                  >
                    {createStop.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</> : 'Add Stop'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
