import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Plus, Users, Bell, Loader2, RefreshCw, UserCheck, UserPlus, MessageSquarePlus } from 'lucide-react';
import { toast } from 'sonner';
import { useCommunityFeed, useDiscoverUsers } from '../hooks/useCommunity';
import { useMyFriends, useFriendRequests, useSendFriendRequest, useRespondToRequest } from '../hooks/useFriends';
import PostCard from '../components/community/PostCard';
import CreatePostModal from '../components/community/CreatePostModal';

// ─── Skeleton ────────────────────────────────────────────────────
function PostSkeleton() {
  return (
    <div className="card p-5 animate-pulse">
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 rounded w-1/3" />
          <div className="h-2 bg-slate-100 rounded w-1/4" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded w-full" />
        <div className="h-3 bg-slate-100 rounded w-5/6" />
        <div className="h-3 bg-slate-100 rounded w-3/4" />
      </div>
    </div>
  );
}

// ─── Discover Card ───────────────────────────────────────────────
function DiscoverCard({ user }: { user: { id: string; first_name: string; last_name: string; username: string | null; photo_url: string | null; city: string | null } }) {
  const sendRequest = useSendFriendRequest();
  const [sent, setSent] = useState(false);

  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || '?';

  const handleFollow = () => {
    sendRequest.mutate(user.id, {
      onSuccess: () => {
        setSent(true);
        toast.success(`Friend request sent to ${user.username ? '@' + user.username : user.first_name}`);
      },
      onError: (err: any) => {
        const errorMsg = err?.response?.data?.error || err?.message || 'Failed to send request';
        toast.error(errorMsg);
      },
    });
  };

  return (
    <div className="flex items-center gap-3 py-2.5">
      {user.photo_url ? (
        <img src={user.photo_url} alt={user.first_name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E8604C] to-amber-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0b1c30] truncate">
          {user.username ? `@${user.username}` : `${user.first_name} ${user.last_name}`}
        </p>
        {user.city && <p className="text-xs text-slate-400 truncate">{user.city}</p>}
      </div>
      <button
        id={`follow-${user.id}`}
        disabled={sent || sendRequest.isPending}
        onClick={handleFollow}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
          sent ? 'bg-emerald-50 text-emerald-600' : 'bg-[#001b26] text-white hover:bg-[#0b1c30]'
        }`}
      >
        {sent ? <><UserCheck className="w-3 h-3" /> Sent</> : <><UserPlus className="w-3 h-3" /> Follow</>}
      </button>
    </div>
  );
}

// ─── Request Card ────────────────────────────────────────────────
function RequestCard({ req }: { req: { id: string; requester: { first_name: string; last_name: string; username: string | null; photo_url: string | null } } }) {
  const respond = useRespondToRequest();
  const initials = `${req.requester.first_name?.[0] ?? ''}${req.requester.last_name?.[0] ?? ''}`.toUpperCase() || '?';

  return (
    <div className="flex items-center gap-3 py-2.5">
      {req.requester.photo_url ? (
        <img src={req.requester.photo_url} alt={req.requester.first_name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0b1c30] truncate">
          {req.requester.username ? `@${req.requester.username}` : `${req.requester.first_name} ${req.requester.last_name}`}
        </p>
      </div>
      <div className="flex gap-1.5 flex-shrink-0">
        <button
          onClick={() => respond.mutate({ requestId: req.id, action: 'accept' })}
          className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors"
        >
          Accept
        </button>
        <button
          onClick={() => respond.mutate({ requestId: req.id, action: 'decline' })}
          className="px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-semibold hover:bg-slate-200 transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function Community() {
  const [createOpen, setCreateOpen] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useCommunityFeed();

  const { data: discoverUsers } = useDiscoverUsers();
  const { data: friendRequests } = useFriendRequests();
  const { data: myFriends } = useMyFriends();

  const allPosts = data?.pages.flatMap((p) => p.items) ?? [];

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="page-transition max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-semibold tracking-widest text-slate-400 uppercase mb-1">Social</p>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] font-heading">Community</h1>
          <p className="text-slate-500 text-sm mt-1">Discover stories, tips, and hidden gems from fellow travelers.</p>
        </div>
        <button
          id="open-create-post"
          onClick={() => setCreateOpen(true)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" /> Share Experience
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8">
        {/* ── LEFT: Feed ── */}
        <div className="space-y-4">
          {/* Create Post Box */}
          <button
            onClick={() => setCreateOpen(true)}
            className="w-full card p-4 flex items-center gap-3 hover:border-[#E8604C]/30 transition-colors cursor-pointer text-left"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E8604C] to-amber-400 flex items-center justify-center flex-shrink-0">
              <MessageSquarePlus className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-slate-400 flex-1">Share your travel experience...</span>
          </button>

          {/* Refresh */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {allPosts.length} post{allPosts.length !== 1 ? 's' : ''}
            </p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#E8604C] transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {/* Posts */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <PostSkeleton key={i} />)}
            </div>
          ) : allPosts.length === 0 ? (
            <div className="text-center py-20 card">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#0b1c30] font-heading">No posts yet</h3>
              <p className="text-slate-400 text-sm mt-1">Be the first to share a travel experience!</p>
              <button onClick={() => setCreateOpen(true)} className="btn-primary mt-4 text-sm">
                Share Experience
              </button>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {allPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </AnimatePresence>
          )}

          {/* Infinite scroll sentinel */}
          <div ref={loadMoreRef} className="py-4 flex justify-center">
            {isFetchingNextPage && <Loader2 className="w-5 h-5 text-[#E8604C] animate-spin" />}
            {!hasNextPage && allPosts.length > 0 && (
              <p className="text-xs text-slate-300">You've reached the end</p>
            )}
          </div>
        </div>

        {/* ── RIGHT: Sidebar ── */}
        <div className="space-y-6">
          {/* Friend Requests */}
          {friendRequests && friendRequests.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-[#0b1c30] font-heading flex items-center gap-2 mb-4">
                <Bell className="w-4 h-4 text-amber-500" />
                Friend Requests
                <span className="ml-auto bg-amber-100 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {friendRequests.length}
                </span>
              </h3>
              <div className="divide-y divide-slate-100">
                {friendRequests.map((req) => (
                  <RequestCard key={req.id} req={req} />
                ))}
              </div>
            </div>
          )}

          {/* Discover Travelers */}
          {discoverUsers && discoverUsers.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-[#0b1c30] font-heading flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-[#E8604C]" />
                Discover Travelers
              </h3>
              <div className="divide-y divide-slate-100">
                {discoverUsers.slice(0, 6).map((u) => (
                  <DiscoverCard key={u.id} user={u} />
                ))}
              </div>
            </div>
          )}

          {/* My Friends */}
          {myFriends && myFriends.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-bold text-[#0b1c30] font-heading flex items-center gap-2 mb-4">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                My Friends
                <span className="ml-auto text-xs text-slate-400">{myFriends.length}</span>
              </h3>
              <div className="space-y-2">
                {myFriends.map(({ friendshipId, friend }) => {
                  const initials = `${friend.first_name?.[0] ?? ''}${friend.last_name?.[0] ?? ''}`.toUpperCase() || '?';
                  return (
                    <div key={friendshipId} className="flex items-center gap-2.5">
                      {friend.photo_url ? (
                        <img src={friend.photo_url} alt={friend.first_name} className="w-7 h-7 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E8604C] to-amber-400 flex items-center justify-center text-white text-[10px] font-bold">
                          {initials}
                        </div>
                      )}
                      <span className="text-sm text-slate-700 truncate">
                        {friend.username ? `@${friend.username}` : `${friend.first_name} ${friend.last_name}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <CreatePostModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
