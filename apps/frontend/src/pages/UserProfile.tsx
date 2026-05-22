import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/authStore';
import {
  useMyProfile,
  useUpdateProfile,
  useUpdateUsername,
  useCheckUsername,
} from '../hooks/useProfile';
import api from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
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
  User as UserIcon,
  Globe,
  Coins,
  Lock,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Camera,
  MapPin,
} from 'lucide-react';

const isUsernameValid = (username: string) => {
  if (username.length < 3 || username.length > 30) return false;
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(username);
};

export default function UserProfile() {
  const navigate = useNavigate();
  const { updateProfile: syncMockProfile } = useStore();
  const { fetchMe, logout } = useAuthStore();

  // Queries & Mutations
  const { data: profile, isLoading: isProfileLoading, isError: isProfileError, error: profileError } = useMyProfile();
  const updateProfileMutation = useUpdateProfile();
  const updateUsernameMutation = useUpdateUsername();

  // Edit Mode & State Management
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('Account Info');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    photoUrl: '',
    preferredCurrency: 'INR',
    isPublic: true,
  });

  const [usernameInput, setUsernameInput] = useState('');
  const [debouncedUsername, setDebouncedUsername] = useState('');

  // Password Change State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Travel Styles and Interests (Mocked visual enhancements)
  const [activeStyles, setActiveStyles] = useState<string[]>(['Luxury']);
  const [activeInterests, setActiveInterests] = useState([
    { label: 'Food & Culinary', icon: UtensilsCrossed },
    { label: 'History & Art', icon: Landmark },
    { label: 'Nature', icon: Trees },
  ]);

  const travelStyles = [
    { label: 'Luxury', icon: Sparkles },
    { label: 'Adventure', icon: Mountain },
    { label: 'Relaxation', icon: Palmtree },
  ];

  // Preset avatars for quick select
  const avatarPresets = [
    { name: 'Jetsetter', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200' },
    { name: 'Backpacker', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200' },
    { name: 'Beach Lover', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200' },
    { name: 'Explorer', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
  ];

  // Sync Form state with Backend Profile
  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        bio: profile.bio || '',
        photoUrl: profile.photo_url || '',
        preferredCurrency: profile.preferred_currency || 'INR',
        isPublic: profile.is_public ?? true,
      });
      setUsernameInput(profile.username || '');
      setDebouncedUsername(profile.username || '');
    }
  }, [profile]);

  // Handle Username debounce check
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUsername(usernameInput);
    }, 450);

    return () => {
      clearTimeout(handler);
    };
  }, [usernameInput]);

  // Username validation and query triggers
  const isDifferentUsername = profile?.username?.toLowerCase() !== debouncedUsername.trim().toLowerCase();
  const isFormatValid = debouncedUsername.trim() === '' || isUsernameValid(debouncedUsername);
  
  const checkUsernameQuery = useCheckUsername(
    isDifferentUsername && isFormatValid && debouncedUsername.trim().length >= 3 ? debouncedUsername : ''
  );

  // Save changes handler
  const handleSave = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      if (!form.firstName.trim()) {
        throw new Error('First name is required');
      }
      if (!form.lastName.trim()) {
        throw new Error('Last name is required');
      }

      const cleanUsername = usernameInput.trim();
      
      // 1. If username changed, validate and update first
      if (cleanUsername.toLowerCase() !== (profile?.username || '').toLowerCase()) {
        if (!isUsernameValid(cleanUsername)) {
          throw new Error('Username must be 3-30 characters, alphanumeric & underscores, and cannot start with a number');
        }
        
        // Wait a small moment to ensure the query has completed
        if (checkUsernameQuery.data && !checkUsernameQuery.data.available) {
          throw new Error('Username is already taken');
        }

        await updateUsernameMutation.mutateAsync(cleanUsername);
      }

      // 2. Update core profile fields
      await updateProfileMutation.mutateAsync({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        bio: form.bio.trim() || null,
        photo_url: form.photoUrl.trim() || null,
        preferred_currency: form.preferredCurrency,
        is_public: form.isPublic,
      });

      // 3. Sync local zustand store and auth session
      syncMockProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        bio: form.bio,
        photo: form.photoUrl,
      });
      await fetchMe();

      setSuccessMessage('Profile updated successfully!');
      setEditMode(false);
      
      // Auto-clear success message
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || err.response?.data?.error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Password update handler
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    setIsUpdatingPassword(true);

    try {
      if (!passwordForm.currentPassword) {
        throw new Error('Current password is required');
      }
      if (passwordForm.newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters');
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('Confirm password does not match');
      }

      await api.patch('/users/me/password', {
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      });

      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      setTimeout(() => {
        setShowPasswordChange(false);
        setPasswordSuccess(null);
      }, 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.error?.message || err.message || 'Failed to change password');
    } finally {
      setIsUpdatingPassword(false);
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

  // Quick helper to render username checking micro-indicators
  const renderUsernameIndicator = () => {
    const cleanInput = usernameInput.trim();
    if (!cleanInput) return null;
    if (cleanInput.toLowerCase() === (profile?.username || '').toLowerCase()) {
      return (
        <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" /> Your current username
        </span>
      );
    }
    if (!isUsernameValid(cleanInput)) {
      return (
        <span className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
          <XCircle className="w-3.5 h-3.5" /> Must be 3-30 chars, start with a letter, alphanumeric/underscores only
        </span>
      );
    }
    
    // Real-time checks
    if (checkUsernameQuery.isLoading) {
      return (
        <span className="text-xs text-[#64748B] flex items-center gap-1.5 mt-1 font-medium">
          <Loader2 className="w-3 h-3 animate-spin text-[#E8604C]" /> Checking availability...
        </span>
      );
    }

    if (checkUsernameQuery.data) {
      if (checkUsernameQuery.data.available) {
        return (
          <span className="text-xs text-emerald-600 flex items-center gap-1 mt-1 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Username is available!
          </span>
        );
      } else {
        return (
          <span className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
            <XCircle className="w-3.5 h-3.5" /> Username is already taken
          </span>
        );
      }
    }
    return null;
  };

  const menuItems = [
    { label: 'Account Info', icon: UserIcon, color: '#3b82f6' },
    { label: 'My Saved Places', icon: Heart, color: '#E8604C' },
    { label: 'Payment Methods', icon: CreditCard, color: '#0f172a' },
    { label: 'Privacy & Security', icon: Shield, color: '#059669' },
  ];

  if (isProfileLoading) {
    return (
      <div className="page-transition p-6 lg:p-8 space-y-8">
        {/* Banner Skeleton */}
        <div className="h-44 bg-slate-200 animate-pulse rounded-2xl w-full" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center space-y-4">
              <div className="w-24 h-24 bg-slate-200 animate-pulse rounded-full mx-auto" />
              <div className="h-5 bg-slate-200 animate-pulse rounded w-1/2 mx-auto" />
              <div className="h-4 bg-slate-200 animate-pulse rounded w-3/4 mx-auto" />
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-10 bg-slate-100 animate-pulse rounded-lg" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-6">
              <div className="h-6 bg-slate-200 animate-pulse rounded w-1/4" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
                <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
              </div>
              <div className="h-28 bg-slate-100 animate-pulse rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isProfileError) {
    return (
      <div className="page-transition flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto">
        <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold text-[#0b1c30] font-heading">Failed to Load Profile</h2>
        <p className="text-[#64748B] mt-2 mb-6">
          {profileError?.message || 'An error occurred while fetching your profile details. Please try again.'}
        </p>
        <button onClick={() => navigate(0)} className="btn-primary">
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="page-transition">
      {/* Upper Cover Banner Area */}
      <div className="relative h-44 rounded-2xl overflow-hidden mb-8 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-r from-[#001b26] via-[#0d313f] to-[#e8604c]/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(232,96,76,0.15),transparent_45%)]" />
        <div className="absolute bottom-4 left-6 md:left-8 text-white z-10 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#E8604C] animate-pulse" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-heading tracking-tight">Voyager Intelligence</h1>
            <p className="text-xs text-slate-300 font-medium font-body">Tailored preferences and authentic social profile setup.</p>
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs text-white font-semibold tracking-wide">
          {profile?.is_admin ? '🛡️ System Administrator' : '🎒 Explorer Level 1'}
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Card & Quick Navigation Menu */}
        <div className="space-y-6">
          {/* Main User Card */}
          <div className="card p-6 relative overflow-hidden">
            {/* Background Accent Gradients */}
            <div className="absolute -right-16 -top-16 w-36 h-36 rounded-full bg-[#E8604C]/5 blur-2xl" />
            <div className="absolute -left-16 -bottom-16 w-36 h-36 rounded-full bg-[#3b82f6]/5 blur-2xl" />

            <div className="text-center relative z-10">
              {/* Profile Avatar with Hover and Interactive Edit triggers */}
              <div className="relative w-28 h-28 mx-auto mb-4 group">
                <img
                  src={form.photoUrl || '/images/user-avatar.jpg'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200';
                  }}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl transition-all duration-300 group-hover:scale-105"
                />
                
                {editMode && (
                  <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                    <Camera className="w-5 h-5 mb-1 text-slate-200" />
                    <span className="text-[10px] font-bold tracking-wider uppercase text-slate-300">Edit Photo</span>
                  </div>
                )}
              </div>

              {/* Display Names */}
              <h2 className="text-xl font-bold text-[#0b1c30] font-heading flex items-center justify-center gap-1.5">
                {profile?.first_name} {profile?.last_name}
              </h2>
              
              {/* User Bio */}
              <p className="text-sm text-[#64748B] mt-1.5 font-medium italic max-w-xs mx-auto">
                {profile?.bio || 'Global Explorer & Travel Enthusiast'}
              </p>

              {/* Username & visibility tags */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                <span className="bg-slate-100 text-[#0b1c30] text-xs font-bold px-3 py-1 rounded-full">
                  @{profile?.username || 'no_username'}
                </span>
                
                {profile?.is_public ? (
                  <span className="badge badge-success flex items-center gap-1 text-[11px] font-bold py-1 px-2.5 shadow-sm">
                    <Globe className="w-3 h-3" /> Public
                  </span>
                ) : (
                  <span className="badge badge-coral flex items-center gap-1 text-[11px] font-bold py-1 px-2.5 shadow-sm">
                    <Lock className="w-3 h-3" /> Private
                  </span>
                )}
              </div>

              {/* Metadata Details */}
              <div className="border-t border-[#f1f5f9] mt-5 pt-4 flex flex-col gap-2 text-xs text-[#94a3b8] font-medium font-body items-center">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {profile?.city || 'Unknown City'}, {profile?.country || 'Unknown Country'}
                </span>
                <span>
                  Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '2026'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Menu Settings Options */}
          <div className="card divide-y divide-[#f1f5f9] overflow-hidden">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setActiveTab(item.label);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`w-full flex items-center gap-3.5 p-4 hover:bg-slate-50/80 transition-all text-left ${activeTab === item.label ? 'bg-slate-50/80 border-l-4 border-[#E8604C] font-semibold' : 'border-l-4 border-transparent'}`}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${item.color}10` }}>
                  <item.icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                </div>
                <span className="flex-1 text-sm font-semibold text-[#0b1c30] font-heading">{item.label}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === item.label ? 'text-[#E8604C] translate-x-1' : 'text-[#94a3b8]'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Tab Content & Interactive Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Localized Toast Alerts */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-sm border border-emerald-100 flex items-center gap-2.5 shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="font-semibold">{successMessage}</span>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 rounded-xl bg-rose-50 text-rose-800 text-sm border border-rose-100 flex items-center gap-2.5 shadow-sm"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span className="font-semibold">{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* TAB 1: Account Information */}
          {activeTab === 'Account Info' && (
            <div className="card p-6 space-y-6 relative overflow-hidden">
              <div className="border-b border-[#f1f5f9] pb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-[#0b1c30] font-heading">Account Information</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">Manage your identity, visibility and core ledger preferences.</p>
                </div>

                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditMode(false);
                        setErrorMessage(null);
                        // Reset form to backend state
                        if (profile) {
                          setForm({
                            firstName: profile.first_name || '',
                            lastName: profile.last_name || '',
                            bio: profile.bio || '',
                            photoUrl: profile.photo_url || '',
                            preferredCurrency: profile.preferred_currency || 'INR',
                            isPublic: profile.is_public ?? true,
                          });
                          setUsernameInput(profile.username || '');
                        }
                      }}
                      disabled={isSaving}
                      className="btn-secondary py-2 px-3 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || (isDifferentUsername && (!isFormatValid || checkUsernameQuery.data?.available === false))}
                      className="btn-primary py-2 px-3 text-xs flex items-center gap-1.5"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Core Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* First Name */}
                <div>
                  <label className="input-label block font-bold text-xs tracking-wider uppercase text-[#64748B] mb-2">First Name</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    disabled={!editMode || isSaving}
                    placeholder="Enter first name"
                    className="input-field disabled:bg-[#f8fafc] disabled:text-[#64748B] font-medium"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="input-label block font-bold text-xs tracking-wider uppercase text-[#64748B] mb-2">Last Name</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    disabled={!editMode || isSaving}
                    placeholder="Enter last name"
                    className="input-field disabled:bg-[#f8fafc] disabled:text-[#64748B] font-medium"
                  />
                </div>

                {/* Bio / Description */}
                <div className="md:col-span-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="input-label font-bold text-xs tracking-wider uppercase text-[#64748B]">Personal Bio</label>
                    {editMode && (
                      <span className="text-[10px] text-slate-400 font-bold font-body">
                        {form.bio.length}/200 chars
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={3}
                    maxLength={200}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    disabled={!editMode || isSaving}
                    placeholder="Tell other travelers about your adventures and favorite cities..."
                    className="input-field disabled:bg-[#f8fafc] disabled:text-[#64748B] font-medium resize-none"
                  />
                </div>

                {/* Username Input with live checks */}
                <div>
                  <label className="input-label block font-bold text-xs tracking-wider uppercase text-[#64748B] mb-2">Social Username</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</div>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      disabled={!editMode || isSaving}
                      placeholder="username"
                      className="input-field pl-8 disabled:bg-[#f8fafc] disabled:text-[#64748B] font-bold text-slate-700"
                    />
                  </div>
                  {renderUsernameIndicator()}
                </div>

                {/* Preferred Currency Selector */}
                <div>
                  <label className="input-label block font-bold text-xs tracking-wider uppercase text-[#64748B] mb-2">Preferred Currency</label>
                  <div className="relative">
                    <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={form.preferredCurrency}
                      onChange={(e) => setForm({ ...form, preferredCurrency: e.target.value })}
                      disabled={!editMode || isSaving}
                      className="input-field pl-10 disabled:bg-[#f8fafc] disabled:text-[#64748B] font-semibold text-[#0b1c30] appearance-none"
                    >
                      <option value="INR">INR (₹) Indian Rupee</option>
                      <option value="USD">USD ($) United States Dollar</option>
                      <option value="EUR">EUR (€) Euro</option>
                      <option value="GBP">GBP (£) Great British Pound</option>
                      <option value="AED">AED (د.إ) UAE Dirham</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#0b1c30]">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>

                {/* Avatar URL Edit and quick presets */}
                {editMode && (
                  <div className="md:col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-3">
                    <label className="input-label font-bold text-xs tracking-wider uppercase text-[#64748B]">Profile Avatar URL</label>
                    <input
                      type="text"
                      value={form.photoUrl}
                      onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                      placeholder="Paste any high-resolution unsplash or avatar image URL"
                      className="input-field text-xs"
                    />
                    
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Or select a travel avatar preset:</span>
                      <div className="flex gap-3 flex-wrap">
                        {avatarPresets.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => setForm({ ...form, photoUrl: preset.url })}
                            className={`flex items-center gap-1.5 px-3 py-1.5 bg-white border rounded-lg text-xs font-semibold hover:border-[#E8604C] transition-colors ${form.photoUrl === preset.url ? 'border-2 border-[#E8604C] text-[#E8604C]' : 'border-slate-200'}`}
                          >
                            <img src={preset.url} alt="" className="w-5 h-5 rounded-full object-cover" />
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Visibility Card Toggle */}
                <div className="md:col-span-2">
                  <label className="input-label block font-bold text-xs tracking-wider uppercase text-[#64748B] mb-3">Privacy & Social Discoverability</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => editMode && setForm({ ...form, isPublic: true })}
                      disabled={!editMode}
                      className={`flex flex-col p-4 rounded-xl border text-left transition-all ${form.isPublic ? 'bg-white border-[#E8604C] shadow-sm' : 'bg-slate-50/50 border-slate-200 opacity-60'} ${!editMode && 'cursor-not-allowed'}`}
                    >
                      <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-emerald-600" /> Public Profile
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">Your profile details, social handles, and public trip itineraries are discoverable.</span>
                    </button>

                    <button
                      onClick={() => editMode && setForm({ ...form, isPublic: false })}
                      disabled={!editMode}
                      className={`flex flex-col p-4 rounded-xl border text-left transition-all ${!form.isPublic ? 'bg-white border-[#E8604C] shadow-sm' : 'bg-slate-50/50 border-slate-200 opacity-60'} ${!editMode && 'cursor-not-allowed'}`}
                    >
                      <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-rose-500" /> Private Profile
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1">Only friends can view your details, activities, and budget expenses. Hidden in search.</span>
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="md:col-span-2 border-t border-[#f1f5f9] my-2" />

                {/* Email (Always Read-Only/Disabled for Security) */}
                <div className="md:col-span-2">
                  <label className="input-label block font-bold text-xs tracking-wider uppercase text-[#64748B] mb-2">Registered Email Address</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="input-field flex-1 disabled:bg-[#f8fafc] disabled:text-slate-400 font-semibold"
                    />
                    <span className="badge badge-success text-[10px] py-2 px-3 font-bold flex items-center gap-1 flex-shrink-0">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Security Password Accordion section */}
                <div className="md:col-span-2">
                  {!showPasswordChange ? (
                    <button
                      onClick={() => {
                        setShowPasswordChange(true);
                        setPasswordError(null);
                        setPasswordSuccess(null);
                      }}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-200/50 flex items-center justify-center text-slate-600">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#0b1c30] block">Access Security Password</span>
                          <span className="text-[10px] text-slate-400 font-medium font-body block">Modify your master authentication credentials</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4"
                    >
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="text-xs font-bold text-[#0b1c30] block">Update Password Credentials</span>
                        <button
                          type="button"
                          onClick={() => setShowPasswordChange(false)}
                          className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          Hide Details
                        </button>
                      </div>

                      {passwordError && (
                        <div className="p-3 rounded-lg bg-rose-50 text-rose-800 text-xs border border-rose-100 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          <span className="font-semibold">{passwordError}</span>
                        </div>
                      )}

                      {passwordSuccess && (
                        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs border border-emerald-100 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="font-semibold">{passwordSuccess}</span>
                        </div>
                      )}

                      <form onSubmit={handlePasswordUpdate} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Current Password */}
                          <div className="sm:col-span-2">
                            <label className="input-label block font-bold text-xs tracking-wider uppercase text-[#64748B] mb-2">Current Password</label>
                            <div className="relative">
                              <input
                                type={showCurrentPassword ? "text" : "password"}
                                required
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                placeholder="••••••••"
                                className="input-field pr-12 font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0b1c30]"
                              >
                                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* New Password */}
                          <div>
                            <label className="input-label block font-bold text-xs tracking-wider uppercase text-[#64748B] mb-2">New Password (Min 8 chars)</label>
                            <div className="relative">
                              <input
                                type={showNewPassword ? "text" : "password"}
                                required
                                minLength={8}
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                placeholder="Min 8 characters"
                                className="input-field pr-12 font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0b1c30]"
                              >
                                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Confirm Password */}
                          <div>
                            <label className="input-label block font-bold text-xs tracking-wider uppercase text-[#64748B] mb-2">Confirm New Password</label>
                            <input
                              type="password"
                              required
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              placeholder="Confirm password"
                              className="input-field font-medium"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShowPasswordChange(false);
                              setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            }}
                            className="btn-secondary py-2 px-3 text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isUpdatingPassword}
                            className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                          >
                            {isUpdatingPassword ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
                              </>
                            ) : (
                              'Confirm Password Change'
                            )}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Extra visual metadata - Travel Style Preferences */}
              <div className="border-t border-[#f1f5f9] pt-6 space-y-5">
                <h4 className="text-sm font-bold text-[#0b1c30] font-heading">Travel Profile Customization</h4>

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold text-[#64748B] tracking-wider uppercase mb-3">Preferred Journey Style</p>
                    <div className="flex flex-wrap gap-2.5">
                      {travelStyles.map((style) => (
                        <button
                          key={style.label}
                          onClick={() => toggleStyle(style.label)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                            activeStyles.includes(style.label)
                              ? 'bg-[#001b26] text-white shadow-md'
                              : 'bg-white text-[#64748B] border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <style.icon className="w-3.5 h-3.5" />
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#64748B] tracking-wider uppercase mb-3">My Special Activities & Interests</p>
                    <div className="flex flex-wrap gap-2.5">
                      {activeInterests.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => handleRemoveInterest(item.label)}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-[#64748B] border border-slate-200 hover:border-rose-500 hover:text-rose-600 transition-all group"
                        >
                          <item.icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500" />
                          {item.label}
                          <span className="w-4 h-4 ml-1 rounded-full bg-slate-100 group-hover:bg-rose-50 flex items-center justify-center text-[10px]">×</span>
                        </button>
                      ))}
                      <button
                        onClick={handleAddInterest}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-[#94a3b8] border border-dashed border-slate-200 hover:bg-slate-50 hover:text-[#64748B] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Custom Interest
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Saved Destinations */}
          {activeTab === 'My Saved Places' && (
            <div className="card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#0b1c30] font-heading">My Saved Destinations</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Explore the dream itineraries and cities you pinned for future travels.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all">
                  <div className="h-32 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=300")' }} />
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-[#E8604C] uppercase tracking-wider">Europe Adventure</span>
                    <h4 className="text-sm font-bold text-[#0b1c30] mt-0.5">Paris, France</h4>
                    <p className="text-xs text-slate-400 mt-1">Eiffel Tower views, Louvre museums and gourmet food walks.</p>
                  </div>
                  <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-rose-500 shadow hover:bg-white transition-colors">
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>

                <div className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white hover:shadow-md transition-all">
                  <div className="h-32 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=300")' }} />
                  <div className="p-4">
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Far East Discover</span>
                    <h4 className="text-sm font-bold text-[#0b1c30] mt-0.5">Tokyo, Japan</h4>
                    <p className="text-xs text-slate-400 mt-1">Shibuya crossing, cherry blossoms, and authentic ramen.</p>
                  </div>
                  <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-rose-500 shadow hover:bg-white transition-colors">
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-[#64748B] font-medium font-body">
                💡 To save more destinations, click the heart icon on any city catalog in the <span className="font-bold text-[#0b1c30]">Cities</span> search tab.
              </div>
            </div>
          )}

          {/* OTHER TABS: Payments and Security placeholders */}
          {activeTab !== 'Account Info' && activeTab !== 'My Saved Places' && (
            <div className="card p-12 text-center relative overflow-hidden">
              <div className="absolute -right-20 -top-20 w-44 h-44 rounded-full bg-[#E8604C]/5 blur-3xl" />
              <div className="absolute -left-20 -bottom-20 w-44 h-44 rounded-full bg-blue-500/5 blur-3xl" />
              
              <div className="relative z-10 space-y-4 max-w-sm mx-auto">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto shadow-inner transition-transform hover:scale-105">
                  <Sparkles className="w-8 h-8 text-[#E8604C]" />
                </div>
                <h3 className="text-lg font-bold text-[#0b1c30] font-heading">{activeTab} Hub</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  This settings module is currently queued for integration and will be available in the upcoming Voyager platform release.
                </p>
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
                    🛡️ Next Phase Target
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Log Out Action */}
          <div className="md:hidden pt-2">
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full bg-white border border-[#e2e8f0] hover:border-red-200 hover:bg-rose-50/50 text-[#E8604C] py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
