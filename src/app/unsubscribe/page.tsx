/**
 * UNSUBSCRIBE PAGE
 * 
 * Handles email unsubscribe requests via token.
 * No authentication required (for email links).
 */

import { unsubscribeFromEmails } from '@/app/actions/notifications';
import Link from 'next/link';

interface UnsubscribePageProps {
    searchParams: Promise<{ token?: string }>;
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
    const params = await searchParams;
    const token = params.token;

    let success = false;
    let error: string | null = null;

    if (token) {
        const result = await unsubscribeFromEmails({ token });
        success = result.success;
        error = result.error || null;
    } else {
        error = 'Invalid unsubscribe link';
    }

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-glass rounded-2xl p-8 text-center">
                {success ? (
                    <>
                        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Unsubscribed Successfully</h1>
                        <p className="text-foreground-muted mb-6">
                            You've been removed from our email list. You won't receive any more notifications.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Unsubscribe Failed</h1>
                        <p className="text-foreground-muted mb-6">
                            {error || 'Something went wrong. Please try again or contact support.'}
                        </p>
                    </>
                )}

                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
                >
                    Go to Homepage
                </Link>
            </div>
        </div>
    );
}
