import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { destinations } from '../data/destinations';
import Select from 'react-select';
import { Country, City } from 'country-state-city';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Camera,
  Plus,
  Sparkles,
} from 'lucide-react';

const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: '46px',
    borderRadius: '0.75rem',
    borderWidth: '1px',
    borderColor: state.isFocused ? 'transparent' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(0, 27, 38, 0.08)' : '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    '&:hover': {
      borderColor: state.isFocused ? 'transparent' : '#94a3b8',
    },
    backgroundColor: '#ffffff',
    transition: 'all 0.2s',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#001b26' : state.isFocused ? '#f1f5f9' : 'white',
    color: state.isSelected ? '#ffffff' : '#0b1c30',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#001b26',
      color: '#ffffff',
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e2e8f0',
    zIndex: 50,
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#0b1c30',
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#94a3b8',
  }),
};

export default function CreateTrip() {
  const navigate = useNavigate();
  const createTrip = useStore((s) => s.createTrip);
  const [form, setForm] = useState({
    name: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  
  const [selectedCountry, setSelectedCountry] = useState<{ value: string; label: string } | null>(null);
  const [selectedCity, setSelectedCity] = useState<{ value: string; label: string } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [step, setStep] = useState(1);

  const countryOptions = useMemo(() => 
    Country.getAllCountries().map((c) => ({
      value: c.isoCode,
      label: c.name,
    })), 
  []);

  const cityOptions = useMemo(() => 
    selectedCountry
      ? City.getCitiesOfCountry(selectedCountry.value)?.map((c) => ({
          value: c.name,
          label: c.name,
        })) || []
      : [],
  [selectedCountry]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.destination || !form.startDate || !form.endDate) return;
    const dest = destinations.find((d) => form.destination.includes(d.name));
    createTrip({
      name: form.name,
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      description: form.description,
      coverImage: dest?.image || '/images/dest-paris.jpg',
      status: 'upcoming',
      budget: 5000,
      spent: 0,
      createdBy: 'James Wilson',
    });
    navigate('/trips');
  };

  const suggestions = destinations.filter((d) =>
    !selectedPlace || d.name !== selectedPlace
  );

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-transition max-w-3xl">
      <div>
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-[#94a3b8] hover:text-[#0b1c30] mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="card overflow-hidden">
          {/* Progress Steps */}
          <div className="flex border-b border-[#f1f5f9]">
            {['Trip Details', 'Dates & Place', 'Suggestions'].map((label, i) => (
              <div
                key={label}
                className={`flex-1 py-4 text-center text-sm font-medium transition-colors ${
                  step >= i + 1 ? 'text-[#E8604C] border-b-2 border-[#E8604C]' : 'text-[#94a3b8]'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs mr-2 ${
                  step >= i + 1 ? 'bg-[#E8604C] text-white' : 'bg-[#f1f5f9] text-[#94a3b8]'
                }`}>
                  {i + 1}
                </span>
                {label}
              </div>
            ))}
          </div>

          <div className="p-6 lg:p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0b1c30] font-heading mb-1">Name your trip</h2>
                  <p className="text-[#64748B] text-sm">Give your adventure a memorable name</p>
                </div>

                {/* Cover Photo Upload */}
                <div className="border-2 border-dashed border-[#e2e8f0] rounded-2xl p-8 text-center hover:border-[#E8604C]/40 transition-colors cursor-pointer">
                  <Camera className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Upload a cover photo</p>
                  <p className="text-xs text-gray-400 mt-1">Optional</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Trip Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., European Adventure 2025"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#64748B] mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Brief description of your trip..."
                    className="input-field resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setStep(2)}
                    disabled={!form.name}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0b1c30] font-heading mb-1">When and where?</h2>
                  <p className="text-[#64748B] text-sm">Set your travel dates and destination</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Country *
                    </label>
                    <Select
                      options={countryOptions}
                      value={selectedCountry}
                      onChange={(option) => {
                        setSelectedCountry(option);
                        setSelectedCity(null);
                        handleChange('destination', '');
                        setSelectedPlace('');
                      }}
                      styles={customSelectStyles}
                      placeholder="Search country..."
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <MapPin className="w-4 h-4 inline mr-1 text-transparent" />
                      City *
                    </label>
                    <Select
                      options={cityOptions}
                      value={selectedCity}
                      onChange={(option) => {
                        setSelectedCity(option);
                        const dest = option ? `${option.label}, ${selectedCountry?.label}` : '';
                        handleChange('destination', dest);
                        setSelectedPlace(option?.label || '');
                      }}
                      isDisabled={!selectedCountry}
                      styles={customSelectStyles}
                      placeholder={selectedCountry ? "Search city..." : "Select country first"}
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      min={today}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      min={form.startDate || today}
                      onChange={(e) => handleChange('endDate', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button onClick={() => setStep(1)} className="btn-secondary">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => { setStep(3); setShowSuggestions(true); }}
                    disabled={!form.destination || !form.startDate || !form.endDate}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0b1c30] font-heading mb-1">Suggested Activities</h2>
                  <p className="text-[#64748B] text-sm">
                    Popular activities in {selectedPlace || form.destination || 'your destination'}
                  </p>
                </div>

                {showSuggestions && selectedPlace && (
                  <div className="bg-[#E8604C]/5 rounded-xl p-4 border border-[#E8604C]/15">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-[#E8604C] mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-[#0b1c30]">
                          AI-powered suggestions for {selectedPlace}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Based on your destination, here are recommended activities and experiences.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {suggestions.slice(0, 5).map((dest) => (
                    <div
                      key={dest.id}
                      className="flex items-center gap-4 p-3 rounded-xl border border-[#e2e8f0] hover:border-[#E8604C]/30 hover:bg-[#E8604C]/5 transition-all cursor-pointer"
                    >
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-[#1a1a1a]">{dest.name}</h4>
                        <p className="text-sm text-gray-500">{dest.activities.slice(0, 3).join(', ')}</p>
                      </div>
                      <button className="p-2 rounded-full bg-[#E8604C]/10 text-[#E8604C] hover:bg-[#E8604C]/20">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button onClick={() => setStep(2)} className="btn-secondary">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button onClick={handleSubmit} className="btn-primary">
                    <Plus className="w-4 h-4" />
                    Create Trip
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
