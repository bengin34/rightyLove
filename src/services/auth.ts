import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';

// Send magic link email
export async function sendMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // For email magic link - user receives link to click
        emailRedirectTo: 'rightylove://auth/callback',
      },
    });

    if (error) {
      return { success: false, error: error.message };
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
      return { success: false, error: error.message };
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
      return { success: false, error: error.message };
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
