import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import type { User, OnboardingData, RelationshipType, RelationshipDuration } from '@/types';

interface AuthStore {
  // Auth state
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Onboarding state
  onboarding: OnboardingData;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;

  // Onboarding actions
  setRelationshipType: (type: RelationshipType) => void;
  setDuration: (duration: RelationshipDuration) => void;
  setRelationshipStartDate: (date: Date) => void;
  setNotificationTime: (time: Date) => void;
  completeOnboarding: () => void;
}

const initialOnboarding: OnboardingData = {
  relationshipType: null,
  duration: null,
  relationshipStartDate: null,
  notificationTime: null,
  isComplete: false,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isLoading: true,
      isAuthenticated: false,
      onboarding: initialOnboarding,

      // Auth actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          onboarding: initialOnboarding,
        }),

      // Onboarding actions
      setRelationshipType: (relationshipType) =>
        set((state) => ({
          onboarding: { ...state.onboarding, relationshipType },
        })),

      setDuration: (duration) =>
        set((state) => ({
          onboarding: { ...state.onboarding, duration },
        })),

      setRelationshipStartDate: (relationshipStartDate) =>
        set((state) => ({
          onboarding: { ...state.onboarding, relationshipStartDate },
        })),

      setNotificationTime: (notificationTime) =>
        set((state) => ({
          onboarding: { ...state.onboarding, notificationTime },
        })),

      completeOnboarding: () =>
        set((state) => ({
          onboarding: { ...state.onboarding, isComplete: true },
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        onboarding: state.onboarding,
      }),
    }
  )
);
