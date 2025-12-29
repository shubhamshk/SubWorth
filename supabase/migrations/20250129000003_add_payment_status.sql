-- Migration: Add Payment Status with Strict Constraints
-- Purpose: Gate access until payment is verified.

-- 1. Add columns to user_profiles if they don't exist
DO $$
BEGIN
    -- payment_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'payment_status') THEN
        ALTER TABLE public.user_profiles ADD COLUMN payment_status TEXT DEFAULT 'pending' NOT NULL;
    END IF;

    -- selected_plan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'selected_plan') THEN
        ALTER TABLE public.user_profiles ADD COLUMN selected_plan TEXT;
    END IF;
END $$;

-- 2. Add Constraint to ensure strict ENUM values
-- First drop it if it exists to allow updates
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_payment_status') THEN
        ALTER TABLE public.user_profiles DROP CONSTRAINT check_payment_status;
    END IF;
END $$;

ALTER TABLE public.user_profiles
ADD CONSTRAINT check_payment_status CHECK (payment_status IN ('pending', 'paid', 'failed'));

-- 3. Update RLS policies to allow reading these new columns
-- (Existing policies usually cover "all columns", but good to be safe)
-- The existing policies "users_select_own_profile" etc. cover this.
