/**
 * NOTIFICATION SERVER ACTIONS
 * 
 * SECURITY:
 * - Template-based emails only (no user HTML)
 * - Rate limited per user
 * - Secure unsubscribe tokens
 */

'use server';

import { createServerClient, createServiceRoleClient, requireAuth } from '@/lib/supabase/server';
import { validateInput, unsubscribeSchema } from '@/lib/validation/schemas';
import { notificationRateLimiter } from '@/lib/security';

import type { ActionResult } from '@/types';

/**
 * Get user's unsubscribe token
 * Used for email opt-out links
 */
export async function getUnsubscribeToken(): Promise<ActionResult<string>> {
    try {
        const user = await requireAuth();
        const supabase = (await createServerClient()) as any;

        const { data, error } = await supabase
            .from('users')
            .select('unsubscribe_token')
            .eq('auth_id', user.id)
            .single();

        if (error || !data) {
            return { success: false, error: 'Failed to get unsubscribe token' };
        }

        return {
            success: true,
            data: data.unsubscribe_token
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get token'
        };
    }
}

/**
 * Unsubscribe from emails using token
 * 
 * SECURITY:
 * - Validates token is valid UUID
 * - Does not require authentication (for email links)
 * - Uses service role to update user
 */
export async function unsubscribeFromEmails(
    input: { token: string }
): Promise<ActionResult> {
    try {
        // Validate token format
        const validated = validateInput(unsubscribeSchema, input);

        // Use service role since user may not be logged in
        const serviceClient = createServiceRoleClient();

        // Find user by unsubscribe token
        const { data: user, error: findError } = await serviceClient
            .from('users')
            .select('id')
            .eq('unsubscribe_token', validated.token)
            .single();

        if (findError || !user) {
            return { success: false, error: 'Invalid unsubscribe token' };
        }

        // Disable email notifications
        const { error: updateError } = await serviceClient
            .from('users')
            .update({
                email_notifications_enabled: false,
                notification_frequency: 'never'
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Unsubscribe error:', updateError);
            return { success: false, error: 'Failed to unsubscribe' };
        }

        // Regenerate token for security (prevent reuse)
        await serviceClient
            .from('users')
            .update({
                unsubscribe_token: crypto.randomUUID()
            })
            .eq('id', user.id);

        return { success: true };
    } catch (error) {
        console.error('Unsubscribe error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to unsubscribe'
        };
    }
}

/**
 * Request a test notification (for testing purposes)
 * 
 * SECURITY:
 * - Rate limited to 3 per day per user
 * - Requires authentication
 */
export async function requestTestNotification(): Promise<ActionResult> {
    try {
        const user = await requireAuth();

        // Rate limit check
        const rateLimitResult = notificationRateLimiter(user.id);

        if (!rateLimitResult.allowed) {
            return {
                success: false,
                error: `You've reached the daily notification limit. Try again tomorrow.`
            };
        }

        const supabase = (await createServerClient()) as any;

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', user.id)
            .single();

        if (profileError || !profile) {
            return { success: false, error: 'User profile not found' };
        }

        if (!profile.email_notifications_enabled) {
            return { success: false, error: 'Email notifications are disabled' };
        }

        // In a real implementation, this would trigger the email edge function
        // For now, just log the notification request
        const serviceClient = createServiceRoleClient();

        await serviceClient
            .from('notification_log')
            .insert({
                user_id: profile.id,
                notification_type: 'verdict_update',
                status: 'sent'
            });

        return { success: true };
    } catch (error) {
        console.error('Test notification error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send notification'
        };
    }
}

/**
 * Get notification history for current user
 */
export async function getNotificationHistory(): Promise<ActionResult<Array<{
    type: string;
    sentAt: string;
    status: string;
}>>> {
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

        // Get notification history (RLS enforced)
        const { data: notifications, error } = await supabase
            .from('notification_log')
            .select('notification_type, sent_at, status')
            .eq('user_id', userRecord.id)
            .order('sent_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Get notifications error:', error);
            return { success: false, error: 'Failed to get notification history' };
        }

        return {
            success: true,
            data: notifications.map((n: { notification_type: string; sent_at: string; status: string }) => ({
                type: n.notification_type,
                sentAt: n.sent_at,
                status: n.status
            }))
        };
    } catch (error) {
        console.error('Get notifications error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to get notifications'
        };
    }
}
