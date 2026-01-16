-- ============================================
-- Join couple via invite code (RPC)
-- Version: 1.0.2
-- Reason: Allow non-member user to join without weakening RLS
-- ============================================

CREATE OR REPLACE FUNCTION public.join_couple(p_invite_code TEXT)
RETURNS public.couples
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_couple public.couples;
    v_user_id UUID := auth.uid();
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.couples
        WHERE member_a = v_user_id OR member_b = v_user_id
    ) THEN
        RAISE EXCEPTION 'User already in a couple';
    END IF;

    SELECT *
    INTO v_couple
    FROM public.couples
    WHERE invite_code = UPPER(p_invite_code)
      AND member_b IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or already used invite code';
    END IF;

    IF v_couple.member_a = v_user_id THEN
        RAISE EXCEPTION 'You cannot join your own couple';
    END IF;

    UPDATE public.couples
    SET member_b = v_user_id,
        paired_at = NOW()
    WHERE id = v_couple.id
    RETURNING * INTO v_couple;

    RETURN v_couple;
END;
$$;

REVOKE ALL ON FUNCTION public.join_couple(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_couple(TEXT) TO authenticated;
