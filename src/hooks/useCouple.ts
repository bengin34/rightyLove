import { useEffect } from 'react';
import { useCoupleStore } from '@/stores/coupleStore';
import { useAuthStore } from '@/stores/authStore';
import {
  getCurrentCouple,
  createCouple as createCoupleService,
  joinCouple as joinCoupleService,
  unpairCouple as unpairCoupleService,
  regenerateInviteCode as regenerateCodeService,
} from '@/services/couple';

export function useCouple() {
  const {
    couple,
    partnerId,
    isPaired,
    inviteCode,
    isLoading,
    setCouple,
    setLoading,
  } = useCoupleStore();

  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Fetch couple data when authenticated
    const fetchCouple = async () => {
      if (!isAuthenticated) return;

      setLoading(true);
      try {
        await getCurrentCouple();
      } catch (error) {
        console.error('Error fetching couple:', error);
      }
      setLoading(false);
    };

    fetchCouple();
  }, [isAuthenticated, setLoading]);

  const createCouple = async () => {
    setLoading(true);
    const result = await createCoupleService();
    setLoading(false);
    return result;
  };

  const joinCouple = async (code: string) => {
    setLoading(true);
    const result = await joinCoupleService(code);
    setLoading(false);
    return result;
  };

  const unpairCouple = async () => {
    setLoading(true);
    const result = await unpairCoupleService();
    setLoading(false);
    return result;
  };

  const regenerateInviteCode = async () => {
    const result = await regenerateCodeService();
    return result;
  };

  return {
    couple,
    partnerId,
    isPaired,
    inviteCode: couple?.inviteCode || inviteCode,
    isLoading,
    isCoupleFull: !!couple?.memberB,
    createCouple,
    joinCouple,
    unpairCouple,
    regenerateInviteCode,
  };
}
