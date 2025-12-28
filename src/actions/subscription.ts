'use server';

import { getUserPlan, hasFeature, isPaidUser, SubscriptionPlan } from '@/lib/subscription';
import { getAuthenticatedUser } from '@/lib/supabase/server';

export type UserSubscriptionState = {
    plan: SubscriptionPlan | null;
    isPaid: boolean;
    status: 'active' | 'cancelled' | 'expired' | 'none';
    features: string[]; // List of enabled feature keys (optional, or we verify specific ones)
};

/**
 * Fetch the full subscription state for the current user.
 * Intended for use in Client Components (via useEffect or Query) or Server Components.
 */
export async function getSubscriptionState(): Promise<UserSubscriptionState> {
    const user = await getAuthenticatedUser();

    if (!user) {
        return {
            plan: null, // No user = No plan (effectively guest/free)
            isPaid: false,
            status: 'none',
            features: []
        };
    }

    const [planData, paidStatus] = await Promise.all([
        getUserPlan(user.id),
        isPaidUser(user.id)
    ]);

    // For features, we might not want to return ALL features if the list is huge, 
    // but for now let's return keys if they are in the plan.
    const featureKeys = Object.keys(planData.plan.features || {});

    return {
        plan: planData.plan,
        isPaid: paidStatus,
        status: planData.status,
        features: featureKeys
    };
}
