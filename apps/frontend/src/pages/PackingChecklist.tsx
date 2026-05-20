import { useState } from 'react';
import { useStore } from '../store/useStore';
import {
  Check,
  RotateCcw,
  Share2,
  ChevronDown,
  ChevronUp,
  FileText,
  Shirt,
  Smartphone,
  Droplets,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

const categoryIcons: Record<string, React.ElementType> = {
  Documents: FileText,
  Clothing: Shirt,
  Electronics: Smartphone,
  Toiletries: Droplets,
};

export default function PackingChecklist() {
  const { checklist, toggleChecklistItem, addChecklistItem, resetChecklist, activeTrip } = useStore();
  const [searchQuery] = useState('');
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState('Documents');
  const [sharedMode, setSharedMode] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Documents: true,
    Clothing: true,
    Electronics: true,
    Toiletries: true,
  });

  const categories = [...new Set(checklist.map((item) => item.category))];

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    addChecklistItem({ name: newItem, packed: false, category: newCategory });
    setNewItem('');
  };

  const packedCount = checklist.filter((i) => i.packed).length;
  const totalCount = checklist.length;
  const progress = totalCount ? Math.round((packedCount / totalCount) * 100) : 0;

  return (
    <div className="page-transition max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-primary text-[10px]">TOKYO 2024</span>
            <span className="badge bg-[#f1f5f9] text-[#64748B] text-[10px]">7 DAYS</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading">Packing Checklist</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <span className="font-medium">Shared Checklist</span>
            <button onClick={() => setSharedMode(!sharedMode)} className="text-[#E8604C]">
              {sharedMode ? <ToggleRight className="w-8 h-5" /> : <ToggleLeft className="w-8 h-5" />}
            </button>
          </div>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#E8604C] border-2 border-white flex items-center justify-center text-white text-xs font-bold">JS</div>
            <div className="w-8 h-8 rounded-full bg-[#001b26] border-2 border-white flex items-center justify-center text-white text-xs font-bold">AL</div>
          </div>
        </div>
      </div>

      <div className="border-b border-[#e2e8f0] mb-8" />

      {/* Destination Image Banner */}
      <div className="relative rounded-3xl overflow-hidden h-64 mb-8 shadow-sm">
        <img src={activeTrip?.coverImage || '/images/dest-tokyo.jpg'} alt="Destination" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#001b26]/90 via-[#001b26]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col sm:flex-row justify-between items-end gap-4">
          <div>
            <h3 className="text-3xl sm:text-4xl font-black text-white font-heading tracking-tight drop-shadow-md">
              {activeTrip?.destination || 'Tokyo'} Awaits
            </h3>
            <p className="text-white/90 text-sm mt-2 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Expected weather: 65°F - 75°F. Perfect for light layers.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={resetChecklist} className="btn-secondary py-2.5 px-5 text-sm bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md transition-all">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button className="btn-secondary py-2.5 px-5 text-sm bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Trip Readiness & Quick Add */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 md:col-span-2">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-[#0b1c30] font-heading">Trip Readiness</h2>
              <p className="text-sm text-[#64748B] mt-0.5">You're making good progress. {packedCount} of {totalCount} items packed.</p>
            </div>
            <span className="text-4xl font-bold text-[#E8604C] font-heading tracking-tighter">{progress}%</span>
          </div>
          <div className="h-3 bg-[#f1f5f9] rounded-full overflow-hidden mt-4">
            <div className="h-full bg-gradient-to-r from-[#E8604C] to-[#f48a7b] rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="card p-6 bg-[#f8fafc] border-[#f1f5f9] flex flex-col justify-center">
          <h3 className="text-sm font-bold text-[#0b1c30] mb-3 uppercase tracking-widest">Quick Add</h3>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Item name..."
              className="input-field py-2 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <div className="flex gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="input-field flex-1 py-2 text-sm"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button onClick={handleAddItem} className="btn-primary text-sm py-2 px-4 shadow-sm">Add</button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid (Card Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {categories.map((category) => {
          const items = checklist.filter(
            (item) =>
              item.category === category &&
              (!searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()))
          );
          if (items.length === 0) return null;

          const catPacked = items.filter((i) => i.packed).length;
          const isExpanded = expandedCategories[category] !== false;
          const CatIcon = categoryIcons[category] || FileText;

          return (
            <div key={category} className="card overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-[#f8fafc] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#fff5f4] flex items-center justify-center text-[#E8604C]">
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#0b1c30] font-heading text-lg tracking-tight">{category}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge bg-[#f1f5f9] text-[#0b1c30] font-bold text-xs">{catPacked}/{items.length} Packed</span>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-[#94a3b8]" /> : <ChevronDown className="w-5 h-5 text-[#94a3b8]" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-[#f1f5f9] bg-white flex-1 flex flex-col">
                  <div className="flex-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 p-4 hover:bg-[#f8fafc] transition-colors border-b border-[#f1f5f9] last:border-0"
                      >
                        <button
                          onClick={() => toggleChecklistItem(item.id)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 mt-0.5 ${
                            item.packed
                              ? 'bg-[#E8604C] border-[#E8604C]'
                              : 'border-[#e2e8f0] hover:border-[#E8604C]'
                          }`}
                        >
                          {item.packed && <Check className="w-4 h-4 text-white" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <span className={`block text-sm font-medium leading-tight ${item.packed ? 'line-through text-[#94a3b8]' : 'text-[#0b1c30]'}`}>
                            {item.name}
                          </span>
                          {item.name.includes('Insurance') && (
                            <span className="inline-flex mt-2 badge badge-error text-[10px] px-2 py-0.5">
                              <AlertTriangle className="w-3 h-3" /> High Priority
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
