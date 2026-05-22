import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Globe,
  Search,
  Plus,
  Trash2,
  ShieldAlert,
  Edit,
  MapPin,
  Shield,
  MessageSquare,
  Check,
  X,
  Loader2,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useAuthStore, type User } from '../store/authStore';
import {
  useAdminStats,
  useAdminUsers,
  useAdminPosts,
  useToggleAdmin,
  useDeleteUser,
  useModerateDeletePost,
  useCreateCity,
  useUpdateCity,
  useDeleteCity,
  useAddActivity,
  useUpdateActivity,
  useDeleteActivity
} from '../hooks/useAdmin';
import { useCities, useCityActivities, type City, type Activity } from '../hooks/useCities';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Globe },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'destinations', label: 'Destinations', icon: MapPin },
  { id: 'community', label: 'Community Feed', icon: MessageSquare },
] as const;

type ActiveTab = (typeof TABS)[number]['id'];

// ─── Modal States ────────────────────────────────────────────────
interface ConfirmState {
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
}

interface CityFormState {
  id?: string;
  name: string;
  country: string;
  region: string;
  cost_index: number;
  popularity_score: number;
  description: string;
  image_url: string;
}

interface ActivityFormState {
  id?: string;
  cityId: string;
  name: string;
  type: string;
  cost: number;
  duration_mins: number;
  description: string;
  image_url: string;
}

// ─── Guard wrapper ────────────────────────────────────────────────
export default function AdminPanel() {
  const { user } = useAuthStore();
  if (!user?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <AdminPanelInner user={user} />;
}

// ─── Inner Panel (all hooks unconditionally at top) ───────────────
function AdminPanelInner({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Common UI State
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  // TAB 1: Stats
  const { data: stats, isLoading: statsLoading } = useAdminStats();

  // TAB 2: Users State
  const [usersPage, setUsersPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');
  const [debouncedUserSearch, setDebouncedUserSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedUserSearch(userSearch);
      setUsersPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [userSearch]);

  const { data: usersData, isLoading: usersLoading } = useAdminUsers({
    page: usersPage,
    limit: 10,
    search: debouncedUserSearch,
  });

  const toggleAdminMutation = useToggleAdmin();
  const deleteUserMutation = useDeleteUser();

  const handleToggleAdmin = (targetUser: any) => {
    if (targetUser.id === user.id) {
      alert("You cannot remove your own administrator privilege to avoid locking yourself out.");
      return;
    }
    setConfirm({
      title: 'Change Administrator Privileges',
      message: `Are you sure you want to ${
        targetUser.is_admin ? 'demote' : 'promote'
      } ${targetUser.first_name} ${targetUser.last_name} (${targetUser.email})?`,
      onConfirm: async () => {
        await toggleAdminMutation.mutateAsync(targetUser.id);
        setConfirm(null);
      },
    });
  };

  const handleDeleteUser = (targetUser: any) => {
    if (targetUser.id === user.id) {
      alert("You cannot delete your own user account.");
      return;
    }
    setConfirm({
      title: 'Permanently Delete User Account',
      message: `This will permanently delete ${targetUser.first_name} ${targetUser.last_name}'s account and all associated trips/stops. This action is irreversible. Continue?`,
      onConfirm: async () => {
        await deleteUserMutation.mutateAsync(targetUser.id);
        setConfirm(null);
      },
    });
  };

  // TAB 3: Destinations State
  const [citiesPage, setCitiesPage] = useState(1);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [debouncedCitySearch, setDebouncedCitySearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedCitySearch(citySearchQuery);
      setCitiesPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [citySearchQuery]);

  const { data: citiesData, isLoading: citiesLoading } = useCities({
    q: debouncedCitySearch || undefined,
    page: citiesPage,
    limit: 10,
    sort: 'name',
  });

  const createCityMutation = useCreateCity();
  const updateCityMutation = useUpdateCity();
  const deleteCityMutation = useDeleteCity();

  // City Edit Modal
  const [cityModal, setCityModal] = useState<CityFormState | null>(null);

  // Manage Activities Modal for a single City
  const [manageActivitiesCityId, setManageActivitiesCityId] = useState<string | null>(null);
  const [activityModal, setActivityModal] = useState<ActivityFormState | null>(null);

  const { data: activities, isLoading: activitiesLoading } = useCityActivities(manageActivitiesCityId);

  const addActivityMutation = useAddActivity();
  const updateActivityMutation = useUpdateActivity();
  const deleteActivityMutation = useDeleteActivity();

  const handleOpenAddCity = () => {
    setCityModal({
      name: '',
      country: '',
      region: '',
      cost_index: 100,
      popularity_score: 5,
      description: '',
      image_url: '',
    });
  };

  const handleSaveCity = async () => {
    if (!cityModal) return;
    if (!cityModal.name || !cityModal.country) {
      alert("Name and Country are required.");
      return;
    }
    try {
      if (cityModal.id) {
        await updateCityMutation.mutateAsync({
          id: cityModal.id,
          name: cityModal.name,
          country: cityModal.country,
          region: cityModal.region || undefined,
          cost_index: Number(cityModal.cost_index),
          popularity_score: Number(cityModal.popularity_score),
          description: cityModal.description || undefined,
          image_url: cityModal.image_url || undefined,
        });
      } else {
        await createCityMutation.mutateAsync({
          name: cityModal.name,
          country: cityModal.country,
          region: cityModal.region || undefined,
          cost_index: Number(cityModal.cost_index),
          popularity_score: Number(cityModal.popularity_score),
          description: cityModal.description || undefined,
          image_url: cityModal.image_url || undefined,
        });
      }
      setCityModal(null);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || err.message || "Failed to save city");
    }
  };

  const handleDeleteCity = (city: City) => {
    setConfirm({
      title: 'Delete Destination City',
      message: `Are you sure you want to delete ${city.name}, ${city.country}? This is only allowed if no trip schedules currently reference it.`,
      onConfirm: async () => {
        try {
          await deleteCityMutation.mutateAsync(city.id);
          setConfirm(null);
        } catch (err: any) {
          alert(err.response?.data?.error?.message || err.message || "Failed to delete city. Note: Cities linked to users' active trip stops cannot be deleted.");
          setConfirm(null);
        }
      },
    });
  };

  // Activity Actions
  const handleOpenAddActivity = () => {
    if (!manageActivitiesCityId) return;
    setActivityModal({
      cityId: manageActivitiesCityId,
      name: '',
      type: 'CULTURE',
      cost: 0,
      duration_mins: 60,
      description: '',
      image_url: '',
    });
  };

  const handleSaveActivity = async () => {
    if (!activityModal) return;
    if (!activityModal.name || !activityModal.type) {
      alert("Name and Category type are required.");
      return;
    }
    try {
      if (activityModal.id) {
        await updateActivityMutation.mutateAsync({
          id: activityModal.id,
          name: activityModal.name,
          type: activityModal.type,
          cost: Number(activityModal.cost),
          duration_mins: Number(activityModal.duration_mins),
          description: activityModal.description || undefined,
          image_url: activityModal.image_url || undefined,
        });
      } else {
        await addActivityMutation.mutateAsync({
          cityId: activityModal.cityId,
          name: activityModal.name,
          type: activityModal.type,
          cost: Number(activityModal.cost),
          duration_mins: Number(activityModal.duration_mins),
          description: activityModal.description || undefined,
          image_url: activityModal.image_url || undefined,
        });
      }
      setActivityModal(null);
    } catch (err: any) {
      alert(err.response?.data?.error?.message || err.message || "Failed to save activity");
    }
  };

  const handleDeleteActivity = (act: Activity) => {
    setConfirm({
      title: 'Delete Activity',
      message: `Delete "${act.name}"? This is restricted if itinerary builder instances already include it.`,
      onConfirm: async () => {
        try {
          await deleteActivityMutation.mutateAsync(act.id);
          setConfirm(null);
        } catch (err: any) {
          alert(err.response?.data?.error?.message || err.message || "Failed to delete activity.");
          setConfirm(null);
        }
      },
    });
  };

  // TAB 4: Community Posts
  const [postsPage, setPostsPage] = useState(1);
  const { data: postsData, isLoading: postsLoading } = useAdminPosts({
    page: postsPage,
    limit: 10,
  });

  const deletePostMutation = useModerateDeletePost();

  const handleModerateDeletePost = (post: any) => {
    setConfirm({
      title: 'Delete Community Post (Moderation)',
      message: `Are you sure you want to delete post ID ${post.id.slice(0, 8)}... created by ${post.user.first_name} ${post.user.last_name}? This post will be permanently hidden from the community feed.`,
      onConfirm: async () => {
        await deletePostMutation.mutateAsync(post.id);
        setConfirm(null);
      },
    });
  };

  // Helper formatting
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="page-transition max-w-7xl mx-auto pb-16 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0b1c30] font-heading flex items-center gap-2">
            <Shield className="w-7 h-7 text-[#E8604C]" /> Control Room
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Core administration settings, user management, destination logs, and content moderation feeds.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#001b26] flex items-center justify-center text-white font-bold shadow-md">
            AD
          </div>
          <div>
            <p className="text-sm font-semibold text-[#001b26]">{user.first_name} {user.last_name}</p>
            <p className="text-xs text-[#E8604C] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Admin
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide uppercase transition-all ${
              activeTab === tab.id
                ? 'bg-white text-[#001b26] shadow-sm'
                : 'text-[#64748B] hover:text-[#0b1c30]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
        >
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {statsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="card p-6 h-32 animate-pulse bg-slate-100 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="card p-6 border-l-4 border-l-[#001b26] bg-white flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-[#94a3b8] uppercase">Total System Users</p>
                        <p className="text-3xl font-extrabold text-[#0b1c30] mt-1 font-heading">
                          {stats?.totalUsers ?? 0}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          +{stats?.newUsersThisWeek ?? 0} new this week
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-[#001b26]">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="card p-6 border-l-4 border-l-[#E8604C] bg-white flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-[#94a3b8] uppercase">Active Trip Plans</p>
                        <p className="text-3xl font-extrabold text-[#0b1c30] mt-1 font-heading">
                          {stats?.totalTrips ?? 0}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-2">
                          {stats?.activeTrips ?? 0} trips underway right now
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-[#E8604C]/5 border border-[#E8604C]/10 rounded-xl flex items-center justify-center text-[#E8604C]">
                        <Globe className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="card p-6 border-l-4 border-l-[#10B981] bg-white flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-[10px] font-bold tracking-wider text-[#94a3b8] uppercase">Global Destinations</p>
                        <p className="text-3xl font-extrabold text-[#0b1c30] mt-1 font-heading">
                          {stats?.totalCities ?? 0}
                        </p>
                        <p className="text-[11px] text-[#10B981] font-semibold mt-2 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {stats?.totalPosts ?? 0} feed posts shared
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-[#10B981]">
                        <MapPin className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Destination Hotspots */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 card p-6 bg-white shadow-sm">
                      <h3 className="text-lg font-bold text-[#0b1c30] font-heading mb-4">Destination Popularity Leaderboard</h3>
                      <div className="space-y-4">
                        {stats?.most_visited_cities.map((item, idx) => (
                          <div key={item.city} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-[#001b26]">
                              #{idx + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-slate-800">{item.city}</span>
                                <span className="text-xs font-medium text-slate-500">{item.count} planned stops</span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                  className="bg-[#001b26] h-2 rounded-full transition-all duration-1000"
                                  style={{
                                    width: `${
                                      stats.most_visited_cities[0]?.count
                                        ? (item.count / stats.most_visited_cities[0].count) * 100
                                        : 0
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        {!stats?.most_visited_cities.length && (
                          <p className="text-sm text-slate-400 py-6 text-center">No active itinerary stops to report stats on yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="card p-6 bg-[#001b26] text-white flex flex-col justify-between shadow-sm">
                      <div>
                        <h3 className="text-lg font-bold font-heading text-white/95">Admin Health Summary</h3>
                        <p className="text-xs text-white/70 mt-1 leading-relaxed">
                          Verify overall database records, review incoming city registrations, and monitor public community post reports.
                        </p>
                      </div>
                      <div className="border-t border-white/10 pt-4 mt-6 space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">Community Feed Status</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Active
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">Prisma Database</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">Express API Service</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Healthy
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Tab 2: Users List */}
          {activeTab === 'users' && (
            <div className="card p-6 bg-white shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#0b1c30] font-heading">Registered Accounts</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Toggle admin access or delete user accounts permanently.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name, username, email..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 focus:border-[#E8604C] focus:ring-1 focus:ring-[#E8604C] outline-none rounded-xl text-xs transition-all"
                  />
                </div>
              </div>

              {usersLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-7 h-7 text-[#E8604C] animate-spin" />
                </div>
              ) : !usersData?.items.length ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
                  <p className="text-sm text-slate-400">No users found matching search criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Name</th>
                        <th className="text-left pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Joined Date</th>
                        <th className="text-left pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Trip Count</th>
                        <th className="text-left pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Role</th>
                        <th className="text-right pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData.items.map((u) => (
                        <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-[#E8604C]/10 flex items-center justify-center text-[#E8604C] text-xs font-bold flex-shrink-0">
                                {u.photo_url ? (
                                  <img src={u.photo_url} alt="" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  `${u.first_name[0]}${u.last_name[0]}`
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 leading-tight">
                                  {u.first_name} {u.last_name}
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">
                                  {u.username ? `@${u.username}` : ''} • {u.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-xs text-slate-500">{formatDate(u.created_at)}</td>
                          <td className="py-4 text-xs font-semibold text-slate-700">{u._count.trips} planned</td>
                          <td className="py-4">
                            {u.is_admin ? (
                              <span className="inline-flex items-center gap-1 bg-red-50 text-[#E8604C] px-2 py-0.5 rounded-md text-[10px] font-semibold border border-red-100">
                                <Shield className="w-3 h-3" /> Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md text-[10px] font-semibold border border-slate-100">
                                Traveler
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleToggleAdmin(u)}
                                disabled={u.id === user.id}
                                title="Toggle Admin Role"
                                className="w-8 h-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                <Shield className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u)}
                                disabled={u.id === user.id}
                                title="Delete User Account"
                                className="w-8 h-8 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {usersData && usersData.total > 10 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-4">
                  <p className="text-xs text-slate-400">
                    Showing {usersData.offset + 1}–{Math.min(usersData.offset + 10, usersData.total)} of {usersData.total} users
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={usersPage <= 1}
                      onClick={() => setUsersPage((p) => p - 1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                      Prev
                    </button>
                    <button
                      disabled={usersData.offset + 10 >= usersData.total}
                      onClick={() => setUsersPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Destinations (Cities + Activities) */}
          {activeTab === 'destinations' && (
            <div className="card p-6 bg-white shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#0b1c30] font-heading">Destination Cities</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Manage target cities and edit activity lists.</p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-56">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      placeholder="Search cities..."
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 focus:border-[#E8604C] focus:ring-1 focus:ring-[#E8604C] outline-none rounded-xl text-xs transition-all"
                    />
                  </div>
                  <button
                    onClick={handleOpenAddCity}
                    className="flex items-center justify-center gap-1.5 bg-[#E8604C] hover:bg-[#d44f3c] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add City
                  </button>
                </div>
              </div>

              {citiesLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-7 h-7 text-[#E8604C] animate-spin" />
                </div>
              ) : !citiesData?.items.length ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
                  <p className="text-sm text-slate-400">No destination cities registered yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">City</th>
                        <th className="text-left pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Region</th>
                        <th className="text-left pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Cost Index</th>
                        <th className="text-left pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Activities</th>
                        <th className="text-right pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citiesData.items.map((c) => (
                        <tr key={c.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-8 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                                {c.image_url ? (
                                  <img src={c.image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-[#94a3b8]">
                                    <MapPin className="w-4 h-4" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800 leading-tight">{c.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{c.country}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-xs text-slate-500">{c.region || '—'}</td>
                          <td className="py-3 text-xs font-semibold text-emerald-600">₹{Number(c.cost_index).toFixed(0)}</td>
                          <td className="py-3">
                            <button
                              onClick={() => setManageActivitiesCityId(c.id)}
                              className="text-xs font-semibold text-[#001b26] hover:text-[#E8604C] bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg px-2.5 py-1 flex items-center gap-1 transition-all"
                            >
                              <Plus className="w-3 h-3" /> {c._count?.activities ?? 0} activities
                            </button>
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setCityModal({
                                  id: c.id,
                                  name: c.name,
                                  country: c.country,
                                  region: c.region || '',
                                  cost_index: Number(c.cost_index),
                                  popularity_score: c.popularity_score,
                                  description: c.description || '',
                                  image_url: c.image_url || '',
                                })}
                                title="Edit City"
                                className="w-8 h-8 rounded-lg border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-600 hover:bg-white transition-all"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCity(c)}
                                title="Delete City"
                                className="w-8 h-8 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center transition-all"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {citiesData && citiesData.totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-4">
                  <p className="text-xs text-slate-400">
                    Showing page {citiesPage} of {citiesData.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={citiesPage <= 1}
                      onClick={() => setCitiesPage((p) => p - 1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                      Prev
                    </button>
                    <button
                      disabled={!citiesData.hasNext}
                      onClick={() => setCitiesPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Community Feed Moderation */}
          {activeTab === 'community' && (
            <div className="card p-6 bg-white shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-bold text-[#0b1c30] font-heading">Community Moderation</h3>
                <p className="text-xs text-slate-400 mt-0.5">Moderate posts by deleting content violating terms of service.</p>
              </div>

              {postsLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-7 h-7 text-[#E8604C] animate-spin" />
                </div>
              ) : !postsData?.items.length ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-100 rounded-2xl">
                  <p className="text-sm text-slate-400">No community posts exist in the feed.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Author</th>
                        <th className="text-left pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Content Preview</th>
                        <th className="text-left pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Visibility</th>
                        <th className="text-left pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Likes</th>
                        <th className="text-left pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Posted Date</th>
                        <th className="text-right pb-3 text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {postsData.items.map((post) => (
                        <tr key={post.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
                                {post.user.photo_url ? (
                                  <img src={post.user.photo_url} alt="" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                  `${post.user.first_name[0]}${post.user.last_name[0]}`
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-800 leading-tight">
                                  {post.user.first_name} {post.user.last_name}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]">
                                  {post.user.username ? `@${post.user.username}` : 'user'}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 max-w-xs">
                            <div className="min-w-0">
                              <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">
                                {post.content}
                              </p>
                              {post.trip && (
                                <span className="inline-flex items-center gap-0.5 bg-slate-50 text-slate-400 border border-slate-200/50 rounded px-1.5 py-0.5 text-[9px] mt-1">
                                  Linked Trip: {post.trip.name}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4">
                            {post.is_public ? (
                              <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[9px] font-semibold border border-emerald-100">
                                Public
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 bg-purple-50 text-purple-600 px-2 py-0.5 rounded text-[9px] font-semibold border border-purple-100">
                                Friends-Only
                              </span>
                            )}
                          </td>
                          <td className="py-4 text-xs text-slate-500 font-semibold">{post.likes} likes</td>
                          <td className="py-4 text-xs text-slate-400">{formatDate(post.created_at)}</td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleModerateDeletePost(post)}
                              title="Delete Post (Moderation)"
                              className="w-8 h-8 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 flex items-center justify-center transition-all ml-auto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {postsData && postsData.total > 10 && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-4">
                  <p className="text-xs text-slate-400">
                    Showing {postsData.offset + 1}–{Math.min(postsData.offset + 10, postsData.total)} of {postsData.total} posts
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={postsPage <= 1}
                      onClick={() => setPostsPage((p) => p - 1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                      Prev
                    </button>
                    <button
                      disabled={postsData.offset + 10 >= postsData.total}
                      onClick={() => setPostsPage((p) => p + 1)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirm(null)}
              className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 z-50 text-left"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 flex-shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0b1c30] text-sm sm:text-base leading-tight font-heading">{confirm.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">Verification Required</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">{confirm.message}</p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setConfirm(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirm.onConfirm}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  Confirm Action
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add / Edit City Modal */}
      <AnimatePresence>
        {cityModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCityModal(null)}
              className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 z-50 text-left overflow-y-auto max-h-[85vh]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h4 className="font-bold text-[#0b1c30] font-heading">{cityModal.id ? 'Edit Destination City' : 'Add Destination City'}</h4>
                <button onClick={() => setCityModal(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">City Name *</label>
                    <input
                      type="text"
                      value={cityModal.name}
                      onChange={(e) => setCityModal({ ...cityModal, name: e.target.value })}
                      placeholder="e.g. Paris"
                      className="w-full mt-1 px-3 py-2 border border-slate-200 focus:border-[#E8604C] outline-none rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Country *</label>
                    <input
                      type="text"
                      value={cityModal.country}
                      onChange={(e) => setCityModal({ ...cityModal, country: e.target.value })}
                      placeholder="e.g. France"
                      className="w-full mt-1 px-3 py-2 border border-slate-200 focus:border-[#E8604C] outline-none rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Region (Optional)</label>
                  <input
                    type="text"
                    value={cityModal.region}
                    onChange={(e) => setCityModal({ ...cityModal, region: e.target.value })}
                    placeholder="e.g. Île-de-France"
                    className="w-full mt-1 px-3 py-2 border border-slate-200 focus:border-[#E8604C] outline-none rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Cost Index</label>
                    <input
                      type="number"
                      value={cityModal.cost_index}
                      onChange={(e) => setCityModal({ ...cityModal, cost_index: Number(e.target.value) })}
                      placeholder="e.g. 350"
                      className="w-full mt-1 px-3 py-2 border border-slate-200 focus:border-[#E8604C] outline-none rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Popularity Score (1-10)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={cityModal.popularity_score}
                      onChange={(e) => setCityModal({ ...cityModal, popularity_score: Number(e.target.value) })}
                      placeholder="e.g. 8"
                      className="w-full mt-1 px-3 py-2 border border-slate-200 focus:border-[#E8604C] outline-none rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Image URL</label>
                  <input
                    type="text"
                    value={cityModal.image_url}
                    onChange={(e) => setCityModal({ ...cityModal, image_url: e.target.value })}
                    placeholder="Unsplash image link or standard web URL"
                    className="w-full mt-1 px-3 py-2 border border-slate-200 focus:border-[#E8604C] outline-none rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                  <textarea
                    rows={3}
                    value={cityModal.description}
                    onChange={(e) => setCityModal({ ...cityModal, description: e.target.value })}
                    placeholder="Short summary of the destination..."
                    className="w-full mt-1 px-3 py-2 border border-slate-200 focus:border-[#E8604C] outline-none rounded-xl text-xs resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 border-t border-slate-100 pt-4">
                <button
                  onClick={() => setCityModal(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCity}
                  disabled={createCityMutation.isPending || updateCityMutation.isPending}
                  className="px-5 py-2 bg-[#001b26] hover:bg-[#0b1c30] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  {(createCityMutation.isPending || updateCityMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  Save City
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Manage Activities Modal */}
      <AnimatePresence>
        {manageActivitiesCityId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setManageActivitiesCityId(null)}
              className="fixed inset-0 bg-black/45 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 z-40 text-left flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 flex-shrink-0">
                <div>
                  <h4 className="font-bold text-[#0b1c30] font-heading flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#E8604C]" /> Destination Activities
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Browse and edit itinerary activities for this city.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleOpenAddActivity}
                    className="flex items-center justify-center gap-1 bg-[#E8604C] hover:bg-[#d44f3c] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  >
                    <Plus className="w-3 h-3" /> Add Activity
                  </button>
                  <button onClick={() => setManageActivitiesCityId(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
                {activitiesLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <Loader2 className="w-6 h-6 text-[#E8604C] animate-spin" />
                  </div>
                ) : !activities?.length ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-xs text-slate-400">No activities listed. Click "Add Activity" to create one.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {activities.map((act) => (
                      <div
                        key={act.id}
                        className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-all group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-slate-100 text-[#001b26] text-[8px] font-bold px-1.5 py-0.5 rounded-full tracking-wide uppercase">
                              {act.type}
                            </span>
                            {act.duration_mins && (
                              <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
                                <Clock className="w-2.5 h-2.5" /> {act.duration_mins}m
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-800 mt-1">{act.name}</p>
                          {act.description && (
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{act.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-bold text-emerald-600">₹{Number(act.cost).toFixed(0)}</span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setActivityModal({
                                id: act.id,
                                cityId: manageActivitiesCityId,
                                name: act.name,
                                type: act.type,
                                cost: Number(act.cost),
                                duration_mins: act.duration_mins || 0,
                                description: act.description || '',
                                image_url: act.image_url || '',
                              })}
                              className="w-6 h-6 rounded border border-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center hover:bg-white"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteActivity(act)}
                              className="w-6 h-6 rounded border border-red-50 text-red-500 hover:bg-red-50 flex items-center justify-center"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add / Edit Activity Modal */}
      <AnimatePresence>
        {activityModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivityModal(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 z-50 text-left overflow-y-auto max-h-[85vh]"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                <h4 className="font-bold text-[#0b1c30] text-sm font-heading">{activityModal.id ? 'Edit Activity' : 'Add Activity'}</h4>
                <button onClick={() => setActivityModal(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Activity Name *</label>
                  <input
                    type="text"
                    value={activityModal.name}
                    onChange={(e) => setActivityModal({ ...activityModal, name: e.target.value })}
                    placeholder="e.g. Louvre Guided Tour"
                    className="w-full mt-1 px-3 py-2 border border-slate-200 focus:border-[#E8604C] outline-none rounded-xl text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Category *</label>
                    <select
                      value={activityModal.type}
                      onChange={(e) => setActivityModal({ ...activityModal, type: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 focus:border-[#E8604C] outline-none rounded-xl text-xs bg-white"
                    >
                      <option value="CULTURE">Culture</option>
                      <option value="ADVENTURE">Adventure</option>
                      <option value="FOOD">Food</option>
                      <option value="NATURE">Nature</option>
                      <option value="SHOPPING">Shopping</option>
                      <option value="NIGHTLIFE">Nightlife</option>
                      <option value="WELLNESS">Wellness</option>
                      <option value="HISTORY">History</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Cost (₹) *</label>
                    <input
                      type="number"
                      value={activityModal.cost}
                      onChange={(e) => setActivityModal({ ...activityModal, cost: Number(e.target.value) })}
                      placeholder="e.g. 1200"
                      className="w-full mt-1 px-3 py-2 border border-slate-200 focus:border-[#E8604C] outline-none rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Duration (mins)</label>
                    <input
                      type="number"
                      value={activityModal.duration_mins}
                      onChange={(e) => setActivityModal({ ...activityModal, duration_mins: Number(e.target.value) })}
                      placeholder="e.g. 120"
                      className="w-full mt-1 px-3 py-2 border border-slate-200 focus:border-[#E8604C] outline-none rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Image URL (Opt)</label>
                    <input
                      type="text"
                      value={activityModal.image_url}
                      onChange={(e) => setActivityModal({ ...activityModal, image_url: e.target.value })}
                      placeholder="e.g. https://..."
                      className="w-full mt-1 px-3 py-2 border border-slate-200 focus:border-[#E8604C] outline-none rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Description</label>
                  <textarea
                    rows={2}
                    value={activityModal.description}
                    onChange={(e) => setActivityModal({ ...activityModal, description: e.target.value })}
                    placeholder="Short activity context..."
                    className="w-full mt-1 px-3 py-2 border border-slate-200 focus:border-[#E8604C] outline-none rounded-xl text-xs resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-5 border-t border-slate-100 pt-3">
                <button
                  onClick={() => setActivityModal(null)}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveActivity}
                  disabled={addActivityMutation.isPending || updateActivityMutation.isPending}
                  className="px-4 py-1.5 bg-[#001b26] hover:bg-[#0b1c30] text-white rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  {(addActivityMutation.isPending || updateActivityMutation.isPending) && (
                    <Loader2 className="w-3 animate-spin" />
                  )}
                  Save Activity
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
