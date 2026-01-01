'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Zap, CheckCircle2, ChevronDown, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getLatestVerdict, MonthlyVerdict } from '@/app/actions/verdicts';

export default function VerdictPage() {
    const [verdict, setVerdict] = useState<MonthlyVerdict | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadVerdict() {
            setLoading(true);
            try {
                const res = await getLatestVerdict();
                if (res.success && res.data) {
                    setVerdict(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadVerdict();
    }, []);

    const isReady = verdict?.status === 'ready';

    return (
        <DashboardLayout>
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-xl w-full bg-glass border border-white/10 rounded-3xl p-8 md:p-12 text-center"
                >
                    {isReady ? (
                        <>
                            {/* READY STATE */}
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                January Verdict Ready
                            </h1>

                            <p className="text-lg text-foreground-muted mb-8 leading-relaxed">
                                We've analyzed your platforms. Matches found: <span className="text-white font-bold">12</span>. Potential savings: <span className="text-green-400 font-bold">$24.99</span>.
                            </p>

                            <div className="space-y-4">
                                <Link
                                    href="/dashboard/verdict/details"
                                    className="w-full bg-white text-black hover:bg-gray-200 px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-white/10"
                                >
                                    View Full Breakdown <Zap className="w-4 h-4 fill-current" />
                                </Link>

                                <Link
                                    href="/dashboard"
                                    className="inline-flex items-center gap-2 text-foreground-muted hover:text-white transition-colors font-medium text-sm"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Dashboard
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* PENDING STATE */}
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Clock className="w-10 h-10 text-primary animate-pulse" />
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                Preparing Your Verdict
                            </h1>

                            <p className="text-lg text-foreground-muted mb-8 leading-relaxed">
                                Our models are analyzing this month’s releases for your taste.
                                <br />
                                <span className="text-sm opacity-60 bg-white/5 py-1 px-3 rounded-full mt-2 inline-block">ID: {verdict?.id || 'Processing...'}</span>
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
                                <button disabled className="w-full bg-white/5 text-foreground-muted cursor-wait px-6 py-3 rounded-xl font-bold border border-white/5 flex items-center justify-center gap-2">
                                    <Loader2Spin />
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
                        </>
                    )}
                </motion.div>
            </div>
        </DashboardLayout>
    );
}

function Loader2Spin() {
    return (
        <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    )
}
