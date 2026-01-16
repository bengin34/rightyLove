-- ============================================
-- RightyLove Database Schema
-- Version: 1.0.0 (MVP)
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- Extended user profile data beyond auth.users
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    relationship_type TEXT CHECK (relationship_type IN ('dating', 'married', 'long-distance')),
    relationship_duration TEXT CHECK (relationship_duration IN ('<1', '1-3', '3-5', '5+')),
    notification_time TIME DEFAULT '09:00:00',
    timezone TEXT DEFAULT 'UTC',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- COUPLES TABLE
-- Links two users together as a couple
-- ============================================
CREATE TABLE IF NOT EXISTS public.couples (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_a UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    member_b UUID REFERENCES public.users(id) ON DELETE SET NULL,
    invite_code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paired_at TIMESTAMPTZ,

    -- Ensure member_a != member_b
    CONSTRAINT different_members CHECK (member_a != member_b)
);

-- Index for faster invite code lookups
CREATE INDEX IF NOT EXISTS idx_couples_invite_code ON public.couples(invite_code);
CREATE INDEX IF NOT EXISTS idx_couples_member_a ON public.couples(member_a);
CREATE INDEX IF NOT EXISTS idx_couples_member_b ON public.couples(member_b);

-- ============================================
-- QUESTIONS TABLE (Question Bank)
-- Stores all relationship questions
-- ============================================
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    text TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    relationship_types TEXT[] DEFAULT ARRAY['dating', 'married', 'long-distance'],
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'deep')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for question selection
CREATE INDEX IF NOT EXISTS idx_questions_active ON public.questions(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_tags ON public.questions USING GIN(tags);

-- ============================================
-- DAILY_PROMPTS TABLE
-- Tracks which question is assigned to each couple per day
-- ============================================
CREATE TABLE IF NOT EXISTS public.daily_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    date_key DATE NOT NULL,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    unlocked_at TIMESTAMPTZ,

    -- Each couple gets one question per day
    UNIQUE(couple_id, date_key)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_daily_prompts_couple_date ON public.daily_prompts(couple_id, date_key);

-- ============================================
-- ANSWERS TABLE
-- Stores user answers to daily questions
-- ============================================
CREATE TABLE IF NOT EXISTS public.answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    date_key DATE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL CHECK (char_length(text) <= 500),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Each user can answer once per day per couple
    UNIQUE(couple_id, date_key, user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_answers_couple_date ON public.answers(couple_id, date_key);

-- ============================================
-- QUESTION_HISTORY TABLE
-- Tracks which questions have been shown to each couple
-- Prevents repeating questions within 60 days
-- ============================================
CREATE TABLE IF NOT EXISTS public.question_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    shown_at TIMESTAMPTZ DEFAULT NOW(),

    -- Track unique question-couple combinations
    UNIQUE(couple_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_question_history_couple ON public.question_history(couple_id, shown_at);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_history ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Couples policies
CREATE POLICY "Users can view their own couple"
    ON public.couples FOR SELECT
    USING (auth.uid() = member_a OR auth.uid() = member_b);

CREATE POLICY "Users can create a couple"
    ON public.couples FOR INSERT
    WITH CHECK (auth.uid() = member_a);

CREATE POLICY "Users can update their couple"
    ON public.couples FOR UPDATE
    USING (auth.uid() = member_a OR auth.uid() = member_b);

CREATE POLICY "Member A can delete couple"
    ON public.couples FOR DELETE
    USING (auth.uid() = member_a);

-- Questions policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view active questions"
    ON public.questions FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Daily prompts policies
CREATE POLICY "Users can view their couple's prompts"
    ON public.daily_prompts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = daily_prompts.couple_id
            AND (couples.member_a = auth.uid() OR couples.member_b = auth.uid())
        )
    );

CREATE POLICY "Users can create prompts for their couple"
    ON public.daily_prompts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = couple_id
            AND (couples.member_a = auth.uid() OR couples.member_b = auth.uid())
        )
    );

CREATE POLICY "Users can update their couple's prompts"
    ON public.daily_prompts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = daily_prompts.couple_id
            AND (couples.member_a = auth.uid() OR couples.member_b = auth.uid())
        )
    );

-- Answers policies
CREATE POLICY "Users can view their couple's answers"
    ON public.answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = answers.couple_id
            AND (couples.member_a = auth.uid() OR couples.member_b = auth.uid())
        )
    );

CREATE POLICY "Users can insert their own answers"
    ON public.answers FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = couple_id
            AND (couples.member_a = auth.uid() OR couples.member_b = auth.uid())
        )
    );

-- Question history policies
CREATE POLICY "Users can view their couple's question history"
    ON public.question_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = question_history.couple_id
            AND (couples.member_a = auth.uid() OR couples.member_b = auth.uid())
        )
    );

CREATE POLICY "Users can insert question history for their couple"
    ON public.question_history FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.couples
            WHERE couples.id = couple_id
            AND (couples.member_a = auth.uid() OR couples.member_b = auth.uid())
        )
    );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Function to get a random question for a couple
-- Avoids questions shown in the last 60 days
CREATE OR REPLACE FUNCTION public.get_daily_question(p_couple_id UUID, p_relationship_type TEXT DEFAULT 'dating')
RETURNS UUID AS $$
DECLARE
    v_question_id UUID;
BEGIN
    SELECT q.id INTO v_question_id
    FROM public.questions q
    WHERE q.is_active = true
    AND p_relationship_type = ANY(q.relationship_types)
    AND q.id NOT IN (
        SELECT qh.question_id
        FROM public.question_history qh
        WHERE qh.couple_id = p_couple_id
        AND qh.shown_at > NOW() - INTERVAL '60 days'
    )
    ORDER BY RANDOM()
    LIMIT 1;

    -- If all questions have been shown, pick any random one
    IF v_question_id IS NULL THEN
        SELECT q.id INTO v_question_id
        FROM public.questions q
        WHERE q.is_active = true
        AND p_relationship_type = ANY(q.relationship_types)
        ORDER BY RANDOM()
        LIMIT 1;
    END IF;

    RETURN v_question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set paired_at when member_b joins
CREATE OR REPLACE FUNCTION public.handle_couple_pairing()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.member_b IS NULL AND NEW.member_b IS NOT NULL THEN
        NEW.paired_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_couple_paired ON public.couples;
CREATE TRIGGER on_couple_paired
    BEFORE UPDATE ON public.couples
    FOR EACH ROW EXECUTE FUNCTION public.handle_couple_pairing();
