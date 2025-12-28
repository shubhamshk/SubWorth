/**
 * SUPABASE BROWSER CLIENT
 * 
 * SECURITY: This client uses only the anon key.
 * - All operations are subject to RLS policies
 * - Safe to use in client components
 * - Cannot access service_role operations
 * 
 * For mutations, prefer server actions over direct client calls.
 */

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database.types';

/**
 * Create a Supabase client for browser-side operations.
 * Uses the anon key - RLS policies are enforced.
 */
export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

/**
 * Singleton instance for consistent usage across components.
 * Re-creates on each call as recommended by Supabase for Next.js.
 */
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
    if (typeof window === 'undefined') {
        throw new Error('getSupabaseClient can only be used in browser context');
    }

    if (!browserClient) {
        browserClient = createClient();
    }

    return browserClient;
}
