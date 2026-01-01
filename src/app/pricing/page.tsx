'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, Building2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Navbar, Footer } from '@/components/layout';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

const plans = [
    {
        id: 'pro',
        name: 'Pro',
        description: 'For serious streamers',
        price: 9,
        period: '/month',
        icon: Crown,
        color: 'from-primary to-accent',
        features: [
            'Unlimited platforms',
            'Advanced scoring algorithm',
            'Personalized recommendations',
            'Pause reminders',
            'Yearly savings report',
            'Priority email support',
            'Early access to features',
        ],
        cta: 'Start Subscription',
        popular: true,
    },
    {
        id: 'team',
        name: 'Team',
        description: 'For households & families',
        price: 19,
        period: '/month',
        icon: Building2,
        color: 'from-verdict-buy to-teal-500',
        features: [
            'Everything in Pro',
            'Up to 5 family members',
            'Shared watchlists',
            'Family preferences sync',
            'Household spending insights',
            'Dedicated support',
        ],
        cta: 'Start Subscription',
        popular: false,
    },
];

const faqs = [
    {
        q: 'Can I cancel anytime?',
        a: 'Yes! You can cancel your subscription at any time. No questions asked.',
    },
    {
        q: 'How accurate are the recommendations?',
        a: 'Our algorithm has an 82% accuracy rate based on user feedback and viewing patterns.',
    },
    {
        q: 'Do you support all streaming platforms?',
        a: 'We support 15+ major platforms including Netflix, Prime, Disney+, HBO Max, and more.',
    },
    {
        q: 'Is my data secure?',
        a: 'Absolutely. We use industry-standard encryption and never share your data with third parties.',
    },
];

export default function PricingPage() {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const { handleProtectedClick } = useAuthRedirect();

    const getPrice = (price: number) => {
        if (price === 0) return 0;
        return billingPeriod === 'yearly' ? Math.round(price * 0.8) : price;
    };

    return (
        <>
            <Navbar />
            <main className="pt-24">
                {/* Hero */}
                <section ref={sectionRef} className="py-16 md:py-24 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
                    </div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-12 md:mb-16"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-glass-border mb-6">
                                <Sparkles className="w-4 h-4 text-accent" />
                                <span className="text-sm">Simple, transparent pricing</span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
                                Choose Your <span className="text-gradient">Plan</span>
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl text-foreground-muted max-w-2xl mx-auto px-4">
                                Simple, transparent pricing. Save 20% with yearly billing.
                            </p>

                            {/* Billing toggle */}
                            <div className="flex items-center justify-center gap-4 mt-8">
                                <button
                                    onClick={() => setBillingPeriod('monthly')}
                                    className={`px-4 py-2 rounded-lg transition-colors ${billingPeriod === 'monthly'
                                        ? 'bg-primary text-white'
                                        : 'text-foreground-muted hover:text-foreground'
                                        }`}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => setBillingPeriod('yearly')}
                                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${billingPeriod === 'yearly'
                                        ? 'bg-primary text-white'
                                        : 'text-foreground-muted hover:text-foreground'
                                        }`}
                                >
                                    Yearly
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-verdict-buy/20 text-verdict-buy">
                                        -20%
                                    </span>
                                </button>
                            </div>
                        </motion.div>

                        {/* Pricing cards */}
                        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
                            {plans.map((plan, index) => {
                                const Icon = plan.icon;
                                const price = getPrice(plan.price);

                                return (
                                    <motion.div
                                        key={plan.id}
                                        initial={{ opacity: 0, y: 40 }}
                                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                                        transition={{ duration: 0.5, delay: 0.1 * index }}
                                        className={`
                      relative glass-card p-6 md:p-8 flex flex-col
                      ${plan.popular ? 'border-primary/50 shadow-glow-sm' : ''}
                    `}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-primary text-white text-sm font-medium">
                                                Most Popular
                                            </div>
                                        )}

                                        {/* Header */}
                                        <div className="mb-6">
                                            <div
                                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}
                                            >
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-bold">{plan.name}</h3>
                                            <p className="text-foreground-muted text-sm">{plan.description}</p>
                                        </div>

                                        {/* Price */}
                                        <div className="mb-6">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl md:text-4xl font-bold">
                                                    ${price}
                                                </span>
                                                <span className="text-foreground-muted">
                                                    {plan.period === 'forever' ? '' : plan.period}
                                                </span>
                                            </div>
                                            {billingPeriod === 'yearly' && plan.price > 0 && (
                                                <p className="text-sm text-verdict-buy mt-1">
                                                    Save ${(plan.price - price) * 12}/year
                                                </p>
                                            )}
                                        </div>

                                        {/* Features */}
                                        <ul className="space-y-3 mb-8 flex-1">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm">
                                                    <Check className="w-5 h-5 text-verdict-buy flex-shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* CTA */}
                                        <Button
                                            variant={plan.popular ? 'primary' : 'secondary'}
                                            className="w-full"
                                            glow={plan.popular}
                                            onClick={() => handleProtectedClick(`/payment?plan=${plan.id}`)}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12"
                        >
                            Frequently Asked <span className="text-gradient">Questions</span>
                        </motion.h2>

                        <div className="grid md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
                            {faqs.map((faq, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass-card p-5 md:p-6"
                                >
                                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                                    <p className="text-sm text-foreground-muted">{faq.a}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 md:py-24 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-secondary to-background" />
                    <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center max-w-2xl mx-auto"
                        >
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                                Ready to start saving?
                            </h2>
                            <p className="text-foreground-muted mb-8 px-4">
                                Join thousands of smart streamers who are only paying for content worth watching.
                            </p>
                            <Button size="lg" glow onClick={() => handleProtectedClick('/payment?plan=pro')}>
                                Start Subscription
                            </Button>
                        </motion.div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
