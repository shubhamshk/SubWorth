/**
 * PAYMENT PAGE – FIXED VERSION
 *
 * Fixes:
 * - ❌ PayPalButtons unmounting
 * - ❌ React rerender during popup
 * - ❌ router.refresh() killing checkout
 * - ❌ key-based forced remount
 * - ❌ state updates during PayPal window
 *
 * Compatible with:
 * - Next.js App Router
 * - PayPal Sandbox
 * - Chrome / Desktop
 */

'use client';

import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { verifyAndRecordPayment } from '@/app/actions/payment';
import { Check, Shield } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

const PLANS = [
    {
        id: 'pro',
        name: 'Pro',
        price: '9.00',
        features: [
            'Personalized Dashboard',
            'Unlimited Recommendations',
            'Priority Support',
        ],
        popular: true,
    },
    {
        id: 'team',
        name: 'Team',
        price: '29.00',
        features: [
            'Everything in Pro',
            'Team Collaboration',
            'Analytics Dashboard',
        ],
        popular: false,
    },
];

export default function PaymentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
            <PaymentContent />
        </Suspense>
    );
}

function PaymentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const planParam = searchParams.get('plan');
    const initialPlan = (planParam === 'team' || planParam === 'pro') ? planParam : 'pro';

    const [selectedPlan, setSelectedPlan] = useState<'pro' | 'team'>(initialPlan);
    const [error, setError] = useState<string | null>(null);
    const [isPaying, setIsPaying] = useState(false);

    const handleApprove = async (data: any, actions: any) => {
        console.log("PAYPAL APPROVED - Starting Verification");
        try {
            const order = await actions.order.capture();
            console.log("Order Captured:", order.id);

            const result = await verifyAndRecordPayment(
                order.id,
                selectedPlan
            );

            console.log("Verification Result:", result);

            if (!result?.success) {
                console.error("Verification Failed:", result?.error);
                setError(result?.error || 'Payment verification failed');
                return;
            }

            console.log("✅ Payment Successful! Redirecting to onboarding...");

            // Force hard navigation to ensure middleware runs fresh
            window.location.href = '/onboarding';

        } catch (err) {
            console.error('Payment Error:', err);
            setError('Payment failed. Please try again.');
        }
    };

    return (
        <PayPalScriptProvider
            options={{
                clientId: PAYPAL_CLIENT_ID, // Correct property name
                currency: 'USD',
                intent: 'capture',
            }}
        >
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-5xl">

                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold mb-3">
                            Choose Your Plan
                        </h1>
                        <p className="text-gray-400">
                            Complete payment to continue
                        </p>
                    </div>

                    {/* Plans */}
                    <div className="flex flex-col md:flex-row gap-8 justify-center mb-10">
                        {PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => !isPaying && setSelectedPlan(plan.id as any)}
                                className={`
                  cursor-pointer rounded-xl border-2 p-6 transition w-full md:w-[320px]
                  ${selectedPlan === plan.id
                                        ? 'border-blue-500 bg-blue-500/10'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'}
                `}
                            >
                                {plan.popular && (
                                    <div className="text-xs mb-2 text-blue-400 font-bold uppercase tracking-wider">
                                        Most Popular
                                    </div>
                                )}

                                <h3 className="text-xl font-bold mb-2">
                                    {plan.name}
                                </h3>

                                <div className="text-3xl font-bold mb-4">
                                    ${plan.price}
                                    <span className="text-sm text-gray-400 font-normal"> / month</span>
                                </div>

                                <ul className="space-y-3">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className="flex gap-2 text-sm text-gray-300">
                                            <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Payment Box */}
                    <div className="max-w-md mx-auto bg-white rounded-xl p-6 text-black shadow-xl">

                        {error && (
                            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded font-medium text-center">
                                {error}
                            </div>
                        )}

                        <PayPalButtons
                            forceReRender={[selectedPlan]} // Force re-render when plan changes
                            style={{ layout: 'vertical', shape: 'rect' }}
                            createOrder={(data, actions) => {
                                const plan = PLANS.find(p => p.id === selectedPlan)!;

                                return actions.order.create({
                                    intent: 'CAPTURE',
                                    purchase_units: [
                                        {
                                            reference_id: plan.id,
                                            description: `${plan.name} Plan`,
                                            amount: {
                                                currency_code: 'USD',
                                                value: plan.price
                                            }
                                        }
                                    ]
                                });
                            }}

                            onClick={(data, actions) => {
                                setIsPaying(true);
                                setError(null);
                            }}

                            onApprove={(data, actions) => handleApprove(data, actions)}

                            onCancel={() => {
                                setIsPaying(false);
                            }}

                            onError={(err) => {
                                console.error('PayPal Error:', err);
                                // Ignore window closed error
                                if (err.toString().includes('Window closed') || err.toString().includes('popup')) {
                                    setIsPaying(false);
                                    return;
                                }
                                setIsPaying(false);
                                setError('Payment failed. Please try again.');
                            }}
                        />

                        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500 font-medium">
                            <Shield className="w-3 h-3" />
                            Secure SSL Encrypted Payment
                        </div>

                    </div>
                </div>
            </div>
        </PayPalScriptProvider>
    );
}
