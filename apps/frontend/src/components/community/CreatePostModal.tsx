import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, MapPin, Loader2, Globe } from 'lucide-react';
import { useCreatePost } from '../../hooks/useCommunity';
import { useTrips } from '../../hooks/useTrips';

interface Props {
  open: boolean;
  onClose: () => void;
}

const MAX_CHARS = 500;

export default function CreatePostModal({ open, onClose }: Props) {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tripId, setTripId] = useState('');
  const [tripSearch, setTripSearch] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [showImageField, setShowImageField] = useState(false);

  const createPost = useCreatePost();
  const { data: tripsData } = useTrips({ search: tripSearch || undefined, limit: 100 });

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setContent('');
      setImageUrl('');
      setTripId('');
      setTripSearch('');
      setIsPublic(true);
      setShowImageField(false);
    }, 300);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    try {
      await createPost.mutateAsync({
        content: content.trim(),
        trip_id: tripId || undefined,
        image_url: imageUrl.trim() || undefined,
        is_public: isPublic,
      });
      handleClose();
    } catch {
      // error shown below
    }
  };

  const remaining = MAX_CHARS - content.length;
  const canPost = content.trim().length > 0 && remaining >= 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="create-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          <motion.div
            key="create-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-[#0b1c30] font-heading">Share an Experience</h3>
              <button onClick={handleClose} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Content textarea */}
              <div>
                <textarea
                  id="post-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
                  placeholder="Share your travel experience, tips, or hidden gems..."
                  rows={5}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 focus:border-[#E8604C] focus:ring-1 focus:ring-[#E8604C] outline-none resize-none transition-all"
                />
                <div className={`text-xs mt-1 text-right ${remaining < 50 ? 'text-red-400' : 'text-slate-400'}`}>
                  {remaining} characters remaining
                </div>
              </div>

              {/* Trip selector */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E8604C]" /> Tag a Trip (optional)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Search trips..."
                    value={tripSearch}
                    onChange={(e) => setTripSearch(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#E8604C] transition-all"
                  />
                  <select
                    id="post-trip-select"
                    value={tripId}
                    onChange={(e) => setTripId(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:border-[#E8604C] outline-none bg-white"
                  >
                    <option value="">No trip</option>
                    {tripsData?.items.map((trip) => (
                      <option key={trip.id} value={trip.id}>{trip.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image URL toggle */}
              <div>
                <button
                  onClick={() => setShowImageField((v) => !v)}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#E8604C] transition-colors"
                >
                  <Image className="w-3.5 h-3.5" />
                  {showImageField ? 'Remove image' : 'Add image URL'}
                </button>
                <AnimatePresence>
                  {showImageField && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        id="post-image-url"
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        className="mt-2 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#E8604C] transition-all"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Visibility toggle */}
              <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="font-medium text-slate-700">Public post</span>
                </div>
                <button
                  id="post-visibility-toggle"
                  onClick={() => setIsPublic((v) => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${isPublic ? 'bg-[#E8604C]' : 'bg-slate-300'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {createPost.isError && (
                <p className="text-xs text-red-500">Failed to post. Please try again.</p>
              )}

              {/* Submit */}
              <button
                id="submit-post"
                disabled={!canPost || createPost.isPending}
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl bg-[#E8604C] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#d44f3c] transition-colors flex items-center justify-center gap-2"
              >
                {createPost.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</>
                ) : (
                  'Share Post'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
