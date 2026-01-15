import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getCurrentUser, onAuthStateChange, signOut as signOutService } from '@/services/auth';

export function useAuth() {
  const {
    user,
    isLoading,
    isAuthenticated,
    onboarding,
    setUser,
    setLoading,
    logout,
  } = useAuthStore();

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      }
    };

    checkSession();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
    });

    return unsubscribe;
  }, [setUser]);

  const signOut = async () => {
    const result = await signOutService();
    if (result.success) {
      logout();
    }
    return result;
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    isOnboardingComplete: onboarding.isComplete,
    signOut,
  };
}
