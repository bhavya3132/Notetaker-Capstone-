import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ========================================
   TerraNote — Global State (Zustand)
   ======================================== */

// Seed data — 4 starter notes matching the original design
const SEED_NOTES = [
  {
    id: 'note-1',
    title: 'The Fall of Rome',
    body: 'The decline of the Roman Empire was a gradual process influenced by economic troubles, military overexpansion, and political corruption...',
    tags: ['ancient', 'civilization'],
    category: 'History',
    isPinned: true,
    lastWatered: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    connections: ['note-3'],
  },
  {
    id: 'note-2',
    title: 'Calculus Fundamentals',
    body: 'Differential calculus deals with the rate of change. The derivative of a function f(x) represents the slope of the tangent line at any point...',
    tags: ['calculus', 'derivatives'],
    category: 'Maths',
    isPinned: false,
    lastWatered: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    connections: [],
  },
  {
    id: 'note-3',
    title: 'Thermodynamics & Entropy',
    body: 'The second law of thermodynamics states that the total entropy of an isolated system can never decrease. Heat flows spontaneously from hot to cold...',
    tags: ['physics', 'energy'],
    category: 'Science',
    isPinned: false,
    lastWatered: new Date(Date.now() - 172800000).toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    connections: ['note-1'],
  },
  {
    id: 'note-4',
    title: 'Existentialism & Free Will',
    body: 'Sartre argued that existence precedes essence — we are not born with a predetermined purpose. We are condemned to be free, creating meaning through choices...',
    tags: ['existentialism', 'sartre'],
    category: 'Philosophy',
    isPinned: false,
    lastWatered: new Date(Date.now() - 43200000).toISOString(),
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    connections: ['note-3'],
  },
];

const SEED_CONNECTIONS = [
  { sourceId: 'note-1', targetId: 'note-3' },
  { sourceId: 'note-3', targetId: 'note-4' },
];

const useAppStore = create(
  persist(
    (set, get) => ({
      // ===== USER =====
      user: {
        name: 'User',
        email: 'aditya@terranote.dev',
        streak: 5,
        lastActiveDate: new Date().toISOString().split('T')[0],
      },

      // ===== NOTES =====
      notes: SEED_NOTES,

      // ===== CONNECTIONS =====
      connections: SEED_CONNECTIONS,

      // ===== RECENT NOTES (max 7 IDs) =====
      recentNotes: ['note-1', 'note-4', 'note-3'],

      // ===== SETTINGS =====
      settings: {
        sidebarCollapsed: false,
      },

      // ========== ACTIONS ==========

      // Add a new note
      addNote: (note) => {
        const newNote = {
          ...note,
          id: `note-${Date.now()}`,
          lastWatered: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          connections: note.connections || [],
          isPinned: false,
        };
        set((state) => ({
          notes: [...state.notes, newNote],
        }));
        get().pushRecent(newNote.id);
        return newNote.id;
      },

      // Update an existing note
      updateNote: (id, updates) => {
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id
              ? { ...n, ...updates, lastWatered: new Date().toISOString() }
              : n
          ),
        }));
        get().pushRecent(id);
      },

      // Delete a note
      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
          connections: state.connections.filter(
            (c) => c.sourceId !== id && c.targetId !== id
          ),
          recentNotes: state.recentNotes.filter((rid) => rid !== id),
        }));
      },

      // Pin/unpin a note (only 1 pinned at a time)
      pinNote: (id) => {
        set((state) => ({
          notes: state.notes.map((n) => ({
            ...n,
            isPinned: n.id === id ? !n.isPinned : false,
          })),
        }));
      },

      // Add connection between two notes
      addConnection: (sourceId, targetId) => {
        const exists = get().connections.some(
          (c) =>
            (c.sourceId === sourceId && c.targetId === targetId) ||
            (c.sourceId === targetId && c.targetId === sourceId)
        );
        if (!exists) {
          set((state) => ({
            connections: [...state.connections, { sourceId, targetId }],
          }));
        }
      },

      // Toggle sidebar collapsed/expanded
      toggleSidebar: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            sidebarCollapsed: !state.settings.sidebarCollapsed,
          },
        }));
      },

      // Push a note ID to recents (max 7, no duplicates)
      pushRecent: (noteId) => {
        set((state) => {
          const filtered = state.recentNotes.filter((id) => id !== noteId);
          return {
            recentNotes: [noteId, ...filtered].slice(0, 7),
          };
        });
      },

      // Update streak (call on app load / login)
      updateStreak: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastActiveDate, streak } = get().user;

        if (lastActiveDate === today) return; // Already active today

        const lastDate = new Date(lastActiveDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor(
          (todayDate - lastDate) / (1000 * 60 * 60 * 24)
        );

        set((state) => ({
          user: {
            ...state.user,
            streak: diffDays === 1 ? streak + 1 : 1,
            lastActiveDate: today,
          },
        }));
      },
    }),
    {
      name: 'terranote-storage',
    }
  )
);

export default useAppStore;
