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

    // 4️⃣ ROUTING LOGIC
    // ─────────────────────────────────────

    // ✅ ONBOARDING DONE
    if (onboardingCompleted) {
        if (isOnboardingRoute || isAuthRoute) {
            return NextResponse.redirect(new URL('/dashboard', origin));
        }
        return response;
    }

    // ⛔ ONBOARDING NOT DONE
    if (!onboardingCompleted) {
        // Allow dashboard ONLY ONCE (escape hatch)
        if (isProtectedRoute && onboardingJustCompleted) {
            return response;
        }

        if (isProtectedRoute || isAuthRoute) {
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
