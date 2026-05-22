import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  Shirt,
  FileText,
  Smartphone,
  Droplets,
  Pill,
  Cookie,
  Box,
  Loader2,
  CheckCheck,
  RotateCcw,
  X,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  usePackingList,
  usePackingProgress,
  useCreatePackingItem,
  useTogglePacked,
  useBulkToggle,
  useDeletePacked,
  useDeletePackingItem,
} from '../hooks/usePacking';

const CATEGORIES = ['Clothing', 'Documents', 'Electronics', 'Toiletries', 'Medicine', 'Snacks', 'Other'];

const CATEGORY_META: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  Clothing:    { icon: Shirt,       color: 'text-violet-600', bg: 'bg-violet-50' },
  Documents:   { icon: FileText,    color: 'text-blue-600',   bg: 'bg-blue-50' },
  Electronics: { icon: Smartphone,  color: 'text-indigo-600', bg: 'bg-indigo-50' },
  Toiletries:  { icon: Droplets,    color: 'text-cyan-600',   bg: 'bg-cyan-50' },
  Medicine:    { icon: Pill,        color: 'text-rose-600',   bg: 'bg-rose-50' },
  Snacks:      { icon: Cookie,      color: 'text-amber-600',  bg: 'bg-amber-50' },
  Other:       { icon: Box,         color: 'text-slate-600',  bg: 'bg-slate-50' },
};

type PackingItem = {
  id: string;
  name: string;
  category: string;
  is_packed: boolean;
  created_at: string;
};

export default function PackingChecklist() {
  const { activeTrip } = useStore();
  const tripId = activeTrip?.id || '';

  const { data: grouped, isLoading } = usePackingList(tripId);
  const { data: progress } = usePackingProgress(tripId);

  const createItem = useCreatePackingItem(tripId);
  const togglePacked = useTogglePacked(tripId);
  const bulkToggle = useBulkToggle(tripId);
  const deletePacked = useDeletePacked(tripId);
  const deleteItem = useDeletePackingItem(tripId);

  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c, true]))
  );
  const [newItemText, setNewItemText] = useState<Record<string, string>>({});
  const [newCatName, setNewCatName] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [localCategories, setLocalCategories] = useState<string[]>(CATEGORIES);

  const allItems: PackingItem[] = grouped
    ? Object.values(grouped).flat()
    : [];

  const allIds = allItems.map((i) => i.id);
  const packedIds = allItems.filter((i) => i.is_packed).map((i) => i.id);

  const pct = progress?.percentage ?? 0;
  const packedCount = progress?.packed ?? 0;
  const totalCount = progress?.total ?? 0;

  // Merge API categories with local ones
  const apiCats = grouped ? Object.keys(grouped) : [];
  const allCategories = [...new Set([...localCategories, ...apiCats])];

  const toggleCat = (cat: string) =>
    setExpandedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));

  const handleAddItem = (category: string) => {
    const name = newItemText[category]?.trim();
    if (!name || !tripId) return;
    createItem.mutate({ name, category });
    setNewItemText((prev) => ({ ...prev, [category]: '' }));
  };

  const handleAddCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    setLocalCategories((prev) => [...prev, name]);
    setExpandedCats((prev) => ({ ...prev, [name]: true }));
    setNewCatName('');
    setIsAddingCat(false);
  };

  if (!activeTrip) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center mt-20">
        <Box className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h2 className="text-2xl font-heading font-bold text-[#0b1c30] mb-2">No Active Trip</h2>
        <p className="text-slate-500">Select a trip to manage your packing list.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-black text-[#0b1c30] tracking-tight">
          Packing Checklist
        </h1>
        <p className="text-slate-500 mt-1">
          {activeTrip.name} · {activeTrip.destination}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-bold text-[#0b1c30] text-lg">Trip Readiness</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isLoading ? 'Loading...' : `${packedCount} of ${totalCount} items packed`}
            </p>
          </div>
          <span className="text-4xl font-black text-[#E8604C] font-heading">{pct}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#E8604C] to-[#f48a7b] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => bulkToggle.mutate({ ids: allIds, isPacked: true })}
            disabled={bulkToggle.isPending || allIds.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#E8604C]/10 text-[#E8604C] rounded-xl hover:bg-[#E8604C]/20 transition-colors disabled:opacity-40"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Check All
          </button>
          <button
            onClick={() => bulkToggle.mutate({ ids: packedIds, isPacked: false })}
            disabled={bulkToggle.isPending || packedIds.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Uncheck All
          </button>
          <button
            onClick={() => deletePacked.mutate()}
            disabled={deletePacked.isPending || packedIds.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Packed
          </button>
        </div>
      </div>

      {/* Skeleton */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="h-4 bg-slate-100 rounded-full w-32" />
              </div>
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex items-center gap-3 py-3 border-t border-slate-50">
                  <div className="w-6 h-6 rounded-lg bg-slate-100" />
                  <div className="h-3 bg-slate-100 rounded-full flex-1" />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Category Accordions */}
      {!isLoading && (
        <div className="space-y-4">
          {allCategories.map((category) => {
            const items: PackingItem[] = grouped?.[category] ?? [];
            const catPacked = items.filter((i) => i.is_packed).length;
            const isExpanded = expandedCats[category] !== false;
            const meta = CATEGORY_META[category] || CATEGORY_META.Other;
            const Icon = meta.icon;

            return (
              <div
                key={category}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCat(category)}
                  className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${meta.bg} ${meta.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading font-bold text-[#0b1c30] text-lg">{category}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {items.length > 0 && (
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                        {catPacked}/{items.length} packed
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Items */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-100"
                    >
                      {items.length === 0 && (
                        <p className="px-5 py-4 text-sm text-slate-400 italic">
                          No items yet. Add one below.
                        </p>
                      )}
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors group"
                        >
                          {/* Animated checkbox */}
                          <button
                            onClick={() => togglePacked.mutate({ itemId: item.id, is_packed: !item.is_packed })}
                            disabled={togglePacked.isPending}
                            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              item.is_packed
                                ? 'bg-[#E8604C] border-[#E8604C] shadow-sm shadow-[#E8604C]/30'
                                : 'border-slate-300 hover:border-[#E8604C]'
                            }`}
                          >
                            <AnimatePresence mode="wait">
                              {item.is_packed && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                >
                                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </button>

                          <span
                            className={`flex-1 text-sm font-medium transition-colors ${
                              item.is_packed ? 'line-through text-slate-400' : 'text-[#0b1c30]'
                            }`}
                          >
                            {item.name}
                          </span>

                          <button
                            onClick={() => deleteItem.mutate(item.id)}
                            disabled={deleteItem.isPending}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-30"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Inline Add */}
                      <div className="flex items-center gap-2 p-3 bg-slate-50 border-t border-slate-100">
                        <input
                          type="text"
                          placeholder={`Add to ${category}...`}
                          value={newItemText[category] || ''}
                          onChange={(e) =>
                            setNewItemText((prev) => ({ ...prev, [category]: e.target.value }))
                          }
                          onKeyDown={(e) => e.key === 'Enter' && handleAddItem(category)}
                          className="flex-1 text-sm px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8604C]/20 focus:border-[#E8604C]/40 transition-all"
                        />
                        <button
                          onClick={() => handleAddItem(category)}
                          disabled={createItem.isPending || !newItemText[category]?.trim()}
                          className="px-3 py-2 bg-[#E8604C] text-white rounded-xl text-sm font-bold hover:bg-[#d95040] transition-colors disabled:opacity-40 flex items-center gap-1"
                        >
                          {createItem.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Add New Category */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-4">
            {isAddingCat ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="New category name..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCategory();
                    if (e.key === 'Escape') setIsAddingCat(false);
                  }}
                  className="flex-1 text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8604C]/20"
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2.5 bg-[#E8604C] text-white rounded-xl text-sm font-bold hover:bg-[#d95040] transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => setIsAddingCat(false)}
                  className="p-2.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCat(true)}
                className="w-full flex items-center justify-center gap-2 text-slate-400 hover:text-[#E8604C] transition-colors py-1 text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> New Category
              </button>
            )}
          </div>

          {/* Empty State */}
          {!isLoading && allItems.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Box className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-medium text-[#0b1c30]">Start building your packing list</p>
              <p className="text-sm mt-1">Add items to each category using the inputs above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
