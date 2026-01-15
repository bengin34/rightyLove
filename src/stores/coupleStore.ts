import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import type { Couple } from '@/types';

interface CoupleStore {
  // State
  couple: Couple | null;
  partnerId: string | null;
  isPaired: boolean;
  inviteCode: string | null;
  isLoading: boolean;

  // Actions
  setCouple: (couple: Couple | null) => void;
  setInviteCode: (code: string) => void;
  setLoading: (loading: boolean) => void;
  unpair: () => void;
}

export const useCoupleStore = create<CoupleStore>()(
  persist(
    (set, get) => ({
      // Initial state
      couple: null,
      partnerId: null,
      isPaired: false,
      inviteCode: null,
      isLoading: false,

      // Actions
      setCouple: (couple) => {
        const currentUserId = ''; // Will be obtained from authStore
        set({
          couple,
          isPaired: !!couple,
          partnerId: couple
            ? couple.memberA === currentUserId
              ? couple.memberB
              : couple.memberA
            : null,
        });
      },

      setInviteCode: (inviteCode) => set({ inviteCode }),

      setLoading: (isLoading) => set({ isLoading }),

      unpair: () =>
        set({
          couple: null,
          partnerId: null,
          isPaired: false,
        }),
    }),
    {
      name: 'couple-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        couple: state.couple,
        partnerId: state.partnerId,
        isPaired: state.isPaired,
        inviteCode: state.inviteCode,
      }),
    }
  )
);
