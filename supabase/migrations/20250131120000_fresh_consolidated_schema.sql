-- ============================================================================
-- FRESH CONSOLIDATED SCHEMA - OTT SUBSCRIPTION MANAGER
-- ============================================================================
-- Purpose: Consolidate all migrations into a single, clean schema
-- Date: 2025-01-31
-- Fixes: Removed partial indexes with volatile functions (NOW())
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: users (Legacy table for backward compatibility)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    email_notifications_enabled BOOLEAN DEFAULT true,
    notification_frequency TEXT DEFAULT 'monthly' CHECK (notification_frequency IN ('daily', 'weekly', 'monthly', 'never')),
    unsubscribe_token UUID DEFAULT gen_random_uuid() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_unsubscribe_token ON public.users(unsubscribe_token);

-- ============================================================================
-- TABLE: user_profiles (Main user profile table)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    user_name TEXT,
    user_age INTEGER,
    age INTEGER CHECK (age >= 13 AND age <= 120),
    taste_profile JSONB DEFAULT '{}'::jsonb,
    onboarding_completed BOOLEAN DEFAULT false,
    plan_tier TEXT DEFAULT 'pro' CHECK (plan_tier IN ('pro', 'team')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add age constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_age_check') THEN
        ALTER TABLE public.user_profiles ADD CONSTRAINT user_age_check CHECK (user_age IS NULL OR (user_age >= 13 AND user_age <= 120));
    END IF;
END $$;


-- Ensure other new columns exist in user_profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'age') THEN
        ALTER TABLE public.user_profiles ADD COLUMN age INTEGER CHECK (age >= 13 AND age <= 120);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'plan_tier') THEN
        ALTER TABLE public.user_profiles ADD COLUMN plan_tier TEXT DEFAULT 'pro' CHECK (plan_tier IN ('pro', 'team'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'payment_status') THEN
        ALTER TABLE public.user_profiles ADD COLUMN payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_name ON public.user_profiles(user_name);

-- ============================================================================
-- TABLE: ott_platforms (Platform master data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.ott_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    color_from TEXT NOT NULL DEFAULT '#6366f1',
    color_to TEXT NOT NULL DEFAULT '#8b5cf6',
    monthly_price DECIMAL(10,2) NOT NULL CHECK (monthly_price >= 0),
    yearly_price DECIMAL(10,2) CHECK (yearly_price >= 0),
    currency TEXT DEFAULT 'USD' NOT NULL,
    categories TEXT[] NOT NULL DEFAULT '{}',
    base_score DECIMAL(3,1) NOT NULL CHECK (base_score >= 0 AND base_score <= 10),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Ensure is_active column exists (in case table was created by earlier migration without it)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'ott_platforms' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.ott_platforms ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ott_platforms_slug ON public.ott_platforms(slug);
CREATE INDEX IF NOT EXISTS idx_ott_platforms_active ON public.ott_platforms(is_active);

-- ============================================================================
-- TABLE: monthly_releases (Content releases)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.monthly_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform_id UUID NOT NULL REFERENCES public.ott_platforms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'series', 'documentary', 'live', 'special')),
    genres TEXT[] NOT NULL DEFAULT '{}',
    release_date DATE NOT NULL,
    rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
    description TEXT,
    thumbnail_url TEXT,
    release_month INTEGER NOT NULL CHECK (release_month >= 1 AND release_month <= 12),
    release_year INTEGER NOT NULL CHECK (release_year >= 2020),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_monthly_releases_period ON public.monthly_releases(release_year, release_month);
CREATE INDEX IF NOT EXISTS idx_monthly_releases_platform ON public.monthly_releases(platform_id);

-- ============================================================================
-- TABLE: user_interests (User preferences)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    interest TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, interest)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_user ON public.user_interests(user_id);

-- ============================================================================
-- TABLE: user_subscriptions (Active subscriptions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES public.ott_platforms(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, platform_id)
);

-- Ensure is_active column exists (in case table was created by earlier migration without it)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_subscriptions' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.user_subscriptions ADD COLUMN is_active BOOLEAN DEFAULT true NOT NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active ON public.user_subscriptions(user_id, is_active);

-- ============================================================================
-- TABLE: user_verdicts (Calculated verdicts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_verdicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES public.ott_platforms(id) ON DELETE CASCADE,
    verdict TEXT NOT NULL CHECK (verdict IN ('buy', 'continue', 'pause', 'skip')),
    total_score DECIMAL(3,1) NOT NULL CHECK (total_score >= 0 AND total_score <= 10),
    base_score DECIMAL(3,1) NOT NULL,
    relevance_bonus DECIMAL(3,1) NOT NULL,
    freshness_bonus DECIMAL(3,1) NOT NULL,
    value_adjustment DECIMAL(3,1) NOT NULL,
    event_bonus DECIMAL(3,1) NOT NULL,
    potential_savings DECIMAL(10,2) NOT NULL DEFAULT 0,
    verdict_month INTEGER NOT NULL CHECK (verdict_month >= 1 AND verdict_month <= 12),
    verdict_year INTEGER NOT NULL CHECK (verdict_year >= 2020),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, platform_id, verdict_year, verdict_month)
);

-- Ensure verdict columns exist (in case table was created by earlier migration without them)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_verdicts' AND column_name = 'verdict_year') THEN
        ALTER TABLE public.user_verdicts ADD COLUMN verdict_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER NOT NULL CHECK (verdict_year >= 2020);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_verdicts' AND column_name = 'verdict_month') THEN
        ALTER TABLE public.user_verdicts ADD COLUMN verdict_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER NOT NULL CHECK (verdict_month >= 1 AND verdict_month <= 12);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_verdicts_user ON public.user_verdicts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verdicts_period ON public.user_verdicts(verdict_year, verdict_month);

-- ============================================================================
-- TABLE: monthly_verdicts (Manual monthly verdicts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.monthly_verdicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2024),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready')),
    verdict_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month, year)
);

-- ============================================================================
-- TABLE: user_tracked_platforms (Tracked platforms)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_tracked_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    platform_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform_key)
);

-- ============================================================================
-- TABLE: notification_log (Notification tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notification_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('verdict_update', 'monthly_summary', 'special_offer')),
    sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notification_log_user_type ON public.notification_log(user_id, notification_type, sent_at);

-- ============================================================================
-- TABLE: rate_limit_log (Rate limiting)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier TEXT NOT NULL,
    action TEXT NOT NULL,
    attempted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_log_lookup ON public.rate_limit_log(identifier, action, attempted_at);
-- FIXED: Removed partial index with NOW() - volatile functions not allowed in partial indexes
CREATE INDEX IF NOT EXISTS idx_rate_limit_log_expires ON public.rate_limit_log(expires_at);

-- ============================================================================
-- FUNCTION: update_updated_at_column
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS: Auto-update updated_at
-- ============================================================================
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_ott_platforms_updated_at ON public.ott_platforms;
CREATE TRIGGER update_ott_platforms_updated_at
    BEFORE UPDATE ON public.ott_platforms
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_monthly_releases_updated_at ON public.monthly_releases;
CREATE TRIGGER update_monthly_releases_updated_at
    BEFORE UPDATE ON public.monthly_releases
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_verdicts_updated_at ON public.user_verdicts;
CREATE TRIGGER update_user_verdicts_updated_at
    BEFORE UPDATE ON public.user_verdicts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_monthly_verdicts_updated_at ON public.monthly_verdicts;
CREATE TRIGGER update_monthly_verdicts_updated_at
    BEFORE UPDATE ON public.monthly_verdicts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- FUNCTION: handle_new_user
-- ============================================================================
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
    FROM unnest(ARRAY['movies', 'series']) AS interest
    ON CONFLICT (user_id, interest) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ott_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verdicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_verdicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tracked_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: user_profiles
-- ============================================================================
DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;

CREATE POLICY "users_select_own_profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_insert_own_profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- RLS POLICIES: monthly_verdicts
-- ============================================================================
DROP POLICY IF EXISTS "Users can read own verdicts" ON public.monthly_verdicts;
CREATE POLICY "Users can read own verdicts" ON public.monthly_verdicts
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES: user_tracked_platforms
-- ============================================================================
DROP POLICY IF EXISTS "Users can read own tracked platforms" ON public.user_tracked_platforms;
DROP POLICY IF EXISTS "Users can insert own tracked platforms" ON public.user_tracked_platforms;
DROP POLICY IF EXISTS "Users can delete own tracked platforms" ON public.user_tracked_platforms;

CREATE POLICY "Users can read own tracked platforms" 
    ON public.user_tracked_platforms FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tracked platforms" 
    ON public.user_tracked_platforms FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracked platforms" 
    ON public.user_tracked_platforms FOR DELETE 
    USING (auth.uid() = user_id);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;
GRANT ALL ON public.monthly_verdicts TO authenticated;
GRANT ALL ON public.monthly_verdicts TO service_role;
GRANT ALL ON public.user_tracked_platforms TO authenticated;
GRANT ALL ON public.user_tracked_platforms TO service_role;

-- ============================================================================
-- COMMENTS
-- ============================================================================
COMMENT ON TABLE public.user_profiles IS 'Main user profile table with onboarding data';
COMMENT ON COLUMN public.user_profiles.user_name IS 'User display name collected during onboarding';
COMMENT ON COLUMN public.user_profiles.user_age IS 'User age (13-120) for personalization';
COMMENT ON COLUMN public.user_profiles.age IS 'Alternative age column for compatibility';
COMMENT ON COLUMN public.user_profiles.taste_profile IS 'User preferences and taste data from onboarding';
COMMENT ON COLUMN public.user_profiles.onboarding_completed IS 'Whether user has completed onboarding wizard';
COMMENT ON COLUMN public.user_profiles.plan_tier IS 'User subscription plan (pro/team)';
COMMENT ON COLUMN public.user_profiles.payment_status IS 'Payment status (pending/completed/failed)';
