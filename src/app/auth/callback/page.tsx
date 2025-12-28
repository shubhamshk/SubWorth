'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase.auth
      .exchangeCodeForSession(window.location.href)
      .then(({ error }) => {
        if (error) {
          console.error('Auth callback error:', error);
          router.replace('/login');
          return;
        }

        const next = searchParams.get('next') || '/dashboard';
        router.replace(next);
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground">
      Signing you in…
    </div>
  );
}
