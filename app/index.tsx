import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
// import { useCoupleStore } from '@/stores/coupleStore'; // TODO: use for pairing flow

// DEV: Skip auth for easier testing
const DEV_SKIP_AUTH = true; // Set to false to test real auth flow

export default function Index() {
  const { isAuthenticated, onboarding, setUser, completeOnboarding } = useAuthStore();

  // DEV: Auto-login with mock user
  useEffect(() => {
    if (DEV_SKIP_AUTH && !isAuthenticated) {
      setUser({
        id: 'dev-user-123',
        email: 'dev@test.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      completeOnboarding();
    }
  }, [DEV_SKIP_AUTH, isAuthenticated, setUser, completeOnboarding]);

  // DEV: Skip auth check
  if (DEV_SKIP_AUTH) {
    return <Redirect href="/(tabs)" />;
  }

  // Route based on auth state
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!onboarding.isComplete) {
    return <Redirect href="/(onboarding)/relationship-info" />;
  }

  return <Redirect href="/(tabs)" />;
}
