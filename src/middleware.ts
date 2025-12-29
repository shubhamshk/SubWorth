import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
    const { pathname, origin, searchParams } = request.nextUrl;

    let response = NextResponse.next({
        request: { headers: request.headers },
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
                    response.cookies.set({ name, value, ...options });
                },
                remove(name, options) {
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // ROUTES
    const isRootRoute = pathname === '/';
    const isOnboardingRoute = pathname.startsWith('/onboarding');
    const isProtectedRoute = pathname.startsWith('/dashboard');
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/auth');

    // 🔑 ONE-TIME ESCAPE FLAG
    const onboardingJustCompleted =
        searchParams.get('onboarding') === 'complete';

    // 1️⃣ LANDING PAGE → ALWAYS ALLOW
    if (isRootRoute) {
        return response;
    }

    // 2️⃣ NOT AUTHENTICATED
    if (!user) {
        if (isProtectedRoute || isOnboardingRoute) {
            return NextResponse.redirect(new URL('/login', origin));
        }
        return response;
    }

    // 3️⃣ AUTHENTICATED → FETCH PROFILE
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

    const onboardingCompleted = profile?.onboarding_completed === true;
    const justCompleted = searchParams.get('completed') === 'true';

    console.log('🔐 Middleware check:', {
        pathname,
        userId: user.id,
        profileExists: !!profile,
        onboardingCompleted,
        justCompleted,
        isOnboardingRoute,
        isProtectedRoute
    });

    // 4️⃣ ROUTING LOGIC
    // ─────────────────────────────────────

    // ✅ ONBOARDING DONE OR JUST COMPLETED
    if (onboardingCompleted || justCompleted) {
        if (isOnboardingRoute || isAuthRoute) {
            console.log('✅ Onboarding complete - redirecting to dashboard');
            return NextResponse.redirect(new URL('/dashboard', origin));
        }
        return response;
    }

    // ⛔ ONBOARDING NOT DONE (or profile doesn't exist)
    if (!onboardingCompleted) {
        // If user is on onboarding page, allow them to stay there
        if (isOnboardingRoute) {
            console.log('📝 User on onboarding page - allowing access');
            return response;
        }

        // Redirect protected routes and auth routes to onboarding
        if (isProtectedRoute || isAuthRoute) {
            console.log('⚠️ Onboarding not complete - redirecting to onboarding');
            return NextResponse.redirect(new URL('/onboarding', origin));
        }
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
