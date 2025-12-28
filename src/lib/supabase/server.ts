/**
 * SUPABASE SERVER CLIENT
 * 
 * SECURITY: This module provides server-side Supabase clients.
 * - createServerClient: For authenticated user operations (uses cookies)
 * - createServiceRoleClient: For admin operations (bypasses RLS)
 * 
 * NEVER import createServiceRoleClient in client components!
 */

import { createServerClient as createSupabaseServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database.types';

/**
 * Create a Supabase client for server-side operations with user context.
 * Uses cookies for session management.
 * RLS policies are enforced based on the authenticated user.
 */
export async function createServerClient(): Promise<any> {
    const cookieStore = await cookies();

    return createSupabaseServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    ) as any;
}

/**
 * Create a Supabase client with service role privileges.
 * 
 * SECURITY WARNING:
 * - This client BYPASSES all RLS policies
 * - ONLY use for admin operations and background jobs
 * - NEVER expose to client or pass user-controlled data without validation
 * - Always validate user permissions before using this client
 */
export function createServiceRoleClient(): any {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase service role configuration');
    }

    return createClient<Database>(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }) as any;
}

/**
 * Get the currently authenticated user from the session.
 * Returns null if not authenticated.
 * 
 * SECURITY: Always use this to verify authentication before operations.
 */
export async function getAuthenticatedUser() {
    const supabase = await createServerClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return null;
    }

    return user;
}

/**
 * Get the current session.
 * Returns null if no valid session exists.
 */
export async function getSession() {
    const supabase = await createServerClient();

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        return null;
    }

    return session;
}

/**
 * Require authentication - throws if not authenticated.
 * Use this at the start of protected server actions.
 */
export async function requireAuth() {
    const user = await getAuthenticatedUser();

    if (!user) {
        throw new Error('Authentication required');
    }

    return user;
}
