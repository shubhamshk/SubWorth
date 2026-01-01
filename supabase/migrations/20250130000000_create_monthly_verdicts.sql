-- Migration: Create Monthly Verdicts Table
-- Purpose: Store manual verdicts for users, strictly one per month.

CREATE TABLE IF NOT EXISTS public.monthly_verdicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2024),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready')),
    verdict_data JSONB DEFAULT '{}'::jsonb, -- Stores the structured verdict content
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- STICT CONSTRAINT: One verdict per user per month
    UNIQUE(user_id, month, year)
);

-- Enable RLS
ALTER TABLE public.monthly_verdicts ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Users can read their OWN verdicts
CREATE POLICY "Users can read own verdicts" ON public.monthly_verdicts
    FOR SELECT USING (auth.uid() = user_id);

-- 2. Service Role (Admin) has full access (Implicit in Supabase but good to be explicit if using Admin Client)
-- No explicit policy needed for service_role as it bypasses RLS, but we can add one for "admin" user roles if we had them.
-- For now, we assume backend usage via Service Role or Dashboard Admin.

-- Trigger for Updated At
CREATE TRIGGER update_monthly_verdicts_updated_at
    BEFORE UPDATE ON public.monthly_verdicts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
