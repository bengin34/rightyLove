import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import type { Photo } from '@/types';

interface PhotoStore {
  // State
  photos: Photo[];
  currentDeckIndex: number;
  todayLikedCount: number;
  todaySharedCount: number;

  // Actions
  addPhoto: (photo: Photo) => void;
  addPhotos: (photos: Photo[]) => void;
  removePhoto: (id: string) => void;
  likePhoto: (id: string) => void;
  sharePhoto: (id: string) => void;
  setCurrentDeckIndex: (index: number) => void;
  advanceDeck: () => void;
  resetDeck: () => void;
  resetDailyCounters: () => void;
  getWeeklyStats: () => { liked: number; shared: number };
  getTotalCount: () => number;
}

const getTodayKey = () => new Date().toISOString().split('T')[0];

export const usePhotoStore = create<PhotoStore>()(
  persist(
    (set, get) => ({
      // Initial state
      photos: [],
      currentDeckIndex: 0,
      todayLikedCount: 0,
      todaySharedCount: 0,

      // Actions
      addPhoto: (photo) =>
        set((state) => ({
          photos: [photo, ...state.photos],
        })),

      addPhotos: (photos) =>
        set((state) => ({
          photos: [...photos, ...state.photos],
        })),

      removePhoto: (id) =>
        set((state) => ({
          photos: state.photos.filter((p) => p.id !== id),
        })),

      likePhoto: (id) =>
        set((state) => ({
          photos: state.photos.map((p) =>
            p.id === id ? { ...p, likedAt: new Date() } : p
          ),
          todayLikedCount: state.todayLikedCount + 1,
        })),

      sharePhoto: (id) =>
        set((state) => ({
          photos: state.photos.map((p) =>
            p.id === id ? { ...p, sharedAt: new Date() } : p
          ),
          todaySharedCount: state.todaySharedCount + 1,
        })),

      setCurrentDeckIndex: (currentDeckIndex) => set({ currentDeckIndex }),

      advanceDeck: () =>
        set((state) => ({
          currentDeckIndex: state.currentDeckIndex + 1,
        })),

      resetDeck: () => set({ currentDeckIndex: 0 }),

      resetDailyCounters: () =>
        set({
          todayLikedCount: 0,
          todaySharedCount: 0,
        }),

      getWeeklyStats: () => {
        const photos = get().photos;
        const today = new Date();
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        monday.setHours(0, 0, 0, 0);

        let liked = 0;
        let shared = 0;

        for (const photo of photos) {
          if (photo.likedAt && new Date(photo.likedAt) >= monday) {
            liked++;
          }
          if (photo.sharedAt && new Date(photo.sharedAt) >= monday) {
            shared++;
          }
        }

        return { liked, shared };
      },

      getTotalCount: () => get().photos.length,
    }),
    {
      name: 'photo-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        photos: state.photos,
      }),
    }
  )
);
