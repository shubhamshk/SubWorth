-- Migration: User Profiles Schema & RLS Fix (Consolidated)
-- Purpose: Ensure user_profiles table has all columns and correct RLS policies for onboarding.

-- 1. Ensure Table Schema is Correct
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    user_name TEXT, -- Added for onboarding
    user_age INTEGER, -- Added for onboarding
    taste_profile JSONB DEFAULT '{}'::jsonb, -- Added for onboarding
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1b. Add columns if they are missing (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'user_name') THEN
        ALTER TABLE public.user_profiles ADD COLUMN user_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'user_age') THEN
        ALTER TABLE public.user_profiles ADD COLUMN user_age INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'taste_profile') THEN
        ALTER TABLE public.user_profiles ADD COLUMN taste_profile JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. Force Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Reset Policies (Drop all to ensure clean slate)
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;

-- 4. Re-create Permissive Policies
-- SELECT: Users can see their own data
CREATE POLICY "users_select_own_profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

-- INSERT: Users can insert their own data (critical for first-time login if trigger failed)
CREATE POLICY "users_insert_own_profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE: Users can update their own data (critical for onboarding completion)
CREATE POLICY "users_update_own_profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- 5. Helper Function: Handle New User (Redefined to be safe)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- 1. Insert into legacy 'users' table
    INSERT INTO public.users (auth_id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
    ) RETURNING id INTO v_user_id;

    -- 2. Insert into 'user_profiles' table
    INSERT INTO public.user_profiles (id, full_name, avatar_url, onboarding_completed, taste_profile)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        false,
        '{}'::jsonb
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- 3. Create default interests
    INSERT INTO public.user_interests (user_id, interest)
    SELECT v_user_id, interest
    FROM unnest(ARRAY['movies', 'series']) AS interest;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Grant Permissions (just in case)
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
