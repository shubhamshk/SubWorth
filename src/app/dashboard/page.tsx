'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, CreditCard, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { useStore } from '@/lib/store';
import { getSupabaseClient } from '@/lib/supabase/client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { getLatestVerdict, MonthlyVerdict } from '@/app/actions/verdicts';
import { getUserTrackedPlatforms } from '@/app/actions/platforms';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardPage() {
    const { profile, setProfile } = useStore();
    const [verdict, setVerdict] = useState<MonthlyVerdict | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [trackedPlatforms, setTrackedPlatforms] = useState<any[]>([]);

    useEffect(() => {
        async function loadDashboardData() {
            try {
                const supabase = getSupabaseClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data: profileResult } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    const dbProfile = profileResult as any;

                    if (dbProfile) {
                        const loadedProfile = {
                            ...profile,
                            fullName: dbProfile.full_name || undefined,
                            age: dbProfile.age || undefined,
                            ...(dbProfile.taste_profile || {}),
                            onboardingCompleted: dbProfile.onboarding_completed,
                            plan: dbProfile.selected_plan,
                        };
                        if (!loadedProfile.selectedPlatforms) loadedProfile.selectedPlatforms = [];
                        setProfile(loadedProfile);
                    }

                    const verdictRes = await getLatestVerdict();
                    if (verdictRes.success && verdictRes.data) {
                        setVerdict(verdictRes.data);
                    }

                    const platformsRes = await getUserTrackedPlatforms();
                    if (platformsRes.success && platformsRes.data) {
                        setTrackedPlatforms(platformsRes.data);
                    }
                }
            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setIsLoading(false);
            }
        }

        loadDashboardData();
    }, [setProfile]);

    const myPlatforms = useMemo(() => trackedPlatforms, [trackedPlatforms]);

    const planName = profile.plan === 'team' ? 'Team Plan' : 'Pro Plan';
    const planLimit = profile.plan === 'team' ? 50 : 5;

    return (
        <DashboardLayout header={<DashboardHeader profile={profile} />}>
            <div className="min-h-screen pb-20 pt-6 px-4 lg:px-6 max-w-7xl mx-auto space-y-8">

                {/* 1. Plan & Verdict Grid (Restored to Simpler Layout) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Plan Status Card */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <CreditCard className="w-24 h-24" />
                        </div>
                        <h3 className="text-foreground-muted font-medium mb-2">Current Plan</h3>
                        <div className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                            {planName}
                            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full border border-primary/20">Active</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-foreground-muted">Tracking</span>
                                <span className="text-white">{myPlatforms.length} / {planLimit} slots</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-500"
                                    style={{ width: `${(myPlatforms.length / planLimit) * 100}%` }}
                                />
                            </div>
                        </div>

                        {myPlatforms.length >= planLimit && (
                            <button className="mt-6 w-full py-2 rounded-xl border border-white/10 hover:bg-white/5 text-sm transition-colors text-white">
                                Upgrade to Team
                            </button>
                        )}
                    </div>

                    {/* Verdict Banner */}
                    <div className="md:col-span-2 relative group overflow-hidden rounded-3xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/40 to-purple-900/40 opacity-80" />
                        <div className="relative h-full border border-white/10 rounded-3xl p-6 flex flex-col justify-center">

                            <h3 className="text-xl font-bold text-white mb-2 z-10 flex items-center gap-2">
                                {verdict?.status === 'ready' ? "Verdict Ready" : "Analyzing..."}
                                {verdict?.status === 'ready' && <Sparkles className="w-5 h-5 text-yellow-400" />}
                            </h3>

                            <p className="text-foreground-muted max-w-lg mb-6 z-10">
                                {verdict?.status === 'ready'
                                    ? "We've analyzed all your platforms. Check out what to watch, skip, or pause to save money this month."
                                    : "Our team is curating the best picks for your taste profile."}
                            </p>

                            <Link
                                href="/dashboard/verdict"
                                className={`
                                    w-fit px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all z-10
                                    ${verdict?.status === 'ready'
                                        ? 'bg-white text-black hover:bg-gray-100'
                                        : 'bg-white/5 text-white/50 border border-white/5'}
                                `}
                            >
                                {verdict?.status === 'ready' ? 'View Verdict' : 'In Progress'}
                                {verdict?.status === 'ready' && <CheckCircle2 className="w-4 h-4" />}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Tracked Platforms Grid (Enhanced UI as requested) */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Your Platforms</h2>
                        <button className="text-sm text-foreground-muted hover:text-white transition-colors flex items-center gap-2">
                            <Settings className="w-4 h-4" /> Manage
                        </button>
                    </div>

                    {myPlatforms.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {myPlatforms.map((platform, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group relative"
                                >
                                    {/* Enhanced Glass Card UI */}
                                    <div className="relative h-[100px] bg-[#121212] border border-white/10 rounded-2xl p-4 flex items-center gap-4 overflow-hidden transition-all duration-300 hover:border-white/20 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/5">

                                        {/* Logo Box with Gradient Glow */}
                                        <div className={`
                                            relative w-16 h-16 rounded-xl flex items-center justify-center shrink-0 
                                            bg-gradient-to-br ${platform.color || 'from-gray-700 to-gray-800'} 
                                            text-white shadow-lg overflow-hidden group-hover:shadow-primary/20 transition-all
                                        `}>
                                            {typeof platform.logo === 'string' && platform.logo.startsWith('http') ? (
                                                <Image src={platform.logo} alt={platform.name} width={64} height={64} className="object-cover w-full h-full" />
                                            ) : (
                                                <span className="text-xl font-bold relative z-10">{platform.logo}</span>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-lg text-white group-hover:text-primary transition-colors truncate">
                                                {platform.name}
                                            </h4>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                                <span className="text-xs text-green-400/90 font-medium">Tracking Active</span>
                                            </div>
                                        </div>

                                        {/* Subtle Gloss Overlay on Hover */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                    </div>
                                </motion.div>
                            ))}

                            {/* Connect Button */}
                            <Link href="/onboarding?step=platforms" className="h-[100px] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-foreground-muted hover:text-white hover:bg-white/5 transition-all group">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-medium">Connect Platform</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                            <h3 className="text-lg font-semibold text-gray-300">No platforms connected</h3>
                            <p className="text-gray-500 mb-6">Connect your subscriptions to get started.</p>
                            <Link href="/onboarding?step=platforms" className="text-primary hover:underline">Go to settings</Link>
                        </div>
                    )}
                </div>

            </div>
        </DashboardLayout>
    );
}
