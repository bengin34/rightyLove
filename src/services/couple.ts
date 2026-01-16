import { supabase } from '@/lib/supabase';
import { useCoupleStore } from '@/stores/coupleStore';
import { useAuthStore } from '@/stores/authStore';
import type { Couple } from '@/types';

// Generate a random invite code
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a new couple (initiator)
export async function createCouple(): Promise<{
  success: boolean;
  couple?: Couple;
  error?: string;
}> {
  try {
    const user = useAuthStore.getState().user;
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const inviteCode = generateInviteCode();

    const { data, error } = await supabase
      .from('couples')
      .insert({
        member_a: user.id,
        invite_code: inviteCode,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const couple: Couple = {
      id: data.id,
      memberA: data.member_a,
      memberB: data.member_b || '',
      inviteCode: data.invite_code,
      createdAt: new Date(data.created_at),
    };

    // Update store
    useCoupleStore.getState().setCouple(couple);
    useCoupleStore.getState().setInviteCode(inviteCode);

    return { success: true, couple };
  } catch (err) {
    return { success: false, error: 'Failed to create couple' };
  }
}

// Join a couple using invite code
export async function joinCouple(
  inviteCode: string
): Promise<{ success: boolean; couple?: Couple; error?: string }> {
  try {
    const user = useAuthStore.getState().user;
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase.rpc('join_couple', {
      p_invite_code: inviteCode.toUpperCase(),
    });

    if (error || !data) {
      return {
        success: false,
        error: error?.message || 'Invalid or already used invite code',
      };
    }

    const couple: Couple = {
      id: data.id,
      memberA: data.member_a,
      memberB: data.member_b || '',
      inviteCode: data.invite_code,
      createdAt: new Date(data.created_at),
    };

    // Update store
    useCoupleStore.getState().setCouple(couple);

    return { success: true, couple };
  } catch (err) {
    return { success: false, error: 'Failed to join couple' };
  }
}

// Get current couple
export async function getCurrentCouple(): Promise<Couple | null> {
  try {
    const user = useAuthStore.getState().user;
    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from('couples')
      .select()
      .or(`member_a.eq.${user.id},member_b.eq.${user.id}`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        useCoupleStore.getState().unpair();
      }
      return null;
    }

    if (!data) {
      useCoupleStore.getState().unpair();
      return null;
    }

    const couple: Couple = {
      id: data.id,
      memberA: data.member_a,
      memberB: data.member_b || '',
      inviteCode: data.invite_code,
      createdAt: new Date(data.created_at),
    };

    // Update store
    useCoupleStore.getState().setCouple(couple);

    return couple;
  } catch (err) {
    return null;
  }
}

// Unpair (leave couple)
export async function unpairCouple(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const user = useAuthStore.getState().user;
    const couple = useCoupleStore.getState().couple;

    if (!user || !couple) {
      return { success: false, error: 'Not in a couple' };
    }

    // If user is member_a, delete the couple entirely
    // If user is member_b, just remove them from the couple
    if (couple.memberA === user.id) {
      const { error } = await supabase
        .from('couples')
        .delete()
        .eq('id', couple.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase
        .from('couples')
        .update({ member_b: null })
        .eq('id', couple.id);

      if (error) {
        return { success: false, error: error.message };
      }
    }

    // Update store
    useCoupleStore.getState().unpair();

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Failed to unpair' };
  }
}

// Regenerate invite code
export async function regenerateInviteCode(): Promise<{
  success: boolean;
  code?: string;
  error?: string;
}> {
  try {
    const couple = useCoupleStore.getState().couple;
    if (!couple) {
      return { success: false, error: 'Not in a couple' };
    }

    // Only allow if couple is not complete
    if (couple.memberB) {
      return { success: false, error: 'Couple is already complete' };
    }

    const newCode = generateInviteCode();

    const { error } = await supabase
      .from('couples')
      .update({ invite_code: newCode })
      .eq('id', couple.id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Update store
    useCoupleStore.getState().setInviteCode(newCode);

    return { success: true, code: newCode };
  } catch (err) {
    return { success: false, error: 'Failed to regenerate code' };
  }
}
