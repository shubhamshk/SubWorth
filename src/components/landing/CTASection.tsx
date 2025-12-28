'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function CTASection() {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });
    const { handleProtectedClick } = useAuthRedirect();

    return (
        <section ref={sectionRef} className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
            {/* Dark gradient background */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-secondary to-background" />

            {/* Glow effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[200px] sm:h-[300px] md:h-[400px] bg-primary/15 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/3 w-[200px] sm:w-[300px] md:w-[400px] h-[150px] sm:h-[200px] md:h-[300px] bg-accent/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-12 relative">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl mx-auto text-center"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass border border-glass-border mb-6 sm:mb-8"
                    >
                        <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                        <span className="text-xs sm:text-sm">Ready to start saving?</span>
                    </motion.div>

                    {/* Headline */}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-4">
                        Every subscription should{' '}
                        <span className="text-gradient">earn its place</span>.
                    </h2>

                    {/* Subheadline */}
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-foreground-muted mb-8 sm:mb-10 max-w-xl mx-auto px-4">
                        Stop wasting money on streaming services you don't use.
                        Start making informed decisions today.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4">
                        <Button
                            size="lg"
                            glow
                            className="group w-full sm:w-auto min-w-[240px] sm:min-w-[280px]"
                            onClick={() => handleProtectedClick('/dashboard')}
                        >
                            <span>See This Month's OTT Verdict</span>
                            <motion.span
                                className="ml-2"
                                animate={{ x: [0, 4, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                            >
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.span>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto min-w-[140px] sm:min-w-[180px]"
                            onClick={() => handleProtectedClick('/pricing')}
                        >
                            View Pricing
                        </Button>
                    </div>

                    {/* Trust indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.6 }}
                        className="mt-8 sm:mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-foreground-muted"
                    >
                        <span className="flex items-center gap-1.5 sm:gap-2">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-verdict-buy" />
                            No credit card required
                        </span>
                        <span className="flex items-center gap-1.5 sm:gap-2">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-verdict-buy" />
                            Free forever tier
                        </span>
                        <span className="flex items-center gap-1.5 sm:gap-2">
                            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-verdict-buy" />
                            Cancel anytime
                        </span>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
