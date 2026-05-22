import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, MapPin, Trash2, MoreHorizontal } from 'lucide-react';
import type { CommunityPost } from '../../hooks/useCommunity';
import { useToggleLike, useDeletePost } from '../../hooks/useCommunity';
import { useAuthStore } from '../../store/authStore';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function Avatar({ user }: { user: CommunityPost['user'] }) {
  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || '?';
  if (user.photo_url) {
    return (
      <img
        src={user.photo_url}
        alt={user.first_name}
        className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 flex-shrink-0"
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-[#E8604C] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
      {initials}
    </div>
  );
}

interface Props {
  post: CommunityPost;
}

export default function PostCard({ post }: Props) {
  const { user: currentUser } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleLike = useToggleLike();
  const deletePost = useDeletePost();
  const [likeLoading, setLikeLoading] = useState(false);
  const isOwner = currentUser?.id === post.user_id;

  // Drive like state entirely from server-managed post.hasLiked (no local state).
  // The optimistic update in useToggleLike flips hasLiked + adjusts likes count,
  // so post.likes already reflects the correct visual count at all times.
  const handleLike = async () => {
    if (likeLoading || toggleLike.isPending) return;
    setLikeLoading(true);
    try {
      await toggleLike.mutateAsync(post.id);
    } catch {
      // Ignored
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Delete this post?')) {
      deletePost.mutate(post.id);
    }
    setMenuOpen(false);
  };

  const displayName = post.user.username
    ? `@${post.user.username}`
    : `${post.user.first_name} ${post.user.last_name}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      layout
      className="card p-5"
    >
      {/* Author row */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar user={post.user} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#0b1c30] text-sm">{displayName}</span>
              <span className="text-slate-400 text-xs ml-2">{timeAgo(post.created_at)}</span>
            </div>
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute right-0 top-7 bg-white border border-slate-200 rounded-xl shadow-lg z-10 min-w-[120px] overflow-hidden"
                    >
                      <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Linked trip */}
      {post.trip && (
        <div className="flex items-center gap-1.5 text-xs text-[#E8604C] mb-2 bg-[#E8604C]/8 px-3 py-1.5 rounded-lg w-fit">
          <MapPin className="w-3 h-3" />
          <span>{post.trip.name}</span>
        </div>
      )}

      {/* Content */}
      <p className="text-sm text-slate-700 leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>

      {/* Post image */}
      {post.image_url && (
        <div className="rounded-xl overflow-hidden mb-3 border border-slate-100">
          <img
            src={post.image_url}
            alt="Post"
            className="w-full max-h-72 object-cover"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* Engagement */}
      <div className="flex items-center gap-5 pt-3 border-t border-slate-100">
        <button
          id={`like-post-${post.id}`}
          onClick={handleLike}
          disabled={toggleLike.isPending || likeLoading}
          className={`flex items-center gap-1.5 text-sm transition-colors disabled:opacity-70 ${
            post.hasLiked ? 'text-[#E8604C]' : 'text-slate-400 hover:text-[#E8604C]'
          }`}
        >
          <motion.div
            key={post.hasLiked ? 'liked' : 'unliked'}
            initial={{ scale: 0.7 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 600, damping: 15 }}
          >
            <Heart className={`w-4 h-4 ${post.hasLiked ? 'fill-current' : ''}`} />
          </motion.div>
          {/* Directly display post.likes — optimistic update handles ±1 correctly */}
          <span>{post.likes}</span>
        </button>

        <button
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors ml-auto"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
