'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, Menu } from 'lucide-react';
import { Sidebar, OTTCard, Filters, SavingsTracker } from '@/components/dashboard';
import platforms from '@/data/platforms';
import { scoreAllPlatforms, calculateTotalSavings } from '@/lib/recommendations';
import { useStore } from '@/store/useStore';

export default function DashboardPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const preferences = useStore((state) => state.preferences);
    const filters = useStore((state) => state.filters);
    const toggleSubscription = useStore((state) => state.toggleSubscription);

    // Calculate scores for all platforms based on user interests
    const platformScores = useMemo(() => {
        return scoreAllPlatforms(platforms, preferences.interests);
    }, [preferences.interests]);

    // Create a map for quick lookup
    const scoreMap = useMemo(() => {
        return new Map(platformScores.map((s) => [s.platformId, s]));
    }, [platformScores]);

    // Filter and sort platforms
    const filteredPlatforms = useMemo(() => {
        let result = [...platforms];

        // Apply search filter
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            result = result.filter(
                (p) =>
                    p.name.toLowerCase().includes(query) ||
                    p.thisMonthContent.some((c) => c.title.toLowerCase().includes(query))
            );
        }

        // Apply verdict filter
        if (filters.verdictFilter) {
            result = result.filter((p) => {
                const score = scoreMap.get(p.id);
                return score?.verdict === filters.verdictFilter;
            });
        }

        // Apply sorting
        result.sort((a, b) => {
            const scoreA = scoreMap.get(a.id);
            const scoreB = scoreMap.get(b.id);
            let comparison = 0;

            switch (filters.sortBy) {
                case 'score':
                    comparison = (scoreB?.totalScore || 0) - (scoreA?.totalScore || 0);
                    break;
                case 'price':
                    comparison = a.monthlyPrice - b.monthlyPrice;
                    break;
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
            }

            return filters.sortOrder === 'asc' ? -comparison : comparison;
        });

        return result;
    }, [platforms, filters, scoreMap]);

    // Calculate savings stats
    const savingsStats = useMemo(() => {
        const totalSavings = calculateTotalSavings(platformScores);
        const subscribedCount = preferences.subscribedPlatforms.length;
        const skippedCount = platformScores.filter(
            (s) => s.verdict === 'skip' || s.verdict === 'pause'
        ).length;

        return {
            monthlySavings: totalSavings,
            yearlySavings: totalSavings * 12,
            subscribedCount,
            skippedCount,
        };
    }, [platformScores, preferences.subscribedPlatforms]);

    // Get current month name
    const currentMonth = new Date().toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile sidebar overlay */}
            {mobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileSidebarOpen(false)}
                />
            )}

            {/* Sidebar - hidden on mobile, shown in overlay */}
            <div className={`
        fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 lg:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            </div>

            {/* Main content */}
            <main
                className={`transition-all duration-300 lg:${sidebarCollapsed ? 'ml-20' : 'ml-64'
                    } ml-0`}
            >
                <div className="p-4 sm:p-6 lg:p-8">
                    {/* Mobile header */}
                    <div className="flex items-center justify-between mb-6 lg:hidden">
                        <button
                            onClick={() => setMobileSidebarOpen(true)}
                            className="p-2 rounded-lg bg-glass hover:bg-glass-hover transition-colors"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <span className="font-bold text-lg">
                            OTT<span className="text-gradient">Manager</span>
                        </span>
                        <div className="w-9" /> {/* Spacer for alignment */}
                    </div>

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 sm:mb-8"
                    >
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                            <span className="text-xs sm:text-sm text-foreground-muted">{currentMonth}</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                            Your OTT Verdicts
                        </h1>
                        <p className="text-sm sm:text-base text-foreground-muted max-w-2xl">
                            Based on your interests, here's what's worth your money this month.
                        </p>
                    </motion.div>

                    {/* Savings tracker */}
                    <SavingsTracker {...savingsStats} />

                    {/* Filters */}
                    <Filters />

                    {/* Platform grid */}
                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {filteredPlatforms.map((platform) => {
                            const score = scoreMap.get(platform.id);
                            if (!score) return null;

                            return (
                                <OTTCard
                                    key={platform.id}
                                    platform={platform}
                                    score={score}
                                    isSubscribed={preferences.subscribedPlatforms.includes(
                                        platform.id
                                    )}
                                    onToggleSubscription={() => toggleSubscription(platform.id)}
                                />
                            );
                        })}
                    </div>

                    {/* Empty state */}
                    {filteredPlatforms.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12 sm:py-16"
                        >
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold mb-2">No platforms match</h3>
                            <p className="text-sm sm:text-base text-foreground-muted">
                                Try adjusting your filters to see more platforms.
                            </p>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}
