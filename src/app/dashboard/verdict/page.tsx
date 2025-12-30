'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function VerdictPage() {
    return (
        <DashboardLayout>
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl w-full bg-glass border border-white/10 rounded-3xl p-8 md:p-12 text-center"
                >
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-primary animate-pulse" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Preparing Your Verdict
                    </h1>

                    <p className="text-lg text-foreground-muted mb-8 leading-relaxed">
                        Our AI is currently analyzing over <span className="text-white font-bold">15,000+</span> data points from the last 30 days against your taste profile to generate your personalized buy/skip list.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="text-2xl font-bold text-white mb-1">...</div>
                            <div className="text-xs text-foreground-muted uppercase tracking-wider">Content Analyzed</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <div className="text-2xl font-bold text-white mb-1">...</div>
                            <div className="text-xs text-foreground-muted uppercase tracking-wider">Money Saved</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button className="w-full bg-white/5 text-foreground-muted cursor-not-allowed px-6 py-3 rounded-xl font-bold border border-white/5">
                            Analysis in Progress...
                        </button>

                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Intelligence Preview
                        </Link>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
