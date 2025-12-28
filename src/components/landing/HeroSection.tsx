'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Play, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { signInWithOAuth } from '@/app/actions/auth';

export default function HeroSection() {
    const [isLoading, setIsLoading] = useState(false);

    const scrollToNext = () => {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    };

    const handleGetStarted = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithOAuth({ provider: 'google' });
            if (result.success && result.redirectUrl) {
                window.location.href = result.redirectUrl;
            } else {
                console.error('OAuth error:', result.error);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Failed to start OAuth:', error);
            setIsLoading(false);
        }
    };

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden">
            {/* Background glow effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-48 sm:w-80 h-48 sm:h-80 bg-accent/15 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-12 py-20">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="flex-1 lg:max-w-[45%] space-y-6 sm:space-y-8 text-center lg:text-left"
                    >
                        {/* Announcement badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full glass border border-glass-border"
                        >
                            <Sparkles className="w-4 h-4 text-accent" />
                            <span className="text-xs sm:text-sm text-foreground-muted">December 2024 verdicts are live</span>
                        </motion.div>

                        {/* Headline */}
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
                            Stop Paying for{' '}
                            <span className="text-gradient">OTT</span>{' '}
                            You Don't Watch.
                        </h1>

                        {/* Subheadline */}
                        <p className="text-base sm:text-lg md:text-xl text-foreground-muted leading-relaxed max-w-lg mx-auto lg:mx-0">
                            We analyze what's coming this month and tell you whether a subscription is worth your money.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                            <Button
                                size="lg"
                                glow
                                className="group w-full sm:w-auto"
                                onClick={handleGetStarted}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                        <span>Connecting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Get Started</span>
                                        <motion.span
                                            className="ml-2"
                                            animate={{ x: [0, 4, 0] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        >
                                            →
                                        </motion.span>
                                    </>
                                )}
                            </Button>
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                                <Play className="w-4 h-4 mr-2" />
                                See How It Works
                            </Button>
                        </div>

                        {/* Social proof */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex items-center gap-4 pt-4 justify-center lg:justify-start"
                        >
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div
                                        key={i}
                                        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-primary to-accent border-2 border-background"
                                    />
                                ))}
                            </div>
                            <p className="text-xs sm:text-sm text-foreground-muted">
                                <span className="text-foreground font-semibold">2,400+</span> users saving money
                            </p>
                        </motion.div>
                    </motion.div>

                    {/* Right Content - Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        className="flex-1 lg:max-w-[55%] relative w-full"
                    >
                        {/* Glassmorphism frame */}
                        <div className="relative glass-card p-3 sm:p-4 md:p-6 glow-effect">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-50" />

                            <div className="relative bg-background-secondary rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                                {/* Mock header */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm sm:text-lg font-semibold">This Month's Verdicts</h3>
                                    <span className="text-xs sm:text-sm text-foreground-muted">December 2024</span>
                                </div>

                                {/* Mock platform cards */}
                                <div className="space-y-2 sm:space-y-3">
                                    {[
                                        { name: 'Netflix', price: '$15.49', verdict: 'buy' as const, score: 8.5 },
                                        { name: 'Prime Video', price: '$8.99', verdict: 'continue' as const, score: 7.2 },
                                        { name: 'Disney+', price: '$13.99', verdict: 'skip' as const, score: 4.1 },
                                    ].map((platform, index) => (
                                        <motion.div
                                            key={platform.name}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 + index * 0.1 }}
                                            className="flex items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-background/50 border border-glass-border hover:border-primary/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                                                    <span className="font-bold text-sm sm:text-lg">{platform.name[0]}</span>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm sm:text-base font-medium">{platform.name}</h4>
                                                    <p className="text-xs sm:text-sm text-foreground-muted">{platform.price}/mo</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <span className="text-xs sm:text-sm font-medium hidden sm:block">{platform.score}/10</span>
                                                <Badge verdict={platform.verdict} size="sm" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Mock summary */}
                                <div className="flex items-center justify-between pt-2 border-t border-glass-border">
                                    <span className="text-xs sm:text-sm text-foreground-muted">Potential savings</span>
                                    <span className="text-base sm:text-lg font-bold text-verdict-buy">$13.99/mo</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements - hidden on small screens */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                            className="absolute -top-4 -right-4 glass-card px-3 py-1.5 sm:px-4 sm:py-2 hidden sm:block"
                        >
                            <span className="text-xs sm:text-sm font-medium text-verdict-buy">↑ 82% accuracy</span>
                        </motion.div>

                        <motion.div
                            animate={{ y: [0, 10, 0] }}
                            transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                            className="absolute -bottom-4 -left-4 glass-card px-3 py-1.5 sm:px-4 sm:py-2 hidden sm:block"
                        >
                            <span className="text-xs sm:text-sm font-medium">Updated 2h ago</span>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.button
                onClick={scrollToNext}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-foreground-muted hover:text-foreground transition-colors"
            >
                <span className="text-xs sm:text-sm">Scroll to explore</span>
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                >
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.div>
            </motion.button>
        </section>
    );
}
