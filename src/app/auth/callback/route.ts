/**
 * AUTH CALLBACK ROUTE
 * 
 * SECURITY:
 * - Handles OAuth callback securely
 * - Validates redirect URL against whitelist
 * - Exchanges code for session server-side
 */

import { NextResponse } from 'next/server';
import { handleAuthCallback } from '@/app/actions/auth';
import { createServerClient } from '@/lib/supabase/server';

// Whitelisted redirect destinations
const ALLOWED_REDIRECTS = ['/dashboard', '/settings', '/'];

function validateRedirect(redirect: string | null): string {
    if (!redirect) return '/dashboard';
    if (!redirect.startsWith('/')) return '/dashboard';

    const isAllowed = ALLOWED_REDIRECTS.some((allowed) =>
        redirect === allowed || redirect.startsWith(`${allowed}/`)
    );

    return isAllowed ? redirect : '/dashboard';
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
        console.error('OAuth error:', error, errorDescription);
        const errorUrl = new URL('/login', origin);
        errorUrl.searchParams.set('error', errorDescription || error);
        return NextResponse.redirect(errorUrl);
    }

    // Validate code parameter
    if (!code) {
        console.error('Missing code parameter');
        const errorUrl = new URL('/login', origin);
        errorUrl.searchParams.set('error', 'Missing authorization code');
        return NextResponse.redirect(errorUrl);
    }

    try {
        // Exchange code for session
        const supabase = await createServerClient();
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

        if (sessionError) {
            console.error('Session exchange error:', sessionError);
            const errorUrl = new URL('/login', origin);
            errorUrl.searchParams.set('error', sessionError.message);
            return NextResponse.redirect(errorUrl);
        }

        // Redirect to validated destination
        const redirectTo = validateRedirect(next);
        return NextResponse.redirect(new URL(redirectTo, origin));

    } catch (error) {
        console.error('Auth callback error:', error);
        const errorUrl = new URL('/login', origin);
        errorUrl.searchParams.set('error', 'Authentication failed');
        return NextResponse.redirect(errorUrl);
    }
}
