import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  photo: string;
  bio: string;
}

export interface ItinerarySection {
  id: string;
  title: string;
  description: string;
  dateRange: string;
  budget: number;
}

export interface CustomExpense {
  id: string;
  category: string;
  description: string;
  details: string;
  amount: number;
}

export interface Note {
  id: string;
  tripId: string;
  title: string;
  content: string;
  date: string;
  stop: string;
  tags?: string[];
  mood?: string;
  location?: string;
  photos?: string[];
  reminders?: { id: string; text: string; done: boolean }[];
  favorite?: boolean;
  pinned?: boolean;
  archived?: boolean;
  updatedAt: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string;
  coverImage: string;
  status: 'ongoing' | 'upcoming' | 'completed';
  budget: number;
  spent: number;
  sections: ItinerarySection[];
  notes: Note[];
  customExpenses?: CustomExpense[];
  createdBy: string;
}

export interface ChecklistItem {
  id: string;
  name: string;
  packed: boolean;
  category: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  destination: string;
  likes: number;
  date: string;
}

interface AppState {
  // Auth
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (data: Omit<User, 'id'>) => boolean;
  updateProfile: (data: Partial<User>) => void;

  // Trips
  trips: Trip[];
  activeTrip: Trip | null;
  createTrip: (trip: Omit<Trip, 'id' | 'sections' | 'notes'>) => void;
  updateTrip: (id: string, data: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  setActiveTrip: (trip: Trip | null) => void;

  // Checklist
  checklist: ChecklistItem[];
  toggleChecklistItem: (id: string) => void;
  addChecklistItem: (item: Omit<ChecklistItem, 'id'>) => void;
  resetChecklist: () => void;

  // Community
  communityPosts: CommunityPost[];
  addCommunityPost: (post: Omit<CommunityPost, 'id' | 'likes' | 'date'>) => void;
  likePost: (id: string) => void;

  // Notes
  addNote: (tripId: string, note: Omit<Note, 'id' | 'updatedAt'>) => void;
  updateNote: (tripId: string, noteId: string, data: Partial<Note>) => void;
  deleteNote: (tripId: string, noteId: string) => void;
  archiveNote: (tripId: string, noteId: string) => void;
  pinNote: (tripId: string, noteId: string) => void;
  duplicateNote: (tripId: string, noteId: string) => void;

  // UI
  isAdmin: boolean;
}

const seedTrips: Trip[] = [
  {
    id: '1',
    name: 'Paris & Rome Adventure',
    destination: 'Paris, Rome',
    startDate: '2025-06-10',
    endDate: '2025-06-20',
    description: 'A romantic European getaway exploring the best of Paris and Rome.',
    coverImage: '/images/dest-paris.jpg',
    status: 'upcoming',
    budget: 8000,
    spent: 3200,
    createdBy: 'James Wilson',
    sections: [
      { id: 's1', title: 'Paris Stay', description: 'Hotel near Eiffel Tower, Seine river cruise, Louvre Museum visit', dateRange: 'Jun 10 - Jun 14', budget: 3500 },
      { id: 's2', title: 'Travel to Rome', description: 'Flight from Paris to Rome, train station transfers', dateRange: 'Jun 14 - Jun 15', budget: 800 },
      { id: 's3', title: 'Rome Stay', description: 'Colosseum tour, Vatican visit, Italian cooking class', dateRange: 'Jun 15 - Jun 20', budget: 3700 },
    ],
    notes: [
      { id: 'n1', tripId: '1', title: 'Hotel check-in details - Paris', content: 'Check in after 2pm, Room 302, Breakfast included (7-10am)', date: '2025-06-10', stop: 'Paris', updatedAt: '2025-06-10T14:00:00Z', mood: 'Happy', location: 'Paris, France' },
      { id: 'n2', tripId: '1', title: 'Museum bookings', content: 'Louvre tickets booked for June 12 at 10am. Skip-the-line access.', date: '2025-06-11', stop: 'Paris', updatedAt: '2025-06-11T09:00:00Z', favorite: true, location: 'Louvre Museum' },
    ],
  },
  {
    id: '2',
    name: 'Tokyo Explorer',
    destination: 'Tokyo, Kyoto, Osaka',
    startDate: '2025-04-01',
    endDate: '2025-04-12',
    description: 'Cherry blossom season adventure through Japan.',
    coverImage: '/images/dest-tokyo.jpg',
    status: 'completed',
    budget: 12000,
    spent: 11500,
    createdBy: 'James Wilson',
    sections: [
      { id: 's4', title: 'Tokyo Experience', description: 'Shibuya crossing, Meiji Shrine, Tsukiji Market, Akihabara', dateRange: 'Apr 1 - Apr 5', budget: 4500 },
      { id: 's5', title: 'Kyoto Temples', description: 'Fushimi Inari, Kinkaku-ji, Arashiyama bamboo grove', dateRange: 'Apr 5 - Apr 9', budget: 4000 },
      { id: 's6', title: 'Osaka Food Tour', description: 'Dotonbori street food, Osaka Castle, Universal Studios', dateRange: 'Apr 9 - Apr 12', budget: 3000 },
    ],
    notes: [
      { id: 'n3', tripId: '2', title: 'JR Pass info', content: '7-day JR Pass activated on April 1. Keep passport handy.', date: '2025-04-01', stop: 'Tokyo', updatedAt: '2025-04-01T10:00:00Z', mood: 'Organized', location: 'Tokyo Station' },
    ],
  },
  {
    id: '3',
    name: 'Iceland Northern Lights',
    destination: 'Reykjavik, Iceland',
    startDate: '2025-02-15',
    endDate: '2025-02-22',
    description: 'Chasing auroras and exploring glaciers.',
    coverImage: '/images/dest-iceland.jpg',
    status: 'completed',
    budget: 6000,
    spent: 5800,
    createdBy: 'James Wilson',
    sections: [
      { id: 's7', title: 'Golden Circle Tour', description: 'Thingvellir, Geysir, Gullfoss waterfall', dateRange: 'Feb 15 - Feb 18', budget: 2500 },
      { id: 's8', title: 'South Coast Adventure', description: 'Black sand beaches, Skogafoss, glacier hiking', dateRange: 'Feb 18 - Feb 22', budget: 3300 },
    ],
    notes: [],
  },
  {
    id: '4',
    name: 'Bali Retreat',
    destination: 'Ubud, Bali',
    startDate: '2025-09-01',
    endDate: '2025-09-10',
    description: 'Wellness and cultural immersion in Bali.',
    coverImage: '/images/dest-bali.jpg',
    status: 'ongoing',
    budget: 4000,
    spent: 1800,
    createdBy: 'James Wilson',
    sections: [
      { id: 's9', title: 'Ubud Wellness', description: 'Yoga retreat, rice terrace walks, Monkey Forest', dateRange: 'Sep 1 - Sep 5', budget: 2000 },
      { id: 's10', title: 'Beach Days', description: 'Seminyak beach clubs, surfing lessons, sunset dinners', dateRange: 'Sep 5 - Sep 10', budget: 2000 },
    ],
    notes: [
      { id: 'n4', tripId: '4', title: 'Yoga schedule', content: 'Daily yoga at 7am. Don\'t forget to bring own mat.', date: '2025-09-01', stop: 'Ubud', updatedAt: '2025-09-01T08:00:00Z', mood: 'Zen', location: 'Yoga Barn' },
    ],
  },
];

const seedChecklist: ChecklistItem[] = [
  { id: 'c1', name: 'Passport', packed: true, category: 'Documents' },
  { id: 'c2', name: 'Flight Tickets (printed)', packed: true, category: 'Documents' },
  { id: 'c3', name: 'Travel Insurance', packed: true, category: 'Documents' },
  { id: 'c4', name: 'Hotel Booking Confirmation', packed: false, category: 'Documents' },
  { id: 'c5', name: 'Casual Shirts', packed: false, category: 'Clothing' },
  { id: 'c6', name: 'Trousers / Jeans', packed: true, category: 'Clothing' },
  { id: 'c7', name: 'Comfortable Walking Shoes', packed: false, category: 'Clothing' },
  { id: 'c8', name: 'Light Jacket / Windbreaker', packed: false, category: 'Clothing' },
  { id: 'c9', name: 'Phone Charger', packed: true, category: 'Electronics' },
  { id: 'c10', name: 'Universal Power Adapter', packed: false, category: 'Electronics' },
  { id: 'c11', name: 'Earphones / Headphones', packed: false, category: 'Electronics' },
  { id: 'c12', name: 'Camera + Memory Cards', packed: false, category: 'Electronics' },
];

const seedCommunityPosts: CommunityPost[] = [
  { id: 'p1', author: 'Sarah Chen', avatar: '/images/user-avatar.jpg', title: 'Hidden gems in Kyoto', content: 'Found this amazing tea house near Kiyomizu-dera that no one talks about...', destination: 'Kyoto, Japan', likes: 24, date: '2025-01-15' },
  { id: 'p2', author: 'Marco Rossi', avatar: '/images/user-avatar.jpg', title: 'Best pasta in Rome', content: 'Skip the tourist traps and head to Trastevere for authentic carbonara...', destination: 'Rome, Italy', likes: 42, date: '2025-02-20' },
  { id: 'p3', author: 'Emma Watson', avatar: '/images/user-avatar.jpg', title: 'Northern Lights photography tips', content: 'Use ISO 1600+, f/2.8, 15-20s exposure. Best spots away from Reykjavik...', destination: 'Iceland', likes: 67, date: '2025-03-01' },
  { id: 'p4', author: 'James Park', avatar: '/images/user-avatar.jpg', title: 'Budget travel in Southeast Asia', content: 'How I spent 3 months traveling Thailand, Vietnam, and Bali for under $2000...', destination: 'Southeast Asia', likes: 89, date: '2025-03-10' },
  { id: 'p5', author: 'Lisa Mueller', avatar: '/images/user-avatar.jpg', title: 'Swiss Alps hiking guide', content: 'The best trails for beginners and advanced hikers in the Jungfrau region...', destination: 'Swiss Alps', likes: 35, date: '2025-03-25' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Auth
      user: {
        id: '1',
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james@traveloop.com',
        phone: '+1 555 123 4567',
        city: 'San Francisco',
        country: 'USA',
        photo: '/images/user-avatar.jpg',
        bio: 'Passionate traveler exploring the world one city at a time.',
      },
      isLoggedIn: true,
      isAdmin: true,

      login: (email: string, password: string) => {
        if (email && password) {
          set({ isLoggedIn: true });
          return true;
        }
        return false;
      },

      logout: () => set({ isLoggedIn: false, user: null, activeTrip: null }),

      register: (data) => {
        const newUser: User = { ...data, id: Date.now().toString() };
        set({ user: newUser, isLoggedIn: true });
        return true;
      },

      updateProfile: (data) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...data } });
        }
      },

      // Trips
      trips: seedTrips,
      activeTrip: seedTrips[0],

      createTrip: (trip) => {
        const newTrip: Trip = {
          ...trip,
          id: Date.now().toString(),
          sections: [],
          notes: [],
        };
        set({ trips: [...get().trips, newTrip], activeTrip: newTrip });
      },

      updateTrip: (id, data) => {
        set({
          trips: get().trips.map((t) => (t.id === id ? { ...t, ...data } : t)),
        });
      },

      deleteTrip: (id) => {
        set({ trips: get().trips.filter((t) => t.id !== id) });
      },

      setActiveTrip: (trip) => set({ activeTrip: trip }),

      // Checklist
      checklist: seedChecklist,

      toggleChecklistItem: (id) => {
        set({
          checklist: get().checklist.map((item) =>
            item.id === id ? { ...item, packed: !item.packed } : item
          ),
        });
      },

      addChecklistItem: (item) => {
        set({
          checklist: [
            ...get().checklist,
            { ...item, id: Date.now().toString() },
          ],
        });
      },

      resetChecklist: () => {
        set({
          checklist: get().checklist.map((item) => ({
            ...item,
            packed: false,
          })),
        });
      },

      // Community
      communityPosts: seedCommunityPosts,

      addCommunityPost: (post) => {
        const newPost: CommunityPost = {
          ...post,
          id: Date.now().toString(),
          likes: 0,
          date: new Date().toISOString().split('T')[0],
        };
        set({ communityPosts: [newPost, ...get().communityPosts] });
      },

      likePost: (id) => {
        set({
          communityPosts: get().communityPosts.map((p) =>
            p.id === id ? { ...p, likes: p.likes + 1 } : p
          ),
        });
      },

      // Notes
      addNote: (tripId, note) => {
        const newNote: Note = {
          ...note,
          id: Date.now().toString(),
          updatedAt: new Date().toISOString()
        };
        set({
          trips: get().trips.map((t) =>
            t.id === tripId ? { ...t, notes: [newNote, ...t.notes] } : t
          ),
          activeTrip: get().activeTrip?.id === tripId
            ? { ...get().activeTrip!, notes: [newNote, ...get().activeTrip!.notes] }
            : get().activeTrip,
        });
      },

      updateNote: (tripId, noteId, data) => {
        const updatedAt = new Date().toISOString();
        set({
          trips: get().trips.map((t) =>
            t.id === tripId
              ? { ...t, notes: t.notes.map(n => n.id === noteId ? { ...n, ...data, updatedAt } : n) }
              : t
          ),
          activeTrip: get().activeTrip?.id === tripId
            ? { ...get().activeTrip!, notes: get().activeTrip!.notes.map(n => n.id === noteId ? { ...n, ...data, updatedAt } : n) }
            : get().activeTrip,
        });
      },

      deleteNote: (tripId, noteId) => {
        set({
          trips: get().trips.map((t) =>
            t.id === tripId ? { ...t, notes: t.notes.filter((n) => n.id !== noteId) } : t
          ),
          activeTrip: get().activeTrip?.id === tripId
            ? { ...get().activeTrip!, notes: get().activeTrip!.notes.filter((n) => n.id !== noteId) }
            : get().activeTrip,
        });
      },

      archiveNote: (tripId, noteId) => {
        const { trips, activeTrip } = get();
        const updatedAt = new Date().toISOString();
        const updatedTrips = trips.map(t =>
          t.id === tripId
            ? { ...t, notes: t.notes.map(n => n.id === noteId ? { ...n, archived: !n.archived, updatedAt } : n) }
            : t
        );
        set({
          trips: updatedTrips,
          activeTrip: activeTrip?.id === tripId
            ? updatedTrips.find(t => t.id === tripId) || null
            : activeTrip
        });
      },

      pinNote: (tripId, noteId) => {
        const { trips, activeTrip } = get();
        const updatedAt = new Date().toISOString();
        const updatedTrips = trips.map(t =>
          t.id === tripId
            ? { ...t, notes: t.notes.map(n => n.id === noteId ? { ...n, pinned: !n.pinned, updatedAt } : n) }
            : t
        );
        set({
          trips: updatedTrips,
          activeTrip: activeTrip?.id === tripId
            ? updatedTrips.find(t => t.id === tripId) || null
            : activeTrip
        });
      },

      duplicateNote: (tripId, noteId) => {
        const { trips, activeTrip } = get();
        const trip = trips.find(t => t.id === tripId);
        if (!trip) return;
        const note = trip.notes.find(n => n.id === noteId);
        if (!note) return;

        const newNote: Note = {
          ...note,
          id: Date.now().toString(),
          title: `${note.title} (Copy)`,
          updatedAt: new Date().toISOString()
        };

        const updatedTrips = trips.map(t =>
          t.id === tripId ? { ...t, notes: [newNote, ...t.notes] } : t
        );

        set({
          trips: updatedTrips,
          activeTrip: activeTrip?.id === tripId
            ? updatedTrips.find(t => t.id === tripId) || null
            : activeTrip
        });
      },
    }),
    {
      name: 'traveloop-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        trips: state.trips,
        activeTrip: state.activeTrip,
        checklist: state.checklist,
        communityPosts: state.communityPosts,
      }),
    }
  )
);
