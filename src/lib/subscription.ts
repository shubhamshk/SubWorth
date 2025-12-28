import { createServerClient } from '@/lib/supabase/server';
import { cache } from 'react';

export type SubscriptionPlan = {
    id: string;
    name: 'FREE' | 'PRO' | 'TEAM';
    features: Record<string, any>;
};

export type UserSubscription = {
    plan: SubscriptionPlan;
    status: 'active' | 'cancelled' | 'expired';
    ends_at: string | null;
};

/**
 * Get the current user's subscription plan.
 * Returns FREE plan if no active subscription found.
 */
export const getUserPlan = cache(async (userId: string): Promise<UserSubscription> => {
    const supabase = await createServerClient();

    // Fetch active subscription
    // We join with subscription_plans
    const { data: sub, error } = await supabase
        .from('user_subscriptions')
        .select(`
      status,
      ends_at,
      subscription_plans (
        id,
        name,
        features
      )
    `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

    if (error || !sub || !sub.subscription_plans) {
        // Default to FREE plan if no sub or error
        // In a real app we might want to fetch the actual FREE plan ID from DB to be consistent
        return {
            status: 'active', // Free is always active
            ends_at: null,
            plan: {
                id: 'free-fallback', // Should ideally fetch from DB
                name: 'FREE',
                features: {}
            }
        };
    }

    // Cast safely because we trust our DB schema to match the type
    const plan = sub.subscription_plans as unknown as SubscriptionPlan;

    return {
        status: sub.status as 'active' | 'cancelled' | 'expired',
        ends_at: sub.ends_at,
        plan
    };
});

/**
 * Check if a user has a specific feature enabled.
 * Checks both the plan features and any individual overrides if implemented.
 */
export const hasFeature = cache(async (userId: string, featureKey: string): Promise<boolean> => {
    const supabase = await createServerClient();

    // 1. Check if user is on a plan that has this feature enabled
    // We can do this via a single query joining subscriptions -> plans -> plan_features -> feature_flags
    const { data, error } = await supabase
        .rpc('has_active_feature', {
            // check_user_id: userId, // Function not yet implemented in SQL, demonstrating logic or fallback
            // For now we do it via standard query if RPC doesn't exist, but SQL function is better.
            // Let's stick to the requested "helper function" logic which might run client side or server side.
            // Wait, instructions say: "Run server-side only".

            // Let's implement efficiently using the Tables.
        }) as any;

    // Alternative efficient query:
    // Is there an active subscription for this user?
    // AND does that subscription's plan map to the feature?
    const { data: featureData } = await supabase
        .from('user_subscriptions')
        .select(`
      status,
      subscription_plans!inner (
        plan_features!inner (
          enabled,
          feature_flags!inner (
            key
          )
        )
      )
    `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .eq('subscription_plans.plan_features.feature_flags.key', featureKey)
        .eq('subscription_plans.plan_features.enabled', true)
        .single();

    return !!featureData;
});

/**
 * Check if the user is a paid user (PRO or TEAM).
 * Uses the centralized SQL function `is_paid_user` for truth.
 */
export const isPaidUser = cache(async (userId: string): Promise<boolean> => {
    const supabase = await createServerClient();

    // Call the security definer function
    const { data, error } = await supabase.rpc('is_paid_user', {
        user_uuid: userId
    });

    if (error) {
        console.error('Error checking paid status:', error);
        return false;
    }

    return !!data;
});
