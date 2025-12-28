import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    const { pathname, origin } = request.nextUrl;
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name) {
                    return request.cookies.get(name)?.value;
                },
                set(name, value, options) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
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
                remove(name, options) {
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

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // ROUTES CONFIGURATION
    const isAuthRoute = ['/login', '/signup', '/auth'].some((route) =>
        pathname.startsWith(route)
    );
    const isProtectedRoute = ['/dashboard', '/settings', '/profile'].some((route) =>
        pathname.startsWith(route)
    );
    const isOnboardingRoute = pathname.startsWith('/onboarding');
    const isRootRoute = pathname === '/';

    // 1. UNAUTHENTICATED USER
    if (!user) {
        // Attempting to access protected routes -> Redirect to Login
        if (isProtectedRoute || isOnboardingRoute) {
            const loginUrl = new URL('/login', origin);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
        // Allow access to public routes (landing page, auth pages)
        return response;
    }

    // 2. AUTHENTICATED USER - CHECK ONBOARDING STATUS
    // Fetch profile to see if onboarding is completed
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

    const onboardingCompleted = profile?.onboarding_completed === true;

    // 3. ONBOARDING LOGIC
    if (onboardingCompleted) {
        // User HAS completed onboarding
        // - Should NOT be on /onboarding -> Redirect to /dashboard
        // - Should NOT be on /login, /signup, / (root) -> Redirect to /dashboard
        if (isOnboardingRoute || isAuthRoute || isRootRoute) {
            return NextResponse.redirect(new URL('/dashboard', origin));
        }
    } else {
        // User HAS NOT completed onboarding
        // - Should NOT be on /dashboard (or other protected apps) -> Redirect to /onboarding
        // - Should NOT be on / (root) -> Redirect to /onboarding
        if (isProtectedRoute || isRootRoute) {
            return NextResponse.redirect(new URL('/onboarding', origin));
        }
        // Allow access to /onboarding (and /login if they want to switch accounts, technically)
    }

    return response;
}

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
