/**
 * NEXT.JS MIDDLEWARE
 * 
 * SECURITY: Runs on every request to enforce security policies.
 * - Refreshes Supabase sessions
 * - Applies security headers (CSP, X-Frame-Options, etc.)
 * - Enforces CORS policy
 * - Protects routes based on authentication
 */

import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { getAllSecurityHeaders, getCORSHeaders } from '@/lib/security/headers';

// Routes that require authentication
const PROTECTED_ROUTES = [
    '/dashboard',
    '/settings',
    '/profile',
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = [
    '/login',
    '/signup',
    '/auth',
];

// API routes that need CORS headers
const API_ROUTES = [
    '/api/',
];

export async function middleware(request: NextRequest) {
    const { pathname, origin } = request.nextUrl;
    const requestOrigin = request.headers.get('origin');

    // ==========================================================================
    // Handle CORS preflight requests
    // ==========================================================================
    if (request.method === 'OPTIONS') {
        const corsHeaders = getCORSHeaders(requestOrigin);

        if (Object.keys(corsHeaders).length === 0 && requestOrigin) {
            // Origin not in whitelist
            return new NextResponse(null, { status: 403 });
        }

        return new NextResponse(null, {
            status: 204,
            headers: corsHeaders,
        });
    }

    // ==========================================================================
    // Refresh Supabase session
    // ==========================================================================
    const { response, user } = await updateSession(request);

    // ==========================================================================
    // Apply security headers
    // ==========================================================================
    const securityHeaders = getAllSecurityHeaders();
    for (const [key, value] of Object.entries(securityHeaders)) {
        response.headers.set(key, value);
    }

    // ==========================================================================
    // Add CORS headers for API routes
    // ==========================================================================
    if (API_ROUTES.some((route) => pathname.startsWith(route))) {
        const corsHeaders = getCORSHeaders(requestOrigin);
        for (const [key, value] of Object.entries(corsHeaders)) {
            response.headers.set(key, value);
        }
    }

    // ==========================================================================
    // Route protection
    // ==========================================================================

    // Check if trying to access protected route without auth
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    if (isProtectedRoute && !user) {
        const loginUrl = new URL('/login', origin);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check if trying to access auth routes while already authenticated
    const isAuthRoute = AUTH_ROUTES.some((route) =>
        pathname.startsWith(route)
    );

    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', origin));
    }

    return response;
}

// ==========================================================================
// Middleware config - run on all routes except static files
// ==========================================================================
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
