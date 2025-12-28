-- Migration: Add onboarding_completed to user_profiles
-- Reason: To track if a user has finished the onboarding wizard.

-- 1. Ensure table exists (idempotent check)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    taste_profile JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'onboarding_completed'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 3. Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Idempotent creation)
DO $$
BEGIN
    -- Policy: Users can read own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can read own profile'
    ) THEN
        CREATE POLICY "Users can read own profile" ON public.user_profiles
        FOR SELECT USING (auth.uid() = id);
    END IF;

    -- Policy: Users can update own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile" ON public.user_profiles
        FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- Policy: Users can insert own profile
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile" ON public.user_profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
END $$;
