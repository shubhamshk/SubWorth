'use client';

import { motion } from 'framer-motion';
import { PiggyBank, TrendingDown, Wallet, Sparkles } from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface SavingsTrackerProps {
    monthlySavings: number;
    yearlySavings: number;
    subscribedCount: number;
    skippedCount: number;
}

export default function SavingsTracker({
    monthlySavings,
    yearlySavings,
    subscribedCount,
    skippedCount,
}: SavingsTrackerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-6"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-verdict-buy/20 flex items-center justify-center">
                        <PiggyBank className="w-5 h-5 text-verdict-buy" />
                    </div>
                    <div>
                        <h3 className="font-semibold">Your Savings</h3>
                        <p className="text-sm text-foreground-muted">Based on current verdicts</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-verdict-buy text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Optimized</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Monthly savings */}
                <div className="p-4 rounded-xl bg-verdict-buy/10 border border-verdict-buy/20">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="w-4 h-4 text-verdict-buy" />
                        <span className="text-sm text-foreground-muted">Monthly</span>
                    </div>
                    <p className="text-2xl font-bold text-verdict-buy">
                        <AnimatedCounter target={monthlySavings} prefix="₹" />
                    </p>
                </div>

                {/* Yearly savings */}
                <div className="p-4 rounded-xl bg-verdict-buy/10 border border-verdict-buy/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Wallet className="w-4 h-4 text-verdict-buy" />
                        <span className="text-sm text-foreground-muted">Yearly</span>
                    </div>
                    <p className="text-2xl font-bold text-verdict-buy">
                        <AnimatedCounter target={yearlySavings} prefix="₹" />
                    </p>
                </div>

                {/* Active subscriptions */}
                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-sm text-foreground-muted">Subscribed</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                        <AnimatedCounter target={subscribedCount} />
                    </p>
                </div>

                {/* Skipped platforms */}
                <div className="p-4 rounded-xl bg-verdict-skip/10 border border-verdict-skip/20">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-verdict-skip" />
                        <span className="text-sm text-foreground-muted">Skipping</span>
                    </div>
                    <p className="text-2xl font-bold text-verdict-skip">
                        <AnimatedCounter target={skippedCount} />
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
