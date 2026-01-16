import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '@/lib/storage';
import { useAuthStore } from '@/stores/authStore';
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
        const currentUserId = useAuthStore.getState().user?.id || '';
        const partnerId =
          couple && currentUserId
            ? couple.memberA === currentUserId
              ? couple.memberB || null
              : couple.memberA
            : null;
        set({
          couple,
          isPaired: !!(couple && couple.memberB),
          partnerId,
          inviteCode: couple?.inviteCode ?? null,
        });
      },

      setInviteCode: (inviteCode) => set({ inviteCode }),

      setLoading: (isLoading) => set({ isLoading }),

      unpair: () =>
        set({
          couple: null,
          partnerId: null,
          isPaired: false,
          inviteCode: null,
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
