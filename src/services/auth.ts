import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import type { User } from '@/types';

// Get the correct redirect URL based on environment
function getRedirectUrl(): string {
  // For development with Expo Go, use the Expo development URL
  // For production/dev builds, use the custom scheme
  const isDev = __DEV__;

  if (isDev) {
    // This creates a URL like: exp://192.168.x.x:8081/--/auth/callback
    // or for Expo Go: exp://u.expo.dev/[project-id]/--/auth/callback
    return Linking.createURL('auth/callback');
  }

  // Production: use custom scheme
  return 'rightylove://auth/callback';
}

// Send magic link email
export async function sendMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const redirectUrl = getRedirectUrl();
    console.log('Magic link redirect URL:', redirectUrl);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // For email magic link - user receives link to click
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error('[sendMagicLink] Error:', error);
      return { success: false, error: 'Failed to send magic link' };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to send magic link' };
  }
}

// Verify OTP code (for email OTP verification)
export async function verifyOtp(
  email: string,
  token: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      console.error('[verifyOtp] Error:', error);
      return { success: false, error: 'Verification failed' };
    }

    if (!data.user) {
      return { success: false, error: 'No user returned' };
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || email,
      createdAt: new Date(data.user.created_at),
      updatedAt: new Date(),
    };

    // Update auth store
    useAuthStore.getState().setUser(user);

    return { success: true, user };
  } catch (err) {
    return { success: false, error: 'Verification failed' };
  }
}

// Get current session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    return null;
  }
  return data.session;
}

// Get current user from session
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email || '',
    createdAt: new Date(session.user.created_at),
    updatedAt: new Date(),
  };
}

// Sign out
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('[signOut] Error:', error);
      return { success: false, error: 'Sign out failed' };
    }

    // Clear auth store
    useAuthStore.getState().logout();

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Sign out failed' };
  }
}

// Listen for auth state changes
export function onAuthStateChange(
  callback: (user: User | null) => void
): () => void {
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user: User = {
        id: session.user.id,
        email: session.user.email || '',
        createdAt: new Date(session.user.created_at),
        updatedAt: new Date(),
      };
      callback(user);
    } else {
      callback(null);
    }
  });

  return () => {
    data.subscription.unsubscribe();
  };
}
