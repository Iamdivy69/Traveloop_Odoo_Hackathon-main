import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  Plus,
  Trash2,
  Edit3,
  X,
  FileText,
  MapPin,
  Image,
  Loader2,
  Search,
  ChevronDown,
  StickyNote,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, type TripNote } from '../hooks/useNotes';
import { useStops } from '../hooks/useStops';

// ─── Note Editor Modal ─────────────────────────────────────────────────────────
interface NoteEditorProps {
  open: boolean;
  onClose: () => void;
  tripId: string;
  existing?: TripNote;
  stops: { id: string; label: string }[];
}

function NoteEditor({ open, onClose, tripId, existing, stops }: NoteEditorProps) {
  const createNote = useCreateNote(tripId);
  const updateNote = useUpdateNote(tripId);

  const [content, setContent] = useState(existing?.content ?? '');
  const [imageUrl, setImageUrl] = useState('');
  const [stopId, setStopId] = useState(existing?.stop_id ?? '');

  const isEdit = !!existing;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (isEdit) {
      await updateNote.mutateAsync({ noteId: existing!.id, content, stop_id: stopId || null });
    } else {
      await createNote.mutateAsync({
        content,
        stop_id: stopId || undefined,
        image_url: imageUrl || undefined,
      });
    }
    onClose();
  };

  const isPending = createNote.isPending || updateNote.isPending;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-bold text-[#0b1c30] font-heading text-lg">
                {isEdit ? 'Edit Note' : 'Add Note'}
              </h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-1.5">
                  Note Content *
                </label>
                <textarea
                  rows={6}
                  placeholder="Write your note here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8604C]/20 focus:border-[#E8604C]/40 transition-all resize-none"
                />
              </div>

              {!isEdit && (
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Image className="w-3.5 h-3.5" /> Image (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImageUrl(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setImageUrl('');
                      }
                    }}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8604C]/20 transition-all file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#E8604C]/10 file:text-[#E8604C] hover:file:bg-[#E8604C]/20"
                  />
                  {imageUrl && (
                    <div className="mt-3 h-32 rounded-xl overflow-hidden border border-slate-200 relative group">
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {stops.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-[#0b1c30] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Attach to Stop (optional)
                  </label>
                  <select
                    value={stopId}
                    onChange={(e) => setStopId(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8604C]/20 transition-all"
                  >
                    <option value="">No specific stop</option>
                    {stops.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !content.trim()}
                  className="btn-primary py-2.5 px-6"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : isEdit ? 'Update Note' : 'Add Note'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Full Note View Modal ────────────────────────────────────────────────────
interface NoteViewProps {
  note: TripNote | null;
  onClose: () => void;
  onEdit: (note: TripNote) => void;
}

function NoteView({ note, onClose, onEdit }: NoteViewProps) {
  return (
    <AnimatePresence>
      {note && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <StickyNote className="w-4 h-4" />
                {format(new Date(note.created_at), 'MMMM d, yyyy · h:mm a')}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(note)}
                  className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-[#E8604C] transition-colors"
                  title="Edit note"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {note.stop && (
                <div className="flex items-center gap-2 text-sm text-[#E8604C] font-semibold">
                  <MapPin className="w-4 h-4" />
                  {note.stop.city ? `${note.stop.city.name}, ${note.stop.city.country}` : note.stop.custom_city_name || 'Custom Stop'}
                </div>
              )}
              <p className="text-[#0b1c30] text-base leading-relaxed whitespace-pre-wrap">{note.content}</p>
              {note.image_url && (
                <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={note.image_url} alt="Note attachment" className="w-full h-auto object-contain max-h-[60vh]" />
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────
interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

function DeleteConfirmModal({ open, onClose, onConfirm, isPending }: DeleteConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 text-center"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-heading font-bold text-lg text-[#0b1c30] mb-2">Delete Note?</h3>
            <p className="text-slate-500 text-sm mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={onClose}
                disabled={isPending}
                className="px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isPending}
                className="px-5 py-2.5 text-sm font-semibold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors flex items-center justify-center min-w-[100px]"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Notes Page ─────────────────────────────────────────────────────────
export default function TripNotes() {
  const { activeTrip } = useStore();
  const tripId = activeTrip?.id || '';

  const [filterStopId, setFilterStopId] = useState('');
  const [search, setSearch] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<TripNote | undefined>(undefined);
  const [viewingNote, setViewingNote] = useState<TripNote | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const { data: notes, isLoading } = useNotes(tripId, filterStopId || undefined);
  const { data: tripStops } = useStops(tripId);
  const deleteNote = useDeleteNote(tripId);

  const filteredNotes = (notes ?? []).filter((n) =>
    n.content.toLowerCase().includes(search.toLowerCase())
  );

  const stops = (tripStops ?? []).map((s) => ({
    id: s.id,
    label: s.city ? `${s.city.name}, ${s.city.country}` : s.custom_location || 'Custom Stop',
  }));

  const handleOpenEditor = () => {
    setEditingNote(undefined);
    setIsEditorOpen(true);
  };

  const handleEditNote = (note: TripNote) => {
    setViewingNote(null);
    setEditingNote(note);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingNote(undefined);
  };

  if (!activeTrip) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center mt-20">
        <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
        <h2 className="text-2xl font-heading font-bold text-[#0b1c30] mb-2">No Active Trip</h2>
        <p className="text-slate-500">Select a trip to view your notes.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-heading font-black text-[#0b1c30] tracking-tight">Trip Notes</h1>
          <p className="text-slate-500 mt-1">{activeTrip.name} · {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={handleOpenEditor}
          className="btn-primary py-2.5 px-6 flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Note
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8604C]/20 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={filterStopId}
            onChange={(e) => setFilterStopId(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E8604C]/20 transition-all font-medium text-slate-600"
          >
            <option value="">All Notes</option>
            {stops.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="break-inside-avoid bg-white rounded-2xl border border-slate-200 p-5 animate-pulse mb-4">
              <div className="h-3 bg-slate-100 rounded-full w-24 mb-3" />
              <div className="space-y-2">
                <div className="h-2 bg-slate-100 rounded-full w-full" />
                <div className="h-2 bg-slate-100 rounded-full w-5/6" />
                <div className="h-2 bg-slate-100 rounded-full w-4/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Masonry Notes Grid */}
      {!isLoading && filteredNotes.length > 0 && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {filteredNotes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="break-inside-avoid mb-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#E8604C]/30 transition-all cursor-pointer group"
              onClick={() => setViewingNote(note)}
            >
              <div className="p-5">
                {/* Stop tag */}
                {note.stop && (
                  <div className="flex items-center gap-1.5 text-xs text-[#E8604C] font-bold mb-2.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {note.stop.city ? note.stop.city.name : note.stop.custom_city_name || 'Custom Stop'}
                  </div>
                )}

                {/* Content preview */}
                <p className="text-sm text-[#0b1c30] leading-relaxed line-clamp-6">
                  {note.content}
                </p>

                {/* Image preview */}
                {note.image_url && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-slate-100 max-h-48">
                    <img src={note.image_url} alt="Note attachment" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400 font-medium">
                    {format(new Date(note.created_at), 'MMM d, yyyy')}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditNote(note); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#E8604C] hover:bg-[#E8604C]/10 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNoteToDelete(note.id);
                      }}
                      disabled={deleteNote.isPending}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredNotes.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <StickyNote className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="font-heading font-bold text-[#0b1c30] text-lg mb-2">
            {search || filterStopId ? 'No notes match your filters' : 'No notes yet'}
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            {search || filterStopId
              ? 'Try adjusting your search or stop filter.'
              : 'Start capturing your travel memories and thoughts.'}
          </p>
          {!search && !filterStopId && (
            <button onClick={handleOpenEditor} className="btn-primary py-2.5 px-8">
              <Plus className="w-4 h-4" /> Add Your First Note
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <NoteEditor
        open={isEditorOpen}
        onClose={handleCloseEditor}
        tripId={tripId}
        existing={editingNote}
        stops={stops}
      />
      <NoteView
        note={viewingNote}
        onClose={() => setViewingNote(null)}
        onEdit={handleEditNote}
      />
      <DeleteConfirmModal
        open={!!noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
            deleteNote.mutate(noteToDelete, {
              onSuccess: () => setNoteToDelete(null)
            });
          }
        }}
        isPending={deleteNote.isPending}
      />
    </div>
  );
}
