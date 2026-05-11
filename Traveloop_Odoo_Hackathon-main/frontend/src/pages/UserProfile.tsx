import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import {
  Edit3,
  Heart,
  CreditCard,
  Shield,
  ChevronRight,
  Mountain,
  Sparkles,
  Palmtree,
  UtensilsCrossed,
  Landmark,
  Trees,
  Plus,
  LogOut,
} from 'lucide-react';

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useStore();
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Account Info');
  const [form, setForm] = useState({
    firstName: user?.firstName || 'Alex',
    lastName: user?.lastName || 'Mercer',
    email: user?.email || 'alex.mercer@example.com',
  });
  const [activeStyles, setActiveStyles] = useState<string[]>(['Luxury']);
  const [activeInterests, setActiveInterests] = useState([
    { label: 'Food & Culinary', icon: UtensilsCrossed },
    { label: 'History & Art', icon: Landmark },
    { label: 'Nature', icon: Trees },
  ]);

  const handleSave = () => {
    updateProfile(form);
    setEditMode(false);
  };

  const handleChangePhoto = () => {
    const url = prompt('Enter new avatar URL:', user?.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200');
    if (url) updateProfile({ photo: url });
  };

  const handleChangePassword = () => {
    const p1 = prompt('Enter new password:');
    if (p1) {
      const p2 = prompt('Confirm new password:');
      if (p1 === p2) alert('Password updated successfully!');
      else alert('Passwords do not match.');
    }
  };

  const toggleStyle = (label: string) => {
    setActiveStyles(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const handleAddInterest = () => {
    const interest = prompt('Enter a new interest:');
    if (interest) {
      setActiveInterests(prev => [...prev, { label: interest, icon: Sparkles }]);
    }
  };

  const handleRemoveInterest = (label: string) => {
    setActiveInterests(prev => prev.filter(i => i.label !== label));
  };

  const travelStyles = [
    { label: 'Luxury', icon: Sparkles },
    { label: 'Adventure', icon: Mountain },
    { label: 'Relaxation', icon: Palmtree },
  ];

  const menuItems = [
    { label: 'Account Info', icon: Edit3, color: '#3b82f6' },
    { label: 'My Saved Places', icon: Heart, color: '#E8604C' },
    { label: 'Payment Methods', icon: CreditCard, color: '#001b26' },
    { label: 'Privacy & Security', icon: Shield, color: '#059669' },
  ];

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading">Profile & Settings</h1>
        <p className="text-[#64748B] text-sm mt-1">Manage your account details and travel preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Avatar Card */}
          <div className="card p-6 text-center">
            <div className="relative w-28 h-28 mx-auto mb-4">
              <img
                src={user?.photo || '/images/user-avatar.jpg'}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
              <button 
                onClick={handleChangePhoto}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#001b26] flex items-center justify-center text-white shadow-md hover:bg-[#0d313f] transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
            <h2 className="text-lg font-bold text-[#0b1c30] font-heading">
              {user?.firstName || 'Alex'} {user?.lastName || 'Mercer'}
            </h2>
            <p className="text-sm text-[#64748B] mt-1">{user?.bio || 'Global Explorer & Food Enthusiast'}</p>
            <p className="text-xs text-[#94a3b8] mt-2">{user?.city || 'San Francisco'}, CA • Joined 2022</p>
          </div>

          {/* Quick Menu */}
          <div className="card divide-y divide-[#f1f5f9]">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center gap-3 p-4 hover:bg-[#f8fafc] transition-colors text-left ${activeTab === item.label ? 'bg-[#f8fafc] border-l-2 border-[#E8604C]' : 'border-l-2 border-transparent'}`}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${item.color}10` }}>
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                </div>
                <span className="flex-1 text-sm font-medium text-[#0b1c30]">{item.label}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === item.label ? 'text-[#E8604C]' : 'text-[#94a3b8]'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'Account Info' && (
            <>
              {/* Account Info */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-[#0b1c30] font-heading mb-6">Account Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  disabled={!editMode}
                  className="input-field disabled:bg-[#f8fafc] disabled:text-[#64748B]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  disabled={!editMode}
                  className="input-field disabled:bg-[#f8fafc] disabled:text-[#64748B]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled={!editMode}
                  className="input-field disabled:bg-[#f8fafc] disabled:text-[#64748B]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[#64748B] mb-1.5 block">Password</label>
                <div className="flex items-center gap-3">
                  <input
                    type="password"
                    value="••••••••"
                    disabled
                    className="input-field flex-1 disabled:bg-[#f8fafc] disabled:text-[#64748B]"
                  />
                  <button onClick={handleChangePassword} className="text-sm font-medium text-[#64748B] hover:text-[#0b1c30] transition-colors">Change</button>
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              {editMode ? (
                <div className="flex gap-3">
                  <button onClick={() => setEditMode(false)} className="btn-secondary py-2.5 text-sm">Cancel</button>
                  <button onClick={handleSave} className="btn-primary py-2.5 text-sm">Save Changes</button>
                </div>
              ) : (
                <button onClick={() => setEditMode(true)} className="btn-primary py-2.5 text-sm">
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {/* Travel Preferences */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-[#0b1c30] font-heading mb-4">Travel Preferences</h3>
            
            <div className="mb-5">
              <p className="text-sm font-semibold text-[#0b1c30] mb-3">Preferred Travel Style</p>
              <div className="flex flex-wrap gap-2">
                {travelStyles.map((style) => (
                  <button
                    key={style.label}
                    onClick={() => toggleStyle(style.label)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      activeStyles.includes(style.label)
                        ? 'bg-[#001b26] text-white shadow-md'
                        : 'bg-white text-[#64748B] border border-[#e2e8f0] hover:bg-[#f1f5f9]'
                    }`}
                  >
                    <style.icon className="w-4 h-4" />
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-[#0b1c30] mb-3">Interests</p>
              <div className="flex flex-wrap gap-2">
                {activeInterests.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleRemoveInterest(item.label)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white text-[#64748B] border border-[#e2e8f0] hover:border-[#E8604C] hover:text-[#E8604C] transition-colors group"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                    <span className="w-4 h-4 ml-1 rounded-full bg-[#f1f5f9] group-hover:bg-[#E8604C]/10 flex items-center justify-center text-[10px]">×</span>
                  </button>
                ))}
                <button 
                  onClick={handleAddInterest}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-[#94a3b8] border border-dashed border-[#e2e8f0] hover:bg-[#f1f5f9] hover:text-[#64748B] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Interest
                </button>
              </div>
            </div>
          </div>
          </>
          )}

          {activeTab !== 'Account Info' && (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-[#f1f5f9] rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-[#94a3b8]" />
              </div>
              <h3 className="text-xl font-bold text-[#0b1c30] font-heading">{activeTab}</h3>
              <p className="text-[#64748B] mt-2">This settings module will be available in the next platform update.</p>
            </div>
          )}

          {/* Mobile Logout Action */}
          <div className="md:hidden pt-4">
            <button 
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full bg-white border border-[#e2e8f0] hover:border-[#E8604C]/30 hover:bg-[#fef2f2] text-[#E8604C] py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
