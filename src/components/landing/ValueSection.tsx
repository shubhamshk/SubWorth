'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

export default function ValueSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    return (
        <section ref={sectionRef} className="py-16 sm:py-24 md:py-32 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] md:w-[800px] h-[200px] sm:h-[300px] md:h-[400px] bg-verdict-buy/10 rounded-full blur-3xl" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-12">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-center">
                    {/* Left - Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6 }}
                        className="space-y-6 sm:space-y-8 text-center lg:text-left"
                    >
                        <div>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
                                You could save{' '}
                                <span className="text-verdict-buy">
                                    <AnimatedCounter target={480} prefix="$" suffix="/year" />
                                </span>
                            </h2>
                            <p className="text-sm sm:text-base md:text-lg text-foreground-muted">
                                The average user overpays for 3 streaming services they barely use.
                            </p>
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.2 }}
                                className="glass-card p-4 sm:p-6"
                            >
                                <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2 sm:mb-3 mx-auto lg:mx-0" />
                                <div className="text-xl sm:text-2xl font-bold mb-1">
                                    <AnimatedCounter target={82} suffix="%" />
                                </div>
                                <p className="text-xs sm:text-sm text-foreground-muted">Average savings rate</p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ delay: 0.3 }}
                                className="glass-card p-4 sm:p-6"
                            >
                                <PiggyBank className="w-6 h-6 sm:w-8 sm:h-8 text-verdict-buy mb-2 sm:mb-3 mx-auto lg:mx-0" />
                                <div className="text-xl sm:text-2xl font-bold mb-1">
                                    <AnimatedCounter target={40} prefix="$" />
                                </div>
                                <p className="text-xs sm:text-sm text-foreground-muted">Monthly avg savings</p>
                            </motion.div>
                        </div>

                        {/* Emotional messaging */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={isInView ? { opacity: 1 } : {}}
                            transition={{ delay: 0.5 }}
                            className="text-lg sm:text-xl font-medium text-foreground"
                        >
                            Pay only when it's <span className="text-gradient">worth it</span>.
                        </motion.p>
                    </motion.div>

                    {/* Right - Graph visualization */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="glass-card p-5 sm:p-6 md:p-8"
                    >
                        <div className="flex items-center justify-between mb-4 sm:mb-6">
                            <h3 className="text-base sm:text-lg font-semibold">Spend Comparison</h3>
                            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-verdict-buy" />
                        </div>

                        {/* Bar chart */}
                        <div className="space-y-4 sm:space-y-6">
                            {/* Regular spend */}
                            <div>
                                <div className="flex justify-between text-xs sm:text-sm mb-2">
                                    <span className="text-foreground-muted">Regular Spend</span>
                                    <span className="font-medium">$75/mo</span>
                                </div>
                                <div className="h-8 sm:h-10 bg-background rounded-lg overflow-hidden relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={isInView ? { width: '100%' } : {}}
                                        transition={{ duration: 1, delay: 0.4 }}
                                        className="h-full bg-gradient-to-r from-verdict-skip/60 to-verdict-skip/40"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-end pr-3 sm:pr-4">
                                        <span className="text-xs sm:text-sm font-medium">All subscriptions</span>
                                    </div>
                                </div>
                            </div>

                            {/* Smart spend */}
                            <div>
                                <div className="flex justify-between text-xs sm:text-sm mb-2">
                                    <span className="text-foreground-muted">Smart Spend</span>
                                    <span className="font-medium text-verdict-buy">$35/mo</span>
                                </div>
                                <div className="h-8 sm:h-10 bg-background rounded-lg overflow-hidden relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={isInView ? { width: '47%' } : {}}
                                        transition={{ duration: 1, delay: 0.6 }}
                                        className="h-full bg-gradient-to-r from-verdict-buy/60 to-verdict-buy/40"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-end pr-3 sm:pr-4">
                                        <span className="text-xs sm:text-sm font-medium">Worth it only</span>
                                    </div>
                                </div>
                            </div>

                            {/* Savings highlight */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                transition={{ delay: 1 }}
                                className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-verdict-buy/10 border border-verdict-buy/20"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs sm:text-sm text-foreground-muted">Monthly Savings</p>
                                        <p className="text-xl sm:text-2xl font-bold text-verdict-buy">$40/mo</p>
                                    </div>
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-verdict-buy/20 flex items-center justify-center">
                                        <span className="text-xs sm:text-sm text-verdict-buy font-bold">53%</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Monthly breakdown */}
                        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-glass-border">
                            <p className="text-[10px] sm:text-xs text-foreground-muted text-center">
                                Based on average user data for December 2024
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
