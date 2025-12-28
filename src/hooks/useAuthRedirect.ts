import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { useCallback } from 'react';

/**
 * Hook to handle navigation that requires authentication.
 * If user is not logged in -> redirects to /login
 * If user is logged in -> executes the intended navigation
 */
export function useAuthRedirect() {
    const router = useRouter();
    const supabase = getSupabaseClient();

    const handleProtectedClick = useCallback(async (targetRoute: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                // If specific route provided, we could verify keeping it in query params
                // For now, adhering to simple requirement: redirect to /login
                router.push(`/login?redirect=${encodeURIComponent(targetRoute)}`);
                return;
            }

            // User is authenticated, proceed to target
            router.push(targetRoute);
        } catch (error) {
            console.error('Auth check failed:', error);
            // Fallback to login on error for safety
            router.push('/login');
        }
    }, [router, supabase]);

    return { handleProtectedClick };
}
