-- Migration: Fix User Creation Mismatch
-- Reason: Ensure both 'users' and 'user_profiles' are populated on sign up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- 1. Insert into legacy 'users' table (required for FKs in other tables)
    INSERT INTO public.users (auth_id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
    ) RETURNING id INTO v_user_id;

    -- 2. Insert into new 'user_profiles' table (required for Middleware & Onboarding)
    INSERT INTO public.user_profiles (id, full_name, avatar_url, onboarding_completed, taste_profile)
    VALUES (
        NEW.id, -- matches auth.uid()
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        false,
        '{}'::jsonb
    )
    ON CONFLICT (id) DO NOTHING; -- Idempotent in case it already exists
    
    -- 3. Create default interests for new users (linked to legacy user id)
    INSERT INTO public.user_interests (user_id, interest)
    SELECT 
        v_user_id,
        interest
    FROM unnest(ARRAY['movies', 'series']) AS interest;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
