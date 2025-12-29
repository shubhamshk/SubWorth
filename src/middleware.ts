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
        .select('onboarding_completed, payment_status')
        .eq('id', user.id)
        .single();

    const onboardingCompleted = profile?.onboarding_completed === true;
    const paymentStatus = profile?.payment_status || 'pending';
    const isPaymentRoute = pathname.startsWith('/payment');

    console.log('🔐 Middleware check:', {
        pathname,
        userId: user.id,
        profileExists: !!profile,
        paymentStatus,
        onboardingCompleted,
        isOnboardingRoute,
        isProtectedRoute
    });

    // 4️⃣ ROUTING LOGIC
    // ─────────────────────────────────────

    // 💰 PAYMENT GATE (Critical: Must be paid before anything else)
    if (paymentStatus !== 'paid') {
        // Allow access to /payment page
        if (isPaymentRoute) {
            return response;
        }
        // Redirect everything else to payment
        console.log('💰 Payment pending - redirecting to /payment');
        return NextResponse.redirect(new URL('/payment', origin));
    }

    // ✅ PAYMENT COMPLETE -> CHECK ONBOARDING

    // If user tries to access payment page but is already paid
    if (isPaymentRoute) {
        // Redirect to onboarding if not done, or dashboard if done
        const target = onboardingCompleted ? '/dashboard' : '/onboarding';
        return NextResponse.redirect(new URL(target, origin));
    }

    // 📝 ONBOARDING GATE
    if (onboardingCompleted) {
        // User finished onboarding
        if (isOnboardingRoute || isAuthRoute) {
            console.log('✅ Onboarding complete - redirecting to dashboard');
            return NextResponse.redirect(new URL('/dashboard', origin));
        }
        return response;
    } else {
        // User NOT finished onboarding
        if (isOnboardingRoute) {
            return response;
        }
        // Redirect protected routes to onboarding
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
