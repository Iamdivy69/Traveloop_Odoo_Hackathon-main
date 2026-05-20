import { useState, useEffect, useMemo, useRef } from 'react';
import { useStore } from '../store/useStore';
import type { Note } from '../store/useStore';
import {
  Share2,
  Bold,
  Italic,
  Underline,
  List,
  Image,
  MapPin,
  Calendar,
  Plus,
  CheckSquare,
  Upload,
  Flag,
  Search,
  Trash2,
  Archive,
  Copy,
  Star,
  Clock,
  Layout,
  Smile,
  Heart,
  History,
  X,
  FileText,
  Map as MapIcon,
  Sparkles,
  Sun,
  Cloud,
  Pin,
  MoreHorizontal,
} from 'lucide-react';
import { format } from 'date-fns';

export default function TripNotes() {
  const { trips, activeTrip, updateNote, addNote, deleteNote, archiveNote, duplicateNote, pinNote } = useStore();
  
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'favorites' | 'archived'>('all');
  const [isTimelineMode, setIsTimelineMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setNoteContent(editorRef.current.innerHTML);
    }
  };

  // Flatten all notes from all trips for the history sidebar
  const allNotes = useMemo(() => {
    return trips.flatMap(trip => trip.notes.map(note => ({ ...note, tripName: trip.name })));
  }, [trips]);

  const filteredNotes = useMemo(() => {
    return allNotes
      .filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             note.tripName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterType === 'all' ? !note.archived : 
                             filterType === 'favorites' ? note.favorite && !note.archived : 
                             note.archived;
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [allNotes, searchQuery, filterType]);

  const selectedNote = useMemo(() => {
    return allNotes.find(n => n.id === selectedNoteId) || null;
  }, [allNotes, selectedNoteId]);

  // Sync editor content with selected note
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (selectedNote) {
      setNoteTitle(selectedNote.title);
      setNoteContent(selectedNote.content);
      if (editorRef.current && editorRef.current.innerHTML !== selectedNote.content) {
        editorRef.current.innerHTML = selectedNote.content;
      }
    } else if (filteredNotes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(filteredNotes[0].id);
    }
  }, [selectedNote, filteredNotes, selectedNoteId]);

  // Auto-save logic
  useEffect(() => {
    if (!selectedNote) return;

    const timer = setTimeout(() => {
      if (noteTitle !== selectedNote.title || noteContent !== selectedNote.content) {
        setIsSaving(true);
        updateNote(selectedNote.tripId, selectedNote.id, {
          title: noteTitle,
          content: noteContent,
        });
        setTimeout(() => setIsSaving(false), 800);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [noteTitle, noteContent, selectedNote, updateNote]);

  const handleCreateNote = () => {
    if (!activeTrip) return;
    const newNote = {
      tripId: activeTrip.id,
      title: 'New Journal Entry',
      content: '',
      date: new Date().toISOString().split('T')[0],
      stop: activeTrip.destination.split(',')[0],
      updatedAt: new Date().toISOString(),
    };
    addNote(activeTrip.id, newNote);
  };

  const toggleFavorite = (note: Note) => {
    updateNote(note.tripId, note.id, { favorite: !note.favorite });
  };

  const togglePin = (note: Note) => {
    pinNote(note.tripId, note.id);
  };

  const reminders = selectedNote?.reminders || [];
  const photos = selectedNote?.photos || [];

  const handleToggleReminder = (id: string) => {
    if (!selectedNote) return;
    const newReminders = reminders.map(r => r.id === id ? { ...r, done: !r.done } : r);
    updateNote(selectedNote.tripId, selectedNote.id, { reminders: newReminders });
  };

  const handleAddReminder = () => {
    if (!selectedNote) return;
    const text = prompt('Enter a new reminder:');
    if (!text) return;
    const newReminder = { id: Date.now().toString(), text, done: false };
    updateNote(selectedNote.tripId, selectedNote.id, { reminders: [...reminders, newReminder] });
  };

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedNote) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      updateNote(selectedNote.tripId, selectedNote.id, { photos: [...photos, base64Url] });
    };
    reader.readAsDataURL(file);
    
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleRemovePhoto = (index: number) => {
    if (!selectedNote) return;
    const newPhotos = photos.filter((_, i) => i !== index);
    updateNote(selectedNote.tripId, selectedNote.id, { photos: newPhotos });
  };

  const handleApplySuggestion = () => {
    if (!selectedNote) return;
    const suggestion = " (Weather log: Misty 18°C at Bamboo Grove)";
    document.execCommand('insertText', false, suggestion);
    if (editorRef.current) {
      setNoteContent(editorRef.current.innerHTML);
    }
  };

  const moods = [
    { icon: Smile, label: 'Happy' },
    { icon: Heart, label: 'Loved' },
    { icon: Sparkles, label: 'Excited' },
    { icon: Sun, label: 'Sunny' },
    { icon: Cloud, label: 'Relaxed' },
  ];

  return (
    <div className="flex h-[calc(100vh-120px)] -m-6 overflow-hidden bg-[#F8FAFC]">
      {/* ── History Sidebar ── */}
      <div 
        className={`bg-white border-r border-[#e2e8f0] flex flex-col transition-all duration-300 ease-in-out ${
          isHistoryOpen ? 'w-80' : 'w-0 overflow-hidden border-none'
        }`}
      >
        <div className="p-5 border-b border-[#f1f5f9] flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0b1c30] font-heading flex items-center gap-2">
            <History className="w-5 h-5 text-[#E8604C]" />
            Memories
          </h2>
          <button onClick={handleCreateNote} className="p-2 rounded-lg bg-[#E8604C]/10 text-[#E8604C] hover:bg-[#E8604C]/20 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Search memories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#f1f5f9] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E8604C]/20 transition-all"
            />
          </div>

          <div className="flex gap-1">
            {(['all', 'favorites', 'archived'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all ${
                  filterType === type 
                    ? 'bg-[#001b26] text-white border-[#001b26]' 
                    : 'bg-white text-[#94a3b8] border-[#e2e8f0] hover:bg-[#f1f5f9]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-3 scroll-thin">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`w-full text-left p-4 rounded-2xl transition-all border group relative ${
                  selectedNoteId === note.id
                    ? 'bg-white border-[#E8604C] shadow-sm'
                    : 'bg-white border-transparent hover:border-[#e2e8f0] hover:bg-[#f8fafc]'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-bold text-[#E8604C] uppercase tracking-widest">{note.tripName}</span>
                  <div className="flex items-center gap-1">
                    {note.pinned && <Pin className="w-3 h-3 text-[#E8604C] fill-[#E8604C]" />}
                    {note.favorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                    <span className="text-[10px] text-[#94a3b8]">{note.date ? format(new Date(note.date), 'MMM d') : ''}</span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-[#0b1c30] mb-1 truncate font-heading">{note.title}</h3>
                <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">
                  {note.content || 'No content yet...'}
                </p>
                <div className="mt-3 flex items-center justify-between text-[10px] text-[#94a3b8]">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> 
                      {note.updatedAt ? format(new Date(note.updatedAt), 'HH:mm') : ''}
                    </span>
                    {note.photos && note.photos.length > 0 && (
                      <span className="flex items-center gap-0.5"><Image className="w-3 h-3" /> {note.photos.length}</span>
                    )}
                  </div>
                  {note.mood && <span className="p-1 rounded-md bg-[#f1f5f9] text-[#64748B]">{note.mood}</span>}
                </div>
              </button>
            ))
          ) : (
            <div className="py-12 text-center">
              <Sparkles className="w-10 h-10 text-[#e2e8f0] mx-auto mb-3" />
              <p className="text-sm text-[#64748B]">No memories found.</p>
              <p className="text-xs text-[#94a3b8] mt-1">Start your journey today.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Panel ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Editor Header */}
        <div className="h-16 border-b border-[#f1f5f9] px-6 flex items-center justify-between flex-shrink-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="p-2 rounded-xl text-[#64748B] hover:bg-[#f1f5f9] transition-colors"
            >
              <Layout className="w-5 h-5" />
            </button>
            <div className="h-4 w-px bg-[#e2e8f0]" />
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsTimelineMode(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${!isTimelineMode ? 'bg-[#001b26] text-white' : 'text-[#64748B] hover:bg-[#f1f5f9]'}`}
              >
                Editor
              </button>
              <button 
                onClick={() => setIsTimelineMode(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isTimelineMode ? 'bg-[#001b26] text-white' : 'text-[#64748B] hover:bg-[#f1f5f9]'}`}
              >
                Timeline
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 mr-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">
                {isSaving ? 'Saving...' : 'Saved'}
              </span>
            </div>
            <button 
              onClick={() => alert('Sharing link copied to clipboard!')}
              className="btn-secondary py-2 px-4 text-xs"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            <div className="relative group">
              <button className="p-2 rounded-xl border border-[#e2e8f0] text-[#64748B] hover:bg-[#f1f5f9]">
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <button 
                  onClick={() => selectedNote && duplicateNote(selectedNote.tripId, selectedNote.id)}
                  className="w-full text-left px-4 py-2 text-sm text-[#64748B] hover:bg-[#f8fafc] flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" /> Duplicate
                </button>
                <button 
                  onClick={() => selectedNote && archiveNote(selectedNote.tripId, selectedNote.id)}
                  className="w-full text-left px-4 py-2 text-sm text-[#64748B] hover:bg-[#f8fafc] flex items-center gap-2"
                >
                  <Archive className="w-4 h-4" /> {selectedNote?.archived ? 'Restore' : 'Archive'}
                </button>
                <div className="h-px bg-[#f1f5f9] my-1" />
                <button 
                  onClick={() => selectedNote && deleteNote(selectedNote.tripId, selectedNote.id)}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>

        {isTimelineMode ? (
          /* ── Timeline View ── */
          <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
            <div className="max-w-3xl mx-auto space-y-12">
              <div className="flex flex-col items-center mb-12">
                <div className="w-12 h-12 rounded-2xl bg-[#E8604C] flex items-center justify-center text-white shadow-lg shadow-[#E8604C]/20 mb-4">
                  <MapIcon className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold text-[#0b1c30] font-heading">The Journey Timeline</h2>
                <p className="text-[#64748B] mt-2">Every step, every memory, beautifully preserved.</p>
              </div>

              <div className="relative border-l-2 border-[#e2e8f0] ml-4 pl-10 space-y-12">
                {filteredNotes.map((note) => (
                  <div key={note.id} className="relative">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[49px] top-0 w-4 h-4 rounded-full border-4 border-white bg-[#E8604C] shadow-sm" />
                    
                    <div className="flex flex-col md:flex-row gap-6 group">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">{note.date ? format(new Date(note.date), 'MMMM do, yyyy') : ''}</span>
                          <span className="px-2 py-0.5 rounded-md bg-[#f1f5f9] text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{note.tripName}</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#0b1c30] font-heading mb-3">{note.title}</h3>
                        <p className="text-[#64748B] text-sm leading-relaxed mb-4 line-clamp-3">
                          {note.content}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[#94a3b8]">
                          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {note.location || 'Logged location'}</span>
                          {note.mood && <span className="flex items-center gap-1"><Smile className="w-3.5 h-3.5" /> {note.mood}</span>}
                        </div>
                      </div>
                      
                      {note.photos && note.photos.length > 0 ? (
                        <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden border border-[#e2e8f0] shadow-sm">
                          <img src={note.photos[0]} className="w-full h-full object-cover" alt="Memory" />
                        </div>
                      ) : (
                        <div className="w-full md:w-48 h-32 rounded-2xl bg-[#f1f5f9] flex items-center justify-center text-[#94a3b8]">
                          <FileText className="w-8 h-8 opacity-20" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ── Editor View ── */
          <div className="flex-1 flex overflow-hidden">
            {/* Main Editor */}
            <div className="flex-1 overflow-y-auto p-8 scroll-thin">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Meta Inputs */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Entry Title..."
                      className="text-4xl font-bold text-[#0b1c30] font-heading placeholder:text-[#e2e8f0] focus:outline-none bg-transparent w-full"
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={() => selectedNote && togglePin(selectedNote)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          selectedNote?.pinned 
                            ? 'bg-[#E8604C]/10 border-[#E8604C]/20 text-[#E8604C] shadow-sm' 
                            : 'border-[#e2e8f0] text-[#94a3b8] hover:bg-[#f8fafc]'
                        }`}
                        title="Pin Note"
                      >
                        <Pin className={`w-5 h-5 ${selectedNote?.pinned ? 'fill-[#E8604C]' : ''}`} />
                      </button>
                      <button 
                        onClick={() => selectedNote && toggleFavorite(selectedNote)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          selectedNote?.favorite 
                            ? 'bg-amber-50 border-amber-200 text-amber-500 shadow-sm' 
                            : 'border-[#e2e8f0] text-[#94a3b8] hover:bg-[#f8fafc]'
                        }`}
                        title="Favorite Note"
                      >
                        <Star className={`w-5 h-5 ${selectedNote?.favorite ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 py-4 border-y border-[#f1f5f9]">
                    <button 
                      onClick={() => alert('Date picker coming soon!')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-xs font-medium text-[#64748B] hover:bg-[#f1f5f9] transition-all"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {selectedNote && selectedNote.date ? format(new Date(selectedNote.date), 'MMMM d, yyyy') : 'No Date'}
                    </button>
                    <button 
                      onClick={() => {
                        const loc = prompt('Enter location:');
                        if (loc && selectedNote) updateNote(selectedNote.tripId, selectedNote.id, { location: loc });
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-xs font-medium text-[#64748B] hover:bg-[#f1f5f9] transition-all"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedNote?.location || 'Add Location'}
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mr-1">Mood:</span>
                      <div className="flex gap-1">
                        {moods.map((m, i) => {
                          const Icon = m.icon;
                          const isActive = selectedNote?.mood === m.label;
                          return (
                            <button
                              key={i}
                              onClick={() => selectedNote && updateNote(selectedNote.tripId, selectedNote.id, { mood: m.label })}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                isActive ? 'bg-[#E8604C] text-white shadow-md' : 'text-[#94a3b8] hover:bg-[#f1f5f9] hover:text-[#0b1c30]'
                              }`}
                              title={m.label}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center gap-1 p-2 bg-white rounded-2xl border border-[#e2e8f0] sticky top-0 z-10 shadow-sm">
                  <button onMouseDown={(e) => { e.preventDefault(); applyCommand('bold'); }} className="p-2.5 rounded-xl text-[#64748B] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-colors" title="Bold">
                    <Bold className="w-4 h-4" />
                  </button>
                  <button onMouseDown={(e) => { e.preventDefault(); applyCommand('italic'); }} className="p-2.5 rounded-xl text-[#64748B] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-colors" title="Italic">
                    <Italic className="w-4 h-4" />
                  </button>
                  <button onMouseDown={(e) => { e.preventDefault(); applyCommand('underline'); }} className="p-2.5 rounded-xl text-[#64748B] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-colors" title="Underline">
                    <Underline className="w-4 h-4" />
                  </button>
                  
                  <div className="w-px h-5 bg-[#e2e8f0] mx-1" />
                  <button 
                    onMouseDown={(e) => { e.preventDefault(); applyCommand('formatBlock', 'H1'); }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-colors"
                  >
                    H1
                  </button>
                  <button 
                    onMouseDown={(e) => { e.preventDefault(); applyCommand('formatBlock', 'H2'); }}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-colors"
                  >
                    H2
                  </button>
                  <div className="w-px h-5 bg-[#e2e8f0] mx-1" />
                  <button onMouseDown={(e) => { e.preventDefault(); applyCommand('insertUnorderedList'); }} className="p-2.5 rounded-xl text-[#64748B] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-colors" title="List">
                    <List className="w-4 h-4" />
                  </button>
                  {[Image, MapPin, Sparkles].map((Icon, i) => (
                    <button 
                      key={i} 
                      onClick={() => alert('Attachment features coming soon!')}
                      className="p-2.5 rounded-xl text-[#64748B] hover:bg-[#f1f5f9] hover:text-[#0b1c30] transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>

                {/* Text Area */}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={(e) => setNoteContent(e.currentTarget.innerHTML)}
                  className="w-full min-h-[500px] text-lg text-[#0b1c30] focus:outline-none leading-relaxed font-body"
                  style={{ whiteSpace: 'pre-wrap' }}
                />
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-80 border-l border-[#f1f5f9] flex flex-col p-6 space-y-6 overflow-y-auto bg-white hidden xl:flex">
              {/* Quick Reminders */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#0b1c30] font-heading text-sm flex items-center gap-2">
                    <Flag className="w-4 h-4 text-[#E8604C]" />
                    Reminders
                  </h3>
                  <button 
                    onClick={handleAddReminder}
                    className="p-1 rounded-lg text-[#94a3b8] hover:bg-[#f1f5f9]"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3">
                  {reminders.length === 0 ? (
                    <p className="text-xs text-[#94a3b8] italic">No reminders yet.</p>
                  ) : (
                    reminders.map((r) => (
                      <div 
                        key={r.id} 
                        onClick={() => handleToggleReminder(r.id)}
                        className="flex items-start gap-3 p-3 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9] cursor-pointer hover:border-[#e2e8f0] transition-colors"
                      >
                        <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          r.done ? 'bg-[#E8604C] border-[#E8604C]' : 'border-[#e2e8f0]'
                        }`}>
                          {r.done && <CheckSquare className="w-3 h-3 text-white" />}
                        </div>
                        <p className={`text-xs font-medium leading-tight ${r.done ? 'line-through text-[#94a3b8]' : 'text-[#0b1c30]'}`}>
                          {r.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Photos Gallery */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#0b1c30] font-heading text-sm">Photos</h3>
                  <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">{photos.length} items</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {photos.map((photo, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-[#f1f5f9] group relative">
                      <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => handleRemovePhoto(i)} className="p-2 hover:bg-black/30 rounded-full transition-colors">
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={handleAddPhoto}
                    className="aspect-square rounded-2xl border-2 border-dashed border-[#e2e8f0] flex flex-col items-center justify-center text-[#94a3b8] hover:border-[#E8604C]/40 hover:text-[#E8604C] transition-all"
                  >
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-bold">Add</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
              </div>

              {/* AI Suggestion */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#001b26] to-[#0d313f] text-white space-y-3 relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#E8604C]/20 rounded-full blur-2xl" />
                <div className="flex items-center gap-2 text-amber-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">AI Concierge</span>
                </div>
                <p className="text-xs text-white/80 leading-relaxed italic">
                  "You mentioned the Bamboo Grove earlier. Would you like to add the weather log for that moment? It was a misty 18°C."
                </p>
                <button 
                  onClick={handleApplySuggestion}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold transition-all"
                >
                  Apply Suggestion
                </button>
              </div>

              {/* Weather/Location Info */}
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#f1f5f9] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#f1f5f9] flex items-center justify-center text-[#E8604C] flex-shrink-0 shadow-sm">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0b1c30]">Kyoto, Japan</p>
                  <p className="text-[10px] text-[#94a3b8]">22°C • Clear Skies</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
