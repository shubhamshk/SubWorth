-- ============================================================================
-- OTT SUBSCRIPTION MANAGER - SECURE DATABASE SCHEMA
-- ============================================================================
-- Security Design Principles:
-- 1. All tables use UUID primary keys (prevents enumeration attacks)
-- 2. All user-related tables reference auth.users via foreign key
-- 3. Audit columns (created_at, updated_at) on every table
-- 4. Check constraints for data validation at DB level
-- 5. RLS enabled on ALL tables (enforced in next migration)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- Stores user profile and preferences
-- SECURITY: One row per authenticated user, linked to auth.users
-- ============================================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- SECURITY: Foreign key to Supabase Auth - ensures only authenticated users exist
    auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    -- Notification preferences
    email_notifications_enabled BOOLEAN DEFAULT true,
    notification_frequency TEXT DEFAULT 'monthly' CHECK (notification_frequency IN ('daily', 'weekly', 'monthly', 'never')),
    -- Unsubscribe token for email opt-out (SECURITY: Secure random token)
    unsubscribe_token UUID DEFAULT uuid_generate_v4() NOT NULL,
    -- Audit columns
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast auth_id lookups (used in every RLS policy)
CREATE INDEX idx_users_auth_id ON public.users(auth_id);
-- Index for unsubscribe token lookups
CREATE INDEX idx_users_unsubscribe_token ON public.users(unsubscribe_token);

-- ============================================================================
-- OTT_PLATFORMS TABLE
-- Master list of OTT platforms (Netflix, Prime, etc.)
-- SECURITY: Admin-only write access, public read
-- ============================================================================
CREATE TABLE public.ott_platforms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    -- Gradient colors for UI
    color_from TEXT NOT NULL DEFAULT '#6366f1',
    color_to TEXT NOT NULL DEFAULT '#8b5cf6',
    -- Pricing (SECURITY: Server-authoritative, never trust client values)
    monthly_price DECIMAL(10,2) NOT NULL CHECK (monthly_price >= 0),
    yearly_price DECIMAL(10,2) CHECK (yearly_price >= 0),
    currency TEXT DEFAULT 'USD' NOT NULL,
    -- Categories for matching
    categories TEXT[] NOT NULL DEFAULT '{}',
    -- Base quality score (0-10)
    base_score DECIMAL(3,1) NOT NULL CHECK (base_score >= 0 AND base_score <= 10),
    -- Platform status
    is_active BOOLEAN DEFAULT true NOT NULL,
    -- Audit columns
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for slug lookups
CREATE INDEX idx_ott_platforms_slug ON public.ott_platforms(slug);
-- Index for active platforms
CREATE INDEX idx_ott_platforms_active ON public.ott_platforms(is_active) WHERE is_active = true;

-- ============================================================================
-- MONTHLY_RELEASES TABLE
-- Content releasing this month on each platform
-- SECURITY: Admin-only write access, public read
-- ============================================================================
CREATE TABLE public.monthly_releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_id UUID NOT NULL REFERENCES public.ott_platforms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT NOT NULL CHECK (content_type IN ('movie', 'series', 'documentary', 'live', 'special')),
    genres TEXT[] NOT NULL DEFAULT '{}',
    release_date DATE NOT NULL,
    -- Rating (SECURITY: Server-authoritative)
    rating DECIMAL(3,1) CHECK (rating >= 0 AND rating <= 10),
    description TEXT,
    thumbnail_url TEXT,
    -- Which month/year this release is for
    release_month INTEGER NOT NULL CHECK (release_month >= 1 AND release_month <= 12),
    release_year INTEGER NOT NULL CHECK (release_year >= 2020),
    -- Audit columns
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Composite index for month/year queries
CREATE INDEX idx_monthly_releases_period ON public.monthly_releases(release_year, release_month);
-- Index for platform lookups
CREATE INDEX idx_monthly_releases_platform ON public.monthly_releases(platform_id);

-- ============================================================================
-- USER_INTERESTS TABLE
-- User's content preferences/interests
-- SECURITY: User can only access their own interests
-- ============================================================================
CREATE TABLE public.user_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    interest TEXT NOT NULL,
    -- Audit columns
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Prevent duplicate interests per user
    UNIQUE(user_id, interest)
);

-- Index for user lookups
CREATE INDEX idx_user_interests_user ON public.user_interests(user_id);

-- ============================================================================
-- USER_SUBSCRIPTIONS TABLE  
-- Which platforms the user is currently subscribed to
-- SECURITY: User can only access their own subscriptions
-- ============================================================================
CREATE TABLE public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES public.ott_platforms(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true NOT NULL,
    subscribed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Audit columns
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Prevent duplicate subscriptions
    UNIQUE(user_id, platform_id)
);

-- Index for user lookups
CREATE INDEX idx_user_subscriptions_user ON public.user_subscriptions(user_id);
-- Index for active subscriptions
CREATE INDEX idx_user_subscriptions_active ON public.user_subscriptions(user_id, is_active) WHERE is_active = true;

-- ============================================================================
-- USER_VERDICTS TABLE
-- Calculated verdicts for each user/platform combination
-- SECURITY: System-generated, user can only read their own
-- ============================================================================
CREATE TABLE public.user_verdicts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    platform_id UUID NOT NULL REFERENCES public.ott_platforms(id) ON DELETE CASCADE,
    -- Verdict (SECURITY: Server-calculated, never trust client)
    verdict TEXT NOT NULL CHECK (verdict IN ('buy', 'continue', 'pause', 'skip')),
    total_score DECIMAL(3,1) NOT NULL CHECK (total_score >= 0 AND total_score <= 10),
    -- Score breakdown for transparency
    base_score DECIMAL(3,1) NOT NULL,
    relevance_bonus DECIMAL(3,1) NOT NULL,
    freshness_bonus DECIMAL(3,1) NOT NULL,
    value_adjustment DECIMAL(3,1) NOT NULL,
    event_bonus DECIMAL(3,1) NOT NULL,
    -- Potential savings if user skips/pauses
    potential_savings DECIMAL(10,2) NOT NULL DEFAULT 0,
    -- Which month/year this verdict is for
    verdict_month INTEGER NOT NULL CHECK (verdict_month >= 1 AND verdict_month <= 12),
    verdict_year INTEGER NOT NULL CHECK (verdict_year >= 2020),
    -- Audit columns
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- One verdict per user/platform/month
    UNIQUE(user_id, platform_id, verdict_year, verdict_month)
);

-- Index for user lookups
CREATE INDEX idx_user_verdicts_user ON public.user_verdicts(user_id);
-- Index for current month verdicts
CREATE INDEX idx_user_verdicts_period ON public.user_verdicts(verdict_year, verdict_month);

-- ============================================================================
-- NOTIFICATION_LOG TABLE
-- Tracks sent notifications to prevent spam
-- SECURITY: System-managed, user can view their own
-- ============================================================================
CREATE TABLE public.notification_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN ('verdict_update', 'monthly_summary', 'special_offer')),
    sent_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')),
    error_message TEXT,
    -- Audit columns
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for user + type lookups (rate limiting)
CREATE INDEX idx_notification_log_user_type ON public.notification_log(user_id, notification_type, sent_at);

-- ============================================================================
-- RATE_LIMIT_LOG TABLE
-- Server-side rate limiting tracking
-- SECURITY: Used by edge functions to prevent abuse
-- ============================================================================
CREATE TABLE public.rate_limit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Can be user_id, IP, or other identifier
    identifier TEXT NOT NULL,
    action TEXT NOT NULL,
    attempted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Cleanup old entries with TTL
    expires_at TIMESTAMPTZ NOT NULL
);

-- Index for rate limit checks
CREATE INDEX idx_rate_limit_log_lookup ON public.rate_limit_log(identifier, action, attempted_at);
-- Partial index for cleanup
CREATE INDEX idx_rate_limit_log_expired ON public.rate_limit_log(expires_at) WHERE expires_at < NOW();

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically updates updated_at column on row changes
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ott_platforms_updated_at
    BEFORE UPDATE ON public.ott_platforms
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_releases_updated_at
    BEFORE UPDATE ON public.monthly_releases
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_verdicts_updated_at
    BEFORE UPDATE ON public.user_verdicts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- CRITICAL: RLS policies defined in separate migration
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ott_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verdicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FORCE RLS FOR TABLE OWNERS
-- SECURITY: Even table owners must go through RLS (prevents admin backdoors)
-- ============================================================================
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ott_platforms FORCE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_releases FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_interests FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_verdicts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log FORCE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_log FORCE ROW LEVEL SECURITY;
