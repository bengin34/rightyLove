import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import type { BucketItem, BucketCategory } from '@/types';

interface BucketStore {
  // State
  items: BucketItem[];

  // Actions
  addItem: (text: string, category: BucketCategory) => void;
  removeItem: (id: string) => void;
  toggleComplete: (id: string) => void;
  updateItem: (id: string, text: string) => void;
  getItemsByCategory: (category: BucketCategory) => BucketItem[];
  getActiveItems: (category: BucketCategory) => BucketItem[];
  getCompletedItems: (category: BucketCategory) => BucketItem[];
  getWeeklyCompletedCount: () => number;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getWeekStart = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export const useBucketStore = create<BucketStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],

      // Actions
      addItem: (text, category) => {
        const newItem: BucketItem = {
          id: generateId(),
          text,
          category,
          createdAt: new Date(),
        };
        set((state) => ({
          items: [newItem, ...state.items],
        }));
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      toggleComplete: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  completedAt: item.completedAt ? undefined : new Date(),
                }
              : item
          ),
        })),

      updateItem: (id, text) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, text } : item
          ),
        })),

      getItemsByCategory: (category) =>
        get().items.filter((item) => item.category === category),

      getActiveItems: (category) =>
        get()
          .items.filter((item) => item.category === category && !item.completedAt)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),

      getCompletedItems: (category) =>
        get()
          .items.filter((item) => item.category === category && item.completedAt)
          .sort(
            (a, b) =>
              new Date(b.completedAt!).getTime() -
              new Date(a.completedAt!).getTime()
          ),

      getWeeklyCompletedCount: () => {
        const weekStart = getWeekStart();
        return get().items.filter(
          (item) =>
            item.completedAt && new Date(item.completedAt) >= weekStart
        ).length;
      },
    }),
    {
      name: 'bucket-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
