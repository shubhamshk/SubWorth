'use client';

import { useEffect, useState } from 'react';
import { getSubscriptionState, UserSubscriptionState } from '@/actions/subscription';
import { createClient } from '@/lib/supabase/client';

export function useSubscription() {
    const [state, setState] = useState<UserSubscriptionState>({
        plan: null,
        isPaid: false,
        status: 'none',
        features: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function fetchState() {
            try {
                const data = await getSubscriptionState();
                if (mounted) {
                    setState(data);
                }
            } catch (err) {
                console.error('Failed to fetch subscription state:', err);
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        fetchState();

        return () => {
            mounted = false;
        };
    }, []);

    const hasFeature = (key: string) => {
        // Check local features list (if we decided to sync all keys)
        // OR we could add a server check here if critical
        // For UI toggling, checking the plan features JSON is usually enough
        if (!state.plan) return false;
        // Assuming features is a Record<string, any> or list of keys
        // In our helper we returned keys
        if (state.features.includes(key)) return true;

        // Fallback: check map in plan.features
        return !!state.plan.features?.[key];
    };

    return {
        ...state,
        loading,
        hasFeature
    };
}
