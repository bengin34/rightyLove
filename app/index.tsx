import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useCoupleStore } from '@/stores/coupleStore';

export default function Index() {
  const { isAuthenticated, onboarding } = useAuthStore();
  const { isPaired } = useCoupleStore();

  // Route based on auth state
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!onboarding.isComplete) {
    return <Redirect href="/(onboarding)/relationship-info" />;
  }

  return <Redirect href="/(tabs)" />;
}
