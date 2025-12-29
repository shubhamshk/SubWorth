-- ============================================================================
-- OTT SUBSCRIPTION MANAGER - DATABASE FUNCTIONS
-- ============================================================================
-- Security Principles:
-- 1. All functions use SECURITY DEFINER for controlled access
-- 2. Sensitive functions require service_role
-- 3. User-facing functions validate auth.uid()
-- 4. No raw SQL exposure - all access through these functions
-- ============================================================================

-- ============================================================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- Triggered when a new user signs up via Supabase Auth
-- ============================================================================
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
    INSERT INTO public.user_profiles (id, full_name, avatar_url, onboarding_completed)
    VALUES (
        NEW.id, -- matches auth.uid()
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
        false
    );
    
    -- 3. Create default interests for new users (linked to legacy user id)
    INSERT INTO public.user_interests (user_id, interest)
    SELECT 
        v_user_id,
        interest
    FROM unnest(ARRAY['movies', 'series']) AS interest;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- CALCULATE VERDICT FOR A USER/PLATFORM PAIR
-- Called by server actions to calculate and store verdict
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_user_verdict(
    p_user_id UUID,
    p_platform_id UUID,
    p_verdict_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
    p_verdict_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS public.user_verdicts AS $$
DECLARE
    v_platform public.ott_platforms;
    v_user_interests TEXT[];
    v_base_score DECIMAL(3,1);
    v_relevance_bonus DECIMAL(3,1) := 0;
    v_freshness_bonus DECIMAL(3,1) := 0;
    v_value_adjustment DECIMAL(3,1) := 0;
    v_event_bonus DECIMAL(3,1) := 0;
    v_total_score DECIMAL(3,1);
    v_verdict TEXT;
    v_potential_savings DECIMAL(10,2) := 0;
    v_result public.user_verdicts;
    v_content_count INTEGER;
    v_avg_rating DECIMAL(3,1);
    v_matched_count INTEGER;
    v_fresh_count INTEGER;
    v_high_rated_count INTEGER;
BEGIN
    -- Get platform data
    SELECT * INTO v_platform FROM public.ott_platforms WHERE id = p_platform_id;
    IF v_platform IS NULL THEN
        RAISE EXCEPTION 'Platform not found: %', p_platform_id;
    END IF;
    
    v_base_score := v_platform.base_score;
    
    -- Get user interests
    SELECT ARRAY_AGG(interest) INTO v_user_interests
    FROM public.user_interests
    WHERE user_id = p_user_id;
    
    IF v_user_interests IS NULL THEN
        v_user_interests := ARRAY[]::TEXT[];
    END IF;
    
    -- Calculate relevance bonus (max 3 points)
    SELECT COUNT(*) INTO v_matched_count
    FROM public.monthly_releases mr
    WHERE mr.platform_id = p_platform_id
      AND mr.release_month = p_verdict_month
      AND mr.release_year = p_verdict_year
      AND mr.genres && v_user_interests; -- Array overlap
    
    v_relevance_bonus := LEAST(v_matched_count * 0.5, 3.0);
    
    -- Calculate freshness bonus (max 2 points)
    SELECT COUNT(*) INTO v_fresh_count
    FROM public.monthly_releases mr
    WHERE mr.platform_id = p_platform_id
      AND mr.release_month = p_verdict_month
      AND mr.release_year = p_verdict_year
      AND mr.release_date >= CURRENT_DATE;
    
    v_freshness_bonus := LEAST(v_fresh_count * 0.4, 2.0);
    
    -- Calculate value adjustment (-1 to +1)
    SELECT 
        COUNT(*),
        COALESCE(AVG(rating), 7.0)
    INTO v_content_count, v_avg_rating
    FROM public.monthly_releases mr
    WHERE mr.platform_id = p_platform_id
      AND mr.release_month = p_verdict_month
      AND mr.release_year = p_verdict_year;
    
    -- Value = (content quality × quantity) / price factor
    DECLARE
        v_price_factor DECIMAL := v_platform.monthly_price / 10.0; -- Normalize around $10
        v_content_value DECIMAL := (v_avg_rating / 10.0) * v_content_count;
        v_value_ratio DECIMAL := v_content_value / NULLIF(v_price_factor, 0);
    BEGIN
        IF v_value_ratio >= 2 THEN v_value_adjustment := 1.0;
        ELSIF v_value_ratio >= 1 THEN v_value_adjustment := 0.5;
        ELSIF v_value_ratio >= 0.5 THEN v_value_adjustment := 0;
        ELSIF v_value_ratio >= 0.25 THEN v_value_adjustment := -0.5;
        ELSE v_value_adjustment := -1.0;
        END IF;
    END;
    
    -- Calculate event bonus (max 1 point)
    SELECT COUNT(*) INTO v_high_rated_count
    FROM public.monthly_releases mr
    WHERE mr.platform_id = p_platform_id
      AND mr.release_month = p_verdict_month
      AND mr.release_year = p_verdict_year
      AND mr.rating >= 8.5;
    
    v_event_bonus := LEAST(v_high_rated_count * 0.25, 1.0);
    
    -- Calculate total score (0-10)
    v_total_score := LEAST(10, GREATEST(0, 
        v_base_score + v_relevance_bonus + v_freshness_bonus + v_value_adjustment + v_event_bonus
    ));
    
    -- Determine verdict
    IF v_total_score >= 7.5 THEN v_verdict := 'buy';
    ELSIF v_total_score >= 5.5 THEN v_verdict := 'continue';
    ELSIF v_total_score >= 4.0 THEN v_verdict := 'pause';
    ELSE v_verdict := 'skip';
    END IF;
    
    -- Calculate potential savings
    IF v_verdict IN ('skip', 'pause') THEN
        v_potential_savings := v_platform.monthly_price;
    END IF;
    
    -- Upsert the verdict
    INSERT INTO public.user_verdicts (
        user_id, platform_id, verdict, total_score,
        base_score, relevance_bonus, freshness_bonus, value_adjustment, event_bonus,
        potential_savings, verdict_month, verdict_year
    ) VALUES (
        p_user_id, p_platform_id, v_verdict, v_total_score,
        v_base_score, v_relevance_bonus, v_freshness_bonus, v_value_adjustment, v_event_bonus,
        v_potential_savings, p_verdict_month, p_verdict_year
    )
    ON CONFLICT (user_id, platform_id, verdict_year, verdict_month)
    DO UPDATE SET
        verdict = EXCLUDED.verdict,
        total_score = EXCLUDED.total_score,
        base_score = EXCLUDED.base_score,
        relevance_bonus = EXCLUDED.relevance_bonus,
        freshness_bonus = EXCLUDED.freshness_bonus,
        value_adjustment = EXCLUDED.value_adjustment,
        event_bonus = EXCLUDED.event_bonus,
        potential_savings = EXCLUDED.potential_savings,
        updated_at = NOW()
    RETURNING * INTO v_result;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RECALCULATE ALL VERDICTS FOR A USER
-- Called when user updates interests or for monthly refresh
-- ============================================================================
CREATE OR REPLACE FUNCTION public.recalculate_user_verdicts(
    p_user_id UUID,
    p_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS SETOF public.user_verdicts AS $$
BEGIN
    RETURN QUERY
    SELECT v.*
    FROM public.ott_platforms p
    CROSS JOIN LATERAL public.calculate_user_verdict(p_user_id, p.id, p_month, p_year) v
    WHERE p.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RECALCULATE ALL VERDICTS FOR ALL USERS (CRON JOB)
-- Used by monthly cron job - requires service_role
-- ============================================================================
CREATE OR REPLACE FUNCTION public.recalculate_all_verdicts(
    p_month INTEGER DEFAULT EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER
)
RETURNS TABLE(processed_users INTEGER, processed_verdicts INTEGER) AS $$
DECLARE
    v_user_count INTEGER := 0;
    v_verdict_count INTEGER := 0;
    v_user RECORD;
BEGIN
    FOR v_user IN SELECT id FROM public.users LOOP
        v_user_count := v_user_count + 1;
        
        SELECT COUNT(*) INTO v_verdict_count
        FROM public.recalculate_user_verdicts(v_user.id, p_month, p_year);
        
        v_verdict_count := v_verdict_count + v_verdict_count;
    END LOOP;
    
    RETURN QUERY SELECT v_user_count, v_verdict_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CHECK RATE LIMIT
-- Returns true if action is allowed, false if rate limited
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_identifier TEXT,
    p_action TEXT,
    p_max_attempts INTEGER,
    p_window_minutes INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    v_attempt_count INTEGER;
    v_window_start TIMESTAMPTZ := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
BEGIN
    -- Count attempts in window
    SELECT COUNT(*) INTO v_attempt_count
    FROM public.rate_limit_log
    WHERE identifier = p_identifier
      AND action = p_action
      AND attempted_at > v_window_start;
    
    IF v_attempt_count >= p_max_attempts THEN
        RETURN false;
    END IF;
    
    -- Log this attempt
    INSERT INTO public.rate_limit_log (identifier, action, expires_at)
    VALUES (p_identifier, p_action, NOW() + (p_window_minutes || ' minutes')::INTERVAL);
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CLEANUP EXPIRED RATE LIMITS
-- Called periodically to clean up old entries
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS INTEGER AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM public.rate_limit_log
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANT EXECUTE PERMISSIONS
-- ============================================================================
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.calculate_user_verdict(UUID, UUID, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.recalculate_user_verdicts(UUID, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.recalculate_all_verdicts(INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, TEXT, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_rate_limits() TO service_role;
