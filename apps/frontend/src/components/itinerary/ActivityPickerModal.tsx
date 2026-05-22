import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Search, Zap, Clock, DollarSign, FileText, Plus } from 'lucide-react';
import { useAddActivity } from '../../hooks/useStopActivities';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

interface ActivityPickerModalProps {
  tripId: string;
  stopId: string;
  cityId?: string;
  cityName: string;
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'city' | 'custom';

export default function ActivityPickerModal({
  tripId, stopId, cityId, cityName, isOpen, onClose,
}: ActivityPickerModalProps) {
  const addActivity = useAddActivity(tripId, stopId);
  const [tab, setTab] = useState<TabType>('custom');
  const [search, setSearch] = useState('');
  const [customForm, setCustomForm] = useState({
    title: '', cost: '', duration: '', scheduled_time: '', notes: '',
  });
  const [error, setError] = useState('');

  const { data: cityActivities = [], isFetching } = useQuery({
    queryKey: ['city-activities', cityId, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (cityId) params.append('city_id', cityId);
      if (search) params.append('q', search);
      const { data } = await api.get(`/cities/${cityId}/activities?${params.toString()}`);
      return data.data ?? [];
    },
    enabled: isOpen && tab === 'city' && !!cityId,
  });

  useEffect(() => {
    if (isOpen) {
      setTab('custom'); setSearch('');
      setCustomForm({ title: '', cost: '', duration: '', scheduled_time: '', notes: '' });
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleAddExisting = async (activity: any) => {
    setError('');
    try {
      await addActivity.mutateAsync({ activity_id: activity.id });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to add activity');
    }
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!customForm.title.trim()) { setError('Activity title is required'); return; }
    try {
      await addActivity.mutateAsync({
        custom_title: customForm.title.trim(),
        ...(customForm.cost && { custom_cost: parseFloat(customForm.cost) }),
        ...(customForm.scheduled_time && { scheduled_time: customForm.scheduled_time }),
        ...(customForm.notes && { notes: customForm.notes.trim() }),
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to add activity');
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
            <div className="h-1.5 bg-gradient-to-r from-[#E8604C] to-[#f59e0b]" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#0b1c30] font-heading">Add Activity</h2>
                  <p className="text-sm text-[#64748B] mt-0.5">in {cityName}</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl text-[#94a3b8] hover:text-[#0b1c30] hover:bg-[#f1f5f9] transition-colors"><X className="w-4 h-4" /></button>
              </div>

              {/* Tabs */}
              <div className="flex bg-[#f8fafc] rounded-xl p-1 gap-1 mb-5 border border-[#f1f5f9]">
                {([
                  { key: 'custom' as TabType, label: 'Custom Activity', icon: <Zap className="w-3.5 h-3.5" /> },
                  ...(cityId ? [{ key: 'city' as TabType, label: `From ${cityName}`, icon: <Search className="w-3.5 h-3.5" /> }] : []),
                ]).map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                      tab === key ? 'bg-white text-[#0b1c30] shadow-sm' : 'text-[#64748B] hover:text-[#0b1c30]'
                    }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>

              {/* City activities tab */}
              {tab === 'city' && (
                <div>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={`Search activities in ${cityName}…`}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0b1c30] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#E8604C]/30 focus:border-[#E8604C] transition-all"
                    />
                    {isFetching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-[#94a3b8]" />}
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {cityActivities.length === 0 && !isFetching && (
                      <p className="text-sm text-[#94a3b8] text-center py-8">No activities found. Try the Custom tab.</p>
                    )}
                    {cityActivities.map((act: any) => (
                      <div key={act.id} className="flex items-center gap-3 p-3 rounded-xl border border-[#f1f5f9] hover:border-[#E8604C]/30 hover:bg-[#fef9f8] transition-all group">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0b1c30] truncate">{act.title}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            {act.duration_minutes && (
                              <span className="flex items-center gap-1 text-xs text-[#94a3b8]"><Clock className="w-3 h-3" /> {act.duration_minutes}m</span>
                            )}
                            {act.cost && (
                              <span className="flex items-center gap-1 text-xs text-[#64748B] font-medium"><DollarSign className="w-3 h-3" /> {Number(act.cost).toLocaleString()}</span>
                            )}
                            {act.category && (
                              <span className="text-[10px] bg-[#f1f5f9] text-[#64748B] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">{act.category}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddExisting(act)}
                          disabled={addActivity.isPending}
                          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#E8604C] text-white text-xs font-semibold hover:bg-[#d44e3b] disabled:opacity-60 transition-all"
                        >
                          {addActivity.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom activity tab */}
              {tab === 'custom' && (
                <form onSubmit={handleAddCustom} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">Title <span className="text-[#E8604C]">*</span></label>
                    <input
                      id="custom-activity-title"
                      type="text"
                      value={customForm.title}
                      onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                      placeholder="e.g. Snorkeling at Butterfly Beach"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0b1c30] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#E8604C]/30 focus:border-[#E8604C] transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Cost</span>
                      </label>
                      <input
                        id="custom-activity-cost"
                        type="number" min="0" step="0.01"
                        value={customForm.cost}
                        onChange={(e) => setCustomForm({ ...customForm, cost: e.target.value })}
                        placeholder="0.00"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0b1c30] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#E8604C]/30 focus:border-[#E8604C] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Time (HH:MM)</span>
                      </label>
                      <input
                        id="custom-activity-time"
                        type="time"
                        value={customForm.scheduled_time}
                        onChange={(e) => setCustomForm({ ...customForm, scheduled_time: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#E8604C]/30 focus:border-[#E8604C] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-1.5">
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> Notes</span>
                    </label>
                    <textarea
                      id="custom-activity-notes"
                      rows={2}
                      value={customForm.notes}
                      onChange={(e) => setCustomForm({ ...customForm, notes: e.target.value })}
                      placeholder="Booking info, tips, things to remember…"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0b1c30] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#E8604C]/30 focus:border-[#E8604C] resize-none transition-all"
                    />
                  </div>

                  {error && <p className="text-sm text-[#E8604C] bg-[#fef2f2] rounded-xl px-4 py-2.5">{error}</p>}

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-semibold text-[#64748B] hover:bg-[#f1f5f9] transition-all">Cancel</button>
                    <button
                      type="submit"
                      disabled={addActivity.isPending}
                      className="flex-1 py-2.5 rounded-xl bg-[#E8604C] text-white text-sm font-semibold hover:bg-[#d44e3b] disabled:opacity-60 transition-all flex items-center justify-center gap-2"
                    >
                      {addActivity.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding…</> : 'Add Activity'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
