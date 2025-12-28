-- ============================================================================
-- OTT SUBSCRIPTION MANAGER - ROW LEVEL SECURITY POLICIES
-- ============================================================================
-- Security Principles:
-- 1. Users can ONLY access their own data (enforced via auth.uid())
-- 2. Platform and release data is READ-ONLY for authenticated users
-- 3. Admin operations require service_role (bypasses RLS)
-- 4. Anonymous users have NO access to any table
-- 5. All policies use auth.uid() which is cryptographically verified by Supabase
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTION: Get user_id from auth.uid()
-- This ensures consistent lookup across all policies
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_id()
RETURNS UUID AS $$
DECLARE
    user_record_id UUID;
BEGIN
    SELECT id INTO user_record_id
    FROM public.users
    WHERE auth_id = auth.uid();
    
    RETURN user_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================================
-- USERS TABLE POLICIES
-- Users can only read/update their own profile
-- ============================================================================

-- Allow users to read their own profile
CREATE POLICY "users_select_own"
ON public.users
FOR SELECT
TO authenticated
USING (auth_id = auth.uid());

-- Allow users to update their own profile (but not auth_id or id)
CREATE POLICY "users_update_own"
ON public.users
FOR UPDATE
TO authenticated
USING (auth_id = auth.uid())
WITH CHECK (auth_id = auth.uid());

-- Users CANNOT insert directly - handled by trigger on auth.users
-- Users CAN delete their own profile (cascades to all related data)
CREATE POLICY "users_delete_own"
ON public.users
FOR DELETE
TO authenticated
USING (auth_id = auth.uid());

-- ============================================================================
-- OTT_PLATFORMS TABLE POLICIES
-- Public read for authenticated users, admin-only write
-- ============================================================================

-- Allow all authenticated users to read platforms
CREATE POLICY "platforms_select_authenticated"
ON public.ott_platforms
FOR SELECT
TO authenticated
USING (true);

-- No INSERT/UPDATE/DELETE policies for regular users
-- Admin operations use service_role which bypasses RLS

-- ============================================================================
-- MONTHLY_RELEASES TABLE POLICIES
-- Public read for authenticated users, admin-only write
-- ============================================================================

-- Allow all authenticated users to read releases
CREATE POLICY "releases_select_authenticated"
ON public.monthly_releases
FOR SELECT
TO authenticated
USING (true);

-- No INSERT/UPDATE/DELETE policies for regular users
-- Admin operations use service_role which bypasses RLS

-- ============================================================================
-- USER_INTERESTS TABLE POLICIES
-- Users can only manage their own interests
-- ============================================================================

-- Allow users to read their own interests
CREATE POLICY "interests_select_own"
ON public.user_interests
FOR SELECT
TO authenticated
USING (user_id = public.get_user_id());

-- Allow users to add interests for themselves
CREATE POLICY "interests_insert_own"
ON public.user_interests
FOR INSERT
TO authenticated
WITH CHECK (user_id = public.get_user_id());

-- Allow users to delete their own interests
CREATE POLICY "interests_delete_own"
ON public.user_interests
FOR DELETE
TO authenticated
USING (user_id = public.get_user_id());

-- No UPDATE policy - delete and re-insert instead

-- ============================================================================
-- USER_SUBSCRIPTIONS TABLE POLICIES
-- Users can only manage their own subscriptions
-- ============================================================================

-- Allow users to read their own subscriptions
CREATE POLICY "subscriptions_select_own"
ON public.user_subscriptions
FOR SELECT
TO authenticated
USING (user_id = public.get_user_id());

-- Allow users to add subscriptions for themselves
CREATE POLICY "subscriptions_insert_own"
ON public.user_subscriptions
FOR INSERT
TO authenticated
WITH CHECK (user_id = public.get_user_id());

-- Allow users to update their own subscriptions
CREATE POLICY "subscriptions_update_own"
ON public.user_subscriptions
FOR UPDATE
TO authenticated
USING (user_id = public.get_user_id())
WITH CHECK (user_id = public.get_user_id());

-- Allow users to delete their own subscriptions
CREATE POLICY "subscriptions_delete_own"
ON public.user_subscriptions
FOR DELETE
TO authenticated
USING (user_id = public.get_user_id());

-- ============================================================================
-- USER_VERDICTS TABLE POLICIES
-- Users can only READ their own verdicts (system-generated)
-- ============================================================================

-- Allow users to read their own verdicts
CREATE POLICY "verdicts_select_own"
ON public.user_verdicts
FOR SELECT
TO authenticated
USING (user_id = public.get_user_id());

-- No INSERT/UPDATE policies for regular users
-- Verdicts are calculated by server functions using service_role

-- Users CAN delete their own verdicts (if they want to refresh)
CREATE POLICY "verdicts_delete_own"
ON public.user_verdicts
FOR DELETE
TO authenticated
USING (user_id = public.get_user_id());

-- ============================================================================
-- NOTIFICATION_LOG TABLE POLICIES
-- Users can only READ their notification history
-- ============================================================================

-- Allow users to read their own notifications
CREATE POLICY "notifications_select_own"
ON public.notification_log
FOR SELECT
TO authenticated
USING (user_id = public.get_user_id());

-- No INSERT/UPDATE/DELETE policies for regular users
-- Notifications are created by server functions using service_role

-- ============================================================================
-- RATE_LIMIT_LOG TABLE POLICIES
-- No direct access - only via service_role
-- ============================================================================

-- No policies for authenticated users - service_role only
-- This table is internal to the rate limiting system

-- ============================================================================
-- GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant select on public data tables to authenticated users
GRANT SELECT ON public.ott_platforms TO authenticated;
GRANT SELECT ON public.monthly_releases TO authenticated;

-- Grant all necessary permissions on user-specific tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.user_interests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_subscriptions TO authenticated;
GRANT SELECT, DELETE ON public.user_verdicts TO authenticated;
GRANT SELECT ON public.notification_log TO authenticated;

-- Grant execute on helper functions
GRANT EXECUTE ON FUNCTION public.get_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
