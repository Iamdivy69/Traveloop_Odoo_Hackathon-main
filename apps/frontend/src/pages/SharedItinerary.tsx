import { useState } from 'react';
import { Share2, Copy, Facebook, Twitter, Link as LinkIcon, MapPin, Calendar, DollarSign } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';

export default function SharedItinerary() {
  const navigate = useNavigate();
  const { activeTrip } = useStore();
  const [copied, setCopied] = useState(false);

  // Fallback data if no active trip
  const trip = activeTrip || {
    name: 'Epic Japan Adventure',
    destination: 'Tokyo, Kyoto, Osaka',
    startDate: '2025-04-10',
    endDate: '2025-04-24',
    coverImage: '/images/dest-tokyo.jpg',
    description: 'A 14-day journey through Japan covering modern cities, ancient temples, and amazing food.',
    createdBy: 'Alex Chen',
    budget: 4500,
  };

  const itineraryDays = [
    {
      day: 1,
      date: 'April 10, 2025',
      location: 'Tokyo',
      activities: [
        { time: '10:00 AM', title: 'Arrive at Narita Airport', type: 'transport' },
        { time: '02:00 PM', title: 'Check-in at Shinjuku Hotel', type: 'accommodation' },
        { time: '06:00 PM', title: 'Dinner in Omoide Yokocho', type: 'food' },
      ]
    },
    {
      day: 2,
      date: 'April 11, 2025',
      location: 'Tokyo',
      activities: [
        { time: '09:00 AM', title: 'Senso-ji Temple Visit', type: 'sightseeing' },
        { time: '01:00 PM', title: 'Lunch at Tsukiji Outer Market', type: 'food' },
        { time: '04:00 PM', title: 'Akihabara Electronics Town', type: 'shopping' },
      ]
    }
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Public Header - No sidebar, simplified navigation */}
      <header className="bg-white border-b border-[#e2e8f0] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#001b26] flex items-center justify-center">
              <span className="text-white font-bold font-heading">T</span>
            </div>
            <span className="font-bold text-[#0b1c30] font-heading tracking-tight">Traveloop</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block text-xs text-[#64748B]">
              Created by <span className="font-semibold text-[#0b1c30]">{trip.createdBy}</span>
            </span>
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-[#001b26] border border-[#e2e8f0] hover:bg-[#f1f5f9] transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#E8604C] text-white hover:bg-[#ae311e] transition-colors shadow-sm"
            >
              Copy Trip
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero Banner */}
        <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden mb-8 border border-[#e2e8f0] shadow-sm">
          <img 
            src={trip.coverImage || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1200'} 
            alt={trip.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001b26]/90 via-[#001b26]/40 to-transparent flex flex-col justify-end p-6 md:p-10">
            <h1 className="text-3xl md:text-5xl font-bold text-white font-heading mb-3">
              {trip.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {trip.destination}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {trip.startDate} to {trip.endDate}</span>
              <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Est. ₹{trip.budget}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Itinerary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-[#0b1c30] font-heading mb-3">About this trip</h2>
              <p className="text-[#64748B] text-sm leading-relaxed">
                {trip.description}
              </p>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#0b1c30] font-heading flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#E8604C]" />
                Itinerary Overview
              </h2>
              
              {itineraryDays.map((day) => (
                <div key={day.day} className="card overflow-hidden">
                  <div className="bg-[#f8fafc] border-b border-[#e2e8f0] p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-[#0b1c30] font-heading">Day {day.day}</h3>
                      <p className="text-xs text-[#64748B]">{day.date} • {day.location}</p>
                    </div>
                  </div>
                  <div className="p-0">
                    <div className="divide-y divide-[#f1f5f9]">
                      {day.activities.map((activity, idx) => (
                        <div key={idx} className="p-4 flex items-start gap-4 hover:bg-[#f8fafc] transition-colors">
                          <div className="w-20 flex-shrink-0 text-right">
                            <span className="text-xs font-semibold text-[#0b1c30]">{activity.time}</span>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-[#E8604C] mt-1.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-[#0b1c30]">{activity.title}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[#f1f5f9] text-[10px] font-medium text-[#64748B] uppercase tracking-wider">
                              {activity.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-6">
            <div className="card p-6 sticky top-24">
              <h3 className="font-bold text-[#0b1c30] font-heading mb-4 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-[#E8604C]" />
                Share this Trip
              </h3>
              
              <div className="space-y-4">
                <button 
                  onClick={handleCopyLink}
                  className={`w-full py-2.5 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    copied 
                      ? 'bg-[#ecfdf5] border-[#059669]/20 text-[#059669]' 
                      : 'border-[#e2e8f0] text-[#0b1c30] hover:bg-[#f1f5f9]'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  {copied ? 'Link Copied!' : 'Copy Link'}
                </button>
                
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 rounded-lg bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors flex items-center justify-center">
                    <Facebook className="w-4 h-4" />
                  </button>
                  <button className="flex-1 py-2.5 rounded-lg bg-[#1DA1F2]/10 text-[#1DA1F2] hover:bg-[#1DA1F2]/20 transition-colors flex items-center justify-center">
                    <Twitter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-[#e2e8f0]">
                <h3 className="font-bold text-[#0b1c30] font-heading text-sm mb-2">Like this trip?</h3>
                <p className="text-xs text-[#64748B] mb-4">
                  Copy this itinerary to your own Traveloop account and customize it for your needs.
                </p>
                <button 
                  onClick={() => navigate('/register')}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy Trip to My Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
