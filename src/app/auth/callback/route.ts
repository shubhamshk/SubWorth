import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * AUTH CALLBACK ROUTE
 * 
 * Purpose: Exchange OAuth code for session, then redirect.
 * IMPORTANT: This route ONLY establishes the session.
 * All routing decisions (onboarding vs dashboard) are handled by middleware.
 */
export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
        const cookieStore = cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name, value, options) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name, options) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Redirect to dashboard - Middleware will handle proper routing
            // based on onboarding_completed status
            return NextResponse.redirect(`${origin}/dashboard`);
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=auth`);
}

