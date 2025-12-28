/**
 * SUPABASE MIDDLEWARE UTILITIES
 * 
 * SECURITY: Handles session refresh in Next.js middleware.
 * - Refreshes expired sessions automatically
 * - Updates cookies securely
 * - Used by the main middleware.ts
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database.types';

/**
 * Updates the session in middleware by refreshing tokens if needed.
 * Must be called on every request to keep sessions alive.
 */
export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    // Set cookie on the request for subsequent middleware
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    // Set cookie on the response going to the browser
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    // Refresh session if expired
    // SECURITY: This ensures sessions are refreshed server-side
    const { data: { user } } = await supabase.auth.getUser();

    return { response, user };
}
