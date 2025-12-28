/**
 * AUTHENTICATION SERVER ACTIONS
 * 
 * SECURITY: All auth logic runs server-side only.
 * - No auth logic in client components
 * - Redirect URLs strictly whitelisted
 * - Session validation on every operation
 */

'use server';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { validateInput, signInWithOAuthSchema } from '@/lib/validation/schemas';
import { loginRateLimiter, resetRateLimit } from '@/lib/security';
import { headers } from 'next/headers';

// Strictly whitelisted redirect URLs
const ALLOWED_REDIRECTS = [
    '/dashboard',
    '/auth/callback',
    '/'
];

/**
 * Validate redirect URL is in whitelist
 * SECURITY: Prevents open redirect attacks
 */
function validateRedirectUrl(url: string | undefined): string {
    const defaultRedirect = '/dashboard';

    if (!url) return defaultRedirect;

    // Only allow relative URLs starting with /
    if (!url.startsWith('/')) return defaultRedirect;

    // Check against whitelist
    const isAllowed = ALLOWED_REDIRECTS.some((allowed) =>
        url === allowed || url.startsWith(`${allowed}/`) || url.startsWith(`${allowed}?`)
    );

    return isAllowed ? url : defaultRedirect;
}

/**
 * Get client IP for rate limiting
 */
async function getClientIP(): Promise<string> {
    const headersList = await headers();
    return (
        headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headersList.get('x-real-ip') ||
        'unknown'
    );
}

import type { AuthResult } from '@/types';

/**
 * Sign in with OAuth (Google only)
 * 
 * SECURITY:
 * - Rate limited per IP
 * - Redirect URL whitelisted
 * - Only Google provider enabled
 */
export async function signInWithOAuth(
    input: { provider: 'google'; redirectTo?: string }
): Promise<AuthResult> {
    try {
        // Validate input
        const validated = validateInput(signInWithOAuthSchema, input);

        // Rate limit check
        const clientIP = await getClientIP();
        const rateLimitResult = loginRateLimiter(clientIP);

        if (!rateLimitResult.allowed) {
            return {
                success: false,
                error: `Too many login attempts. Please try again in ${Math.ceil(rateLimitResult.retryAfter / 60000)} minutes.`
            };
        }

        // Get Supabase client
        const supabase = await createServerClient();

        // Build redirect URL
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const redirectTo = `${appUrl}/auth/callback?next=${encodeURIComponent(validateRedirectUrl(validated.redirectTo))}`;

        // Initiate OAuth flow
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: validated.provider,
            options: {
                redirectTo,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent'
                }
            }
        });

        if (error) {
            return {
                success: false,
                error: error.message
            };
        }

        return {
            success: true,
            redirectUrl: data.url
        };
    } catch (error) {
        console.error('OAuth sign in error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Authentication failed'
        };
    }
}

/**
 * Sign out current user
 * 
 * SECURITY: Clears all session cookies
 */
export async function signOut(): Promise<AuthResult> {
    try {
        const supabase = await createServerClient();

        const { error } = await supabase.auth.signOut();

        if (error) {
            return {
                success: false,
                error: error.message
            };
        }

        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return {
            success: false,
            error: 'Sign out failed'
        };
    }
}

/**
 * Get current authenticated user
 * Returns null if not authenticated
 */
export async function getCurrentUser() {
    try {
        const supabase = await createServerClient();

        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.user_metadata?.name,
            avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture
        };
    } catch {
        return null;
    }
}

/**
 * Get user profile from database
 * Returns null if not found
 */
export async function getUserProfile() {
    try {
        const supabase = await createServerClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', user.id)
            .single();

        if (error || !profile) {
            return null;
        }

        return profile;
    } catch {
        return null;
    }
}

/**
 * Handle OAuth callback
 * Called from /auth/callback route
 */
export async function handleAuthCallback(code: string) {
    try {
        const supabase = await createServerClient();

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('Auth callback error:', error);
            return { success: false, error: error.message };
        }

        // Reset rate limit on successful login
        const clientIP = await getClientIP();
        resetRateLimit(clientIP, 'login');

        return { success: true };
    } catch (error) {
        console.error('Auth callback error:', error);
        return { success: false, error: 'Authentication failed' };
    }
}

/**
 * Redirect to login if not authenticated
 * Use in server components that require auth
 */
export async function requireAuthRedirect() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    return user;
}
