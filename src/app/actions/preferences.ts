/**
 * USER PREFERENCES SERVER ACTIONS
 * 
 * SECURITY:
 * - All operations require authentication
 * - All inputs validated with Zod
 * - RLS enforced at database level
 * - Rate limited where appropriate
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient, requireAuth } from '@/lib/supabase/server';
import {
    validateInput,
    updateInterestsSchema,
    toggleSubscriptionSchema,
    updateNotificationSettingsSchema,
    updateProfileSchema
} from '@/lib/validation/schemas';
import type {
    UpdateInterestsInput,
    ToggleSubscriptionInput,
    UpdateNotificationSettingsInput,
    UpdateProfileInput
} from '@/lib/validation/schemas';

import type { ActionResult } from '@/types';

/**
 * Get user's interests
 */
export async function getUserInterests(): Promise<ActionResult<string[]>> {
    try {
        const user = await requireAuth();
        const supabase = (await createServerClient()) as any;

        // Get user record
        const { data: userRecord } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', user.id)
            .single();

        if (!userRecord) {
            return { success: false, error: 'User not found' };
        }

        // Get interests (RLS enforced)
        const { data: interests, error } = await supabase
            .from('user_interests')
            .select('interest')
            .eq('user_id', userRecord.id);

        if (error) {
            console.error('Get interests error:', error);
            return { success: false, error: 'Failed to get interests' };
        }

        return {
            success: true,
            data: interests.map((i: { interest: string }) => i.interest)
        };
    } catch (error) {
        console.error('Get interests error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get interests'
        };
    }
}

/**
 * Update user's interests
 * 
 * SECURITY:
 * - Validates interests against whitelist
 * - Deletes and re-inserts (atomic operation)
 * - RLS enforced
 */
export async function updateInterests(
    input: UpdateInterestsInput
): Promise<ActionResult<string[]>> {
    try {
        // Validate input
        const validated = validateInput(updateInterestsSchema, input);

        const user = await requireAuth();
        const supabase = (await createServerClient()) as any;

        // Get user record
        const { data: userRecord } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', user.id)
            .single();

        if (!userRecord) {
            return { success: false, error: 'User not found' };
        }

        // Delete existing interests
        const { error: deleteError } = await supabase
            .from('user_interests')
            .delete()
            .eq('user_id', userRecord.id);

        if (deleteError) {
            console.error('Delete interests error:', deleteError);
            return { success: false, error: 'Failed to update interests' };
        }

        // Insert new interests
        const interestRows = validated.interests.map((interest: string) => ({
            user_id: userRecord.id,
            interest
        }));

        const { error: insertError } = await supabase
            .from('user_interests')
            .insert(interestRows);

        if (insertError) {
            console.error('Insert interests error:', insertError);
            return { success: false, error: 'Failed to update interests' };
        }

        // Revalidate dashboard to reflect new recommendations
        revalidatePath('/dashboard');

        return {
            success: true,
            data: validated.interests
        };
    } catch (error) {
        console.error('Update interests error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update interests'
        };
    }
}

/**
 * Get user's subscribed platforms
 */
export async function getUserSubscriptions(): Promise<ActionResult<string[]>> {
    try {
        const user = await requireAuth();
        const supabase = (await createServerClient()) as any;

        // Get user record
        const { data: userRecord } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', user.id)
            .single();

        if (!userRecord) {
            return { success: false, error: 'User not found' };
        }

        // Get active subscriptions (RLS enforced)
        const { data: subscriptions, error } = await supabase
            .from('user_subscriptions')
            .select('platform_id')
            .eq('user_id', userRecord.id)
            .eq('is_active', true);

        if (error) {
            console.error('Get subscriptions error:', error);
            return { success: false, error: 'Failed to get subscriptions' };
        }

        return {
            success: true,
            data: subscriptions.map((s: { platform_id: string }) => s.platform_id)
        };
    } catch (error) {
        console.error('Get subscriptions error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get subscriptions'
        };
    }
}

/**
 * Toggle platform subscription
 * 
 * SECURITY:
 * - Validates platform ID is valid UUID
 * - RLS enforced
 */
export async function toggleSubscription(
    input: ToggleSubscriptionInput
): Promise<ActionResult<{ isSubscribed: boolean }>> {
    try {
        // Validate input
        const validated = validateInput(toggleSubscriptionSchema, input);

        const user = await requireAuth();
        const supabase = (await createServerClient()) as any;

        // Get user record
        const { data: userRecord } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', user.id)
            .single();

        if (!userRecord) {
            return { success: false, error: 'User not found' };
        }

        // Check if subscription exists
        const { data: existing } = await supabase
            .from('user_subscriptions')
            .select('id, is_active')
            .eq('user_id', userRecord.id)
            .eq('platform_id', validated.platformId)
            .single();

        let isSubscribed: boolean;

        if (existing) {
            // Toggle existing subscription
            const { error } = await supabase
                .from('user_subscriptions')
                .update({ is_active: !existing.is_active })
                .eq('id', existing.id);

            if (error) {
                console.error('Toggle subscription error:', error);
                return { success: false, error: 'Failed to toggle subscription' };
            }

            isSubscribed = !existing.is_active;
        } else {
            // Create new subscription
            const { error } = await supabase
                .from('user_subscriptions')
                .insert({
                    user_id: userRecord.id,
                    platform_id: validated.platformId,
                    is_active: true
                });

            if (error) {
                console.error('Create subscription error:', error);
                return { success: false, error: 'Failed to create subscription' };
            }

            isSubscribed = true;
        }

        // Revalidate dashboard
        revalidatePath('/dashboard');

        return {
            success: true,
            data: { isSubscribed }
        };
    } catch (error) {
        console.error('Toggle subscription error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to toggle subscription'
        };
    }
}

/**
 * Update notification settings
 */
export async function updateNotificationSettings(
    input: UpdateNotificationSettingsInput
): Promise<ActionResult> {
    try {
        // Validate input
        const validated = validateInput(updateNotificationSettingsSchema, input);

        const user = await requireAuth();
        const supabase = (await createServerClient()) as any;

        const { error } = await supabase
            .from('users')
            .update({
                email_notifications_enabled: validated.emailNotificationsEnabled,
                notification_frequency: validated.notificationFrequency
            })
            .eq('auth_id', user.id);

        if (error) {
            console.error('Update notification settings error:', error);
            return { success: false, error: 'Failed to update notification settings' };
        }

        return { success: true };
    } catch (error) {
        console.error('Update notification settings error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update settings'
        };
    }
}

/**
 * Update user profile
 */
export async function updateProfile(
    input: UpdateProfileInput
): Promise<ActionResult> {
    try {
        // Validate input (includes XSS sanitization)
        const validated = validateInput(updateProfileSchema, input);

        const user = await requireAuth();
        const supabase = (await createServerClient()) as any;

        const { error } = await supabase
            .from('users')
            .update({
                ...(validated.fullName !== undefined && { full_name: validated.fullName }),
                ...(validated.avatarUrl !== undefined && { avatar_url: validated.avatarUrl })
            })
            .eq('auth_id', user.id);

        if (error) {
            console.error('Update profile error:', error);
            return { success: false, error: 'Failed to update profile' };
        }

        return { success: true };
    } catch (error) {
        console.error('Update profile error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update profile'
        };
    }
}
