-- ============================================
-- Optimize RLS Policies for Performance
-- Version: 1.0.1
-- Issue: auth.uid() re-evaluated for each row
-- Fix: Use (SELECT auth.uid()) to evaluate once
-- ============================================

-- ============================================
-- USERS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Recreate with optimized auth.uid() call
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (id = (SELECT auth.uid()));

-- ============================================
-- COUPLES POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own couple" ON public.couples;
DROP POLICY IF EXISTS "Users can create a couple" ON public.couples;
DROP POLICY IF EXISTS "Users can update their couple" ON public.couples;
DROP POLICY IF EXISTS "Member A can delete couple" ON public.couples;

-- Recreate with optimized auth.uid() call
CREATE POLICY "Users can view their own couple"
    ON public.couples FOR SELECT
    USING (member_a = (SELECT auth.uid()) OR member_b = (SELECT auth.uid()));

CREATE POLICY "Users can create a couple"
    ON public.couples FOR INSERT
    WITH CHECK (member_a = (SELECT auth.uid()));

CREATE POLICY "Users can update their couple"
    ON public.couples FOR UPDATE
    USING (member_a = (SELECT auth.uid()) OR member_b = (SELECT auth.uid()));

CREATE POLICY "Member A can delete couple"
    ON public.couples FOR DELETE
    USING (member_a = (SELECT auth.uid()));

-- ============================================
-- DAILY PROMPTS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their couple's prompts" ON public.daily_prompts;
DROP POLICY IF EXISTS "Users can create prompts for their couple" ON public.daily_prompts;
DROP POLICY IF EXISTS "Users can update their couple's prompts" ON public.daily_prompts;

-- Recreate with optimized auth.uid() call
CREATE POLICY "Users can view their couple's prompts"
    ON public.daily_prompts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = daily_prompts.couple_id
            AND (couples.member_a = (SELECT auth.uid()) OR couples.member_b = (SELECT auth.uid()))
        )
    );

CREATE POLICY "Users can create prompts for their couple"
    ON public.daily_prompts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = couple_id
            AND (couples.member_a = (SELECT auth.uid()) OR couples.member_b = (SELECT auth.uid()))
        )
    );

CREATE POLICY "Users can update their couple's prompts"
    ON public.daily_prompts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = daily_prompts.couple_id
            AND (couples.member_a = (SELECT auth.uid()) OR couples.member_b = (SELECT auth.uid()))
        )
    );

-- ============================================
-- ANSWERS POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their couple's answers" ON public.answers;
DROP POLICY IF EXISTS "Users can insert their own answers" ON public.answers;

-- Recreate with optimized auth.uid() call
CREATE POLICY "Users can view their couple's answers"
    ON public.answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = answers.couple_id
            AND (couples.member_a = (SELECT auth.uid()) OR couples.member_b = (SELECT auth.uid()))
        )
    );

CREATE POLICY "Users can insert their own answers"
    ON public.answers FOR INSERT
    WITH CHECK (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = couple_id
            AND (couples.member_a = (SELECT auth.uid()) OR couples.member_b = (SELECT auth.uid()))
        )
    );

-- ============================================
-- QUESTION HISTORY POLICIES
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their couple's question history" ON public.question_history;
DROP POLICY IF EXISTS "Users can insert question history for their couple" ON public.question_history;

-- Recreate with optimized auth.uid() call
CREATE POLICY "Users can view their couple's question history"
    ON public.question_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = question_history.couple_id
            AND (couples.member_a = (SELECT auth.uid()) OR couples.member_b = (SELECT auth.uid()))
        )
    );

CREATE POLICY "Users can insert question history for their couple"
    ON public.question_history FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = couple_id
            AND (couples.member_a = (SELECT auth.uid()) OR couples.member_b = (SELECT auth.uid()))
        )
    );
