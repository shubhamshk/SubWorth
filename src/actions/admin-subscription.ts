'use server';

import { createServiceRoleClient, getAuthenticatedUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * ADMIN ACTION: Set a user's subscription plan.
 * 
 * SECURITY:
 * - This uses `createServiceRoleClient` to bypass RLS.
 * - In a real app, this would be protected by an `is_admin` check.
 * - For now, we allow it for the authenticated user to "upgrade" themselves
 *   (Simulation Mode) or if we want to restrict, we check an admin email.
 */
export async function adminSetSubscription(targetUserId: string, planName: 'FREE' | 'PRO' | 'TEAM') {
    // 1. Verify caller is authenticated (basic check)
    const caller = await getAuthenticatedUser();
    if (!caller) {
        throw new Error('Unauthorized');
    }

    // In real implementation: Verify caller.id is an admin
    // if (caller.email !== 'admin@example.com') throw new Error('Forbidden');

    const supabaseAdmin = createServiceRoleClient();

    // 2. Get Plan ID
    const { data: plan } = await supabaseAdmin
        .from('subscription_plans')
        .select('id')
        .eq('name', planName)
        .single();

    if (!plan) throw new Error(`Plan ${planName} not found`);

    // 3. Deactivate current subscriptions
    await supabaseAdmin
        .from('user_subscriptions')
        .update({ status: 'cancelled', ends_at: new Date().toISOString() })
        .eq('user_id', targetUserId)
        .eq('status', 'active');

    // 4. Create new subscription
    // Note: For FREE, we might just want to delete the active subscription tuple 
    // if "No record" implies free, but based on our schema we track it.
    // Actually, standard SaaS practice: Free Tier usually implies NO active "paid" subscription record,
    // OR a record pointing to the Free plan.
    // Let's assume we insert a record for consistency with our Schema which requires plan_id.

    const { error } = await supabaseAdmin
        .from('user_subscriptions')
        .insert({
            user_id: targetUserId,
            plan_id: plan.id,
            status: 'active',
            started_at: new Date().toISOString()
        });

    if (error) {
        console.error('Subscription update failed:', error);
        throw new Error('Failed to update subscription');
    }

    revalidatePath('/'); // Refresh UI
    return { success: true, plan: planName };
}
