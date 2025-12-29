-- ============================================================================
-- Migration: Add User Identity Fields (Name & Age)
-- ============================================================================
-- Purpose: Collect user name and age during onboarding for personalization
-- Date: 2025-01-29
-- ============================================================================

-- Add user_name column (nullable for backward compatibility)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'user_name'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN user_name TEXT;
    END IF;
END $$;

-- Add user_age column with validation (nullable for backward compatibility)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_profiles'
        AND column_name = 'user_age'
    ) THEN
        ALTER TABLE public.user_profiles ADD COLUMN user_age INTEGER;
    END IF;
END $$;

-- Add CHECK constraint for age validation (13-120 years)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'user_age_check'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD CONSTRAINT user_age_check CHECK (user_age IS NULL OR (user_age >= 13 AND user_age <= 120));
    END IF;
END $$;

-- Create index for name searches (optional, for future features)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_name ON public.user_profiles(user_name);

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON COLUMN public.user_profiles.user_name IS 'User''s display name collected during onboarding';
COMMENT ON COLUMN public.user_profiles.user_age IS 'User''s age (13-120) for personalization and tone adjustment';
