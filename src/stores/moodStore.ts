import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import type { Mood, MoodEntry } from '@/types';

interface MoodStore {
  // State
  entries: MoodEntry[];
  todayMood: Mood | null;

  // Actions
  setMood: (mood: Mood) => void;
  getMoodForDate: (dateKey: string) => Mood | null;
  getWeekMoods: () => (Mood | null)[];
  clearTodayMood: () => void;
}

const getTodayKey = () => new Date().toISOString().split('T')[0];

const getWeekDates = (): string[] => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

export const useMoodStore = create<MoodStore>()(
  persist(
    (set, get) => ({
      // Initial state
      entries: [],
      todayMood: null,

      // Actions
      setMood: (mood) => {
        const dateKey = getTodayKey();
        const existingIndex = get().entries.findIndex((e) => e.dateKey === dateKey);
        const newEntry: MoodEntry = {
          dateKey,
          mood,
          createdAt: new Date(),
        };

        set((state) => {
          const entries = [...state.entries];
          if (existingIndex >= 0) {
            entries[existingIndex] = newEntry;
          } else {
            entries.unshift(newEntry);
          }
          return { entries, todayMood: mood };
        });
      },

      getMoodForDate: (dateKey) => {
        const entry = get().entries.find((e) => e.dateKey === dateKey);
        return entry?.mood ?? null;
      },

      getWeekMoods: () => {
        const weekDates = getWeekDates();
        return weekDates.map((dateKey) => get().getMoodForDate(dateKey));
      },

      clearTodayMood: () => set({ todayMood: null }),
    }),
    {
      name: 'mood-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        entries: state.entries,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Check if we have today's mood
          const todayKey = getTodayKey();
          const todayEntry = state.entries.find((e) => e.dateKey === todayKey);
          if (todayEntry) {
            state.todayMood = todayEntry.mood;
          }
        }
      },
    }
  )
);
