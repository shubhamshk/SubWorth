/**
 * PAYMENT PAGE
 * 
 * Purpose: Mandatory payment gate.
 * Features:
 * - Pricing cards (Pro/Team)
 * - PayPal integration
 * - Server-side verification via 'verifyAndRecordPayment'
 */

'use client';

import { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { verifyAndRecordPayment } from '@/app/actions/payment';
import { Check, Shield, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Using Sandbox Client ID (Replace with env var in production)
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';

const PLANS = [
    {
        id: 'pro',
        name: 'Pro',
        price: '9.00',
        features: ['Personalized Dashboard', 'Unlimited Recommendations', 'Priority Support'],
        popular: true
    },
    {
        id: 'team',
        name: 'Team',
        price: '29.00',
        features: ['Everything in Pro', 'Team Collaboration', 'Analytics Dashboard'],
        popular: false
    }
];

export default function PaymentPage() {
    const [selectedPlan, setSelectedPlan] = useState<string>('pro');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleApprove = async (data: any, actions: any) => {
        setIsProcessing(true);
        setError(null);

        try {
            // 1. Capture order on PayPal side
            const order = await actions.order.capture();

            // 2. Verify and Record on Our Server
            const result = await verifyAndRecordPayment(order.id, selectedPlan);

            if (result.success) {
                // 3. Redirect to Onboarding
                router.push('/onboarding');
                router.refresh(); // Ensure middleware picks up new status
            } else {
                setError(result.error || 'Payment verification failed');
            }
        } catch (err) {
            console.error('Payment Error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID }}>
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-background z-0" />
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />

                <div className="z-10 w-full max-w-5xl">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Unlock Your <span className="text-primary">Personalized</span> Analysis
                        </h1>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Join thousands of users who make smarter subscription decisions.
                            Select a plan to continue.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch mb-12">
                        {PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                onClick={() => setSelectedPlan(plan.id)}
                                className={`
                                    relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 w-full md:w-[350px]
                                    ${selectedPlan === plan.id
                                        ? 'border-primary bg-primary/5 shadow-2xl shadow-primary/10 scale-105'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }
                                `}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-black font-bold px-4 py-1 rounded-full text-sm">
                                        MOST POPULAR
                                    </div>
                                )}

                                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-bold">${plan.price}</span>
                                    <span className="text-gray-400">/mo</span>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-300">
                                            <div className={`p-1 rounded-full ${selectedPlan === plan.id ? 'bg-primary/20 text-primary' : 'bg-gray-800'}`}>
                                                <Check className="w-3 h-3" />
                                            </div>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className={`
                                    w-full h-12 flex items-center justify-center rounded-xl font-bold border-2
                                    ${selectedPlan === plan.id ? 'border-primary text-primary' : 'border-gray-700 text-gray-500'}
                                `}>
                                    {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Checkbox Area */}
                    <div className="max-w-md mx-auto bg-white p-6 rounded-xl">
                        {isProcessing ? (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-4" />
                                <p className="text-gray-600 font-medium">Verifying Payment...</p>
                            </div>
                        ) : (
                            <>
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">
                                        {error}
                                    </div>
                                )}

                                <PayPalButtons
                                    style={{ layout: "vertical", shape: "rect" }}
                                    createOrder={(data, actions) => {
                                        return actions.order.create({
                                            purchase_units: [
                                                {
                                                    description: `${PLANS.find(p => p.id === selectedPlan)?.name} Plan`,
                                                    amount: {
                                                        value: PLANS.find(p => p.id === selectedPlan)?.price || '9.00',
                                                        currency_code: "USD"
                                                    },
                                                },
                                            ],
                                            intent: "CAPTURE"
                                        });
                                    }}
                                    onApprove={handleApprove}
                                    onError={(err) => {
                                        console.error('PayPal Frontend Error:', err);
                                        setError('Could not initiate payment. Please try again.');
                                    }}
                                />
                            </>
                        )}

                        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-500">
                            <Shield className="w-3 h-3" />
                            <span>Secure SSL Encrypted Payment</span>
                        </div>
                    </div>
                </div>
            </div>
        </PayPalScriptProvider>
    );
}
