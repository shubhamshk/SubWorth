'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    TrendingUp,
    PauseCircle,
    CheckCircle2,
    XCircle,
    DollarSign,
    Sparkles,
    Calendar,
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { getLatestVerdict, MonthlyVerdict } from '@/app/actions/verdicts';

// --- Type Definitions based on the JSON structure ---
interface VerdictPlatform {
    name: string;
    action: 'KEEP' | 'PAUSE' | 'CANCEL';
    reason: string;
    cost: number;
}

interface VerdictData {
    summary: string;
    savings: number;
    platforms: VerdictPlatform[];
}

export default function VerdictDetailsPage() {
    const [verdict, setVerdict] = useState<MonthlyVerdict | null>(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<VerdictData | null>(null);

    useEffect(() => {
        async function loadVerdict() {
            try {
                const res = await getLatestVerdict();
                if (res.success && res.data) {
                    setVerdict(res.data);
                    // Safe cast/parsing of the JSONB data
                    if (res.data.verdictData) {
                        setData(res.data.verdictData as VerdictData);
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadVerdict();
    }, []);

    // Helper to get action styles
    const getActionStyle = (action: string) => {
        switch (action) {
            case 'KEEP':
                return {
                    bg: 'bg-green-500/10',
                    border: 'border-green-500/20',
                    text: 'text-green-500',
                    icon: CheckCircle2
                };
            case 'PAUSE':
                return {
                    bg: 'bg-yellow-500/10',
                    border: 'border-yellow-500/20',
                    text: 'text-yellow-500',
                    icon: PauseCircle
                };
            case 'CANCEL':
                return {
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/20',
                    text: 'text-red-500',
                    icon: XCircle
                };
            default:
                return {
                    bg: 'bg-gray-500/10',
                    border: 'border-gray-500/20',
                    text: 'text-gray-400',
                    icon: Sparkles
                };
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!verdict || !data) {
        return (
            <DashboardLayout>
                <div className="max-w-4xl mx-auto pt-10 px-4 text-center">
                    <h2 className="text-xl font-bold mb-4">No Verdict details found</h2>
                    <Link href="/dashboard" className="text-primary hover:underline flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Return to Dashboard
                    </Link>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                {/* Back Link */}
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                {/* Hero Section: Summary & Savings */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {/* Summary Card */}
                    <div className="md:col-span-2 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border border-white/10 rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-30">
                            <Sparkles className="w-24 h-24 text-indigo-500 blur-xl" />
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-medium border border-indigo-500/20">
                                    January Analysis
                                </span>
                                <span className="text-foreground-muted text-sm flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                                {data.summary}
                            </h1>

                            <p className="text-foreground-muted">
                                Based on your configured taste profile and this month's release calendar.
                            </p>
                        </div>
                    </div>

                    {/* Savings Card */}
                    <div className="bg-gradient-to-br from-green-500/10 to-emerald-900/10 border border-green-500/20 rounded-3xl p-8 flex flex-col justify-center relative backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-green-400 mb-2">
                            <TrendingUp className="w-5 h-5" />
                            <span className="font-medium text-sm uppercase tracking-wider">Potential Savings</span>
                        </div>
                        <div className="text-5xl font-bold text-white mb-2 flex items-baseline">
                            <span className="text-2xl text-green-500 mr-1">$</span>
                            {data.savings.toFixed(2)}
                        </div>
                        <p className="text-sm text-green-400/60">
                            Monthly optimization
                        </p>
                    </div>
                </motion.div>


                {/* Detailed Platform List */}
                <div>
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        Platform Decisions <span className="text-sm font-normal text-foreground-muted bg-white/5 py-0.5 px-2 rounded-full">{data.platforms.length}</span>
                    </h3>

                    <div className="grid gap-4">
                        {data.platforms.map((platform, idx) => {
                            const styles = getActionStyle(platform.action);
                            const Icon = styles.icon;

                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-[#121212] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:border-white/10 transition-colors group"
                                >
                                    {/* Action Status (Left) */}
                                    <div className={`
                                        w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0
                                        ${styles.bg} ${styles.text} border ${styles.border}
                                    `}>
                                        <Icon className="w-6 h-6 mb-1" />
                                        <span className="text-[10px] font-bold tracking-wider">{platform.action}</span>
                                    </div>

                                    {/* Content (Middle) */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                                                {platform.name}
                                            </h4>
                                            <div className="md:hidden font-mono text-white font-medium">
                                                ${platform.cost.toFixed(2)}
                                            </div>
                                        </div>
                                        <p className="text-foreground-muted text-sm leading-relaxed">
                                            {platform.reason}
                                        </p>
                                    </div>

                                    {/* Cost (Right) */}
                                    <div className="hidden md:flex flex-col items-end shrink-0 pl-6 border-l border-white/5">
                                        <span className="text-xs text-foreground-muted mb-1">Monthly Cost</span>
                                        <div className="text-xl font-bold text-white font-mono flex items-center">
                                            ${platform.cost.toFixed(2)}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
