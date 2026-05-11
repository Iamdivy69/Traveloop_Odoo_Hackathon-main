import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Plus,
  Calendar,
  DollarSign,
  Trash2,
  GripVertical,
  Save,
  X,
  ChevronDown,
  MapPin,
} from 'lucide-react';

export default function BuildItinerary() {
  const navigate = useNavigate();
  const { trips, activeTrip, setActiveTrip } = useStore();
  const [sections, setSections] = useState(
    activeTrip?.sections || []
  );
  const [showAdd, setShowAdd] = useState(false);
  const [newSection, setNewSection] = useState({
    title: '',
    description: '',
    dateRange: '',
    budget: '',
  });

  useEffect(() => {
    if (activeTrip) {
      setSections(activeTrip.sections || []);
    }
  }, [activeTrip]);

  const handleAddSection = () => {
    if (!newSection.title) return;
    const section = {
      id: Date.now().toString(),
      title: newSection.title,
      description: newSection.description,
      dateRange: newSection.dateRange,
      budget: Number(newSection.budget) || 0,
    };
    setSections([...sections, section]);
    setNewSection({ title: '', description: '', dateRange: '', budget: '' });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const handleSave = () => {
    if (activeTrip) {
      setActiveTrip({ ...activeTrip, sections });
    }
    navigate('/itinerary/view');
  };

  const totalBudget = sections.reduce((sum, s) => sum + s.budget, 0);

  return (
    <div className="page-transition max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-[#94a3b8] text-xs font-bold uppercase tracking-widest">
            <MapPin className="w-3.5 h-3.5" />
            <span>Itinerary Designer</span>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#E8604C]">
                <Calendar className="w-4 h-4" />
              </div>
              <select
                value={activeTrip?.id || ''}
                onChange={(e) => {
                  const trip = trips.find((t) => t.id === e.target.value);
                  if (trip) setActiveTrip(trip);
                }}
                className="appearance-none bg-white border border-[#e2e8f0] text-[#0b1c30] text-sm font-semibold rounded-2xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-4 focus:ring-[#E8604C]/10 focus:border-[#E8604C] transition-all cursor-pointer shadow-sm hover:shadow-md min-w-[200px]"
              >
                <option value="" disabled>Select a Trip</option>
                {trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#94a3b8]">
                <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </div>
            </div>
          </div>
          <p className="text-[#64748B] text-sm mt-1">
            {sections.length} sections • Total budget: ₹{totalBudget.toLocaleString()}
          </p>
        </div>
        <button onClick={handleSave} className="btn-primary">
          <Save className="w-4 h-4" />
          Save Itinerary
        </button>
      </div>

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className="card p-5 group"
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 text-[#e2e8f0] cursor-grab opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-5 h-5" />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#001b26] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-[#0b1c30] font-heading">{section.title}</h3>
                  <button
                    onClick={() => handleDelete(section.id)}
                    className="p-1.5 rounded-lg text-[#94a3b8] hover:text-[#dc2626] hover:bg-[#fef2f2] transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-[#64748B] mb-3">{section.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-[#94a3b8]">
                    <Calendar className="w-3.5 h-3.5" />
                    {section.dateRange}
                  </span>
                  <span className="flex items-center gap-1.5 text-[#E8604C] font-medium">
                    <DollarSign className="w-3.5 h-3.5" />
                    ₹{section.budget.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Section */}
      {!showAdd ? (
        <button
          onClick={() => setShowAdd(true)}
          className="w-full mt-6 py-4 border-2 border-dashed border-[#e2e8f0] rounded-2xl text-[#94a3b8] hover:border-[#E8604C] hover:text-[#E8604C] transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Another Section
        </button>
      ) : (
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0b1c30] font-heading">New Section</h3>
            <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={newSection.title}
              onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
              placeholder="Section title (e.g., Hotel Stay, Flight, Activity)"
              className="input-field"
            />
            <textarea
              rows={2}
              value={newSection.description}
              onChange={(e) => setNewSection({ ...newSection, description: e.target.value })}
              placeholder="Description of this section..."
              className="input-field resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={newSection.dateRange}
                onChange={(e) => setNewSection({ ...newSection, dateRange: e.target.value })}
                placeholder="Date range (e.g., Jun 10-14)"
                className="input-field"
              />
              <input
                type="number"
                value={newSection.budget}
                onChange={(e) => setNewSection({ ...newSection, budget: e.target.value })}
                placeholder="Budget (₹)"
                className="input-field"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleAddSection} className="btn-primary text-sm">
                <Plus className="w-4 h-4" />
                Add Section
              </button>
              <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
