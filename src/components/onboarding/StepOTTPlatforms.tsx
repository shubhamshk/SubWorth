'use client';

import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { searchTMDBProviders } from '@/app/actions/platforms';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function StepOTTPlatforms() {
    const { profile, setProfile } = useStore();
    const [allPlatforms, setAllPlatforms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Dynamic plan limit based on profile plan
    const planLimit = profile.plan === 'team' ? 50 : 5;

    useEffect(() => {
        loadPlatforms();
        fetchUserPlan();
    }, []);

    const fetchUserPlan = async () => {
        try {
            const supabase = getSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('user_profiles')
                    .select('selected_plan')
                    .eq('id', user.id)
                    .single();

                if ((data as any)?.selected_plan) {
                    setProfile({ plan: (data as any).selected_plan });
                }
            }
        } catch (error) {
            console.error('Error fetching plan:', error);
        }
    };

    const loadPlatforms = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch all providers for the region (IN by default in action)
            const result = await searchTMDBProviders('');
            if (result.success && result.data) {
                setAllPlatforms(result.data);
            } else {
                setError('Failed to load platforms. Please try again.');
            }
        } catch (err) {
            console.error('Failed to load platforms:', err);
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const togglePlatform = (id: string) => {
        const current = profile.selectedPlatforms || [];

        if (current.includes(id)) {
            setProfile({ selectedPlatforms: current.filter(p => p !== id) });
        } else {
            if (current.length >= planLimit) {
                // Shake animation or toast could trigger here
                return;
            }
            setProfile({ selectedPlatforms: [...current, id] });
        }
    };

    // Filter platforms client-side for instant search
    const filteredPlatforms = useMemo(() => {
        if (!searchQuery.trim()) return allPlatforms;
        return allPlatforms.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allPlatforms, searchQuery]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        show: { opacity: 1, scale: 1 }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="mb-6 space-y-4">
                <div>
                    <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        Choose Your Platforms
                    </h2>
                    <p className="text-white/60">
                        Select the subscriptions you want to track verdicts for.
                    </p>
                </div>

                {/* Glassy Search input */}
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-white/40 group-focus-within:text-primary transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white/10 transition-all duration-300 backdrop-blur-md"
                        placeholder="Search Netflix, Prime, Disney+..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-xl transition-opacity duration-500" />
                </div>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">
                        Top {filteredPlatforms.length} results
                    </span>
                    <span className={`font-medium px-3 py-1 rounded-full border backdrop-blur-sm transition-all duration-300 ${(profile.selectedPlatforms?.length || 0) >= planLimit
                        ? 'bg-red-500/10 border-red-500/30 text-red-200'
                        : 'bg-white/5 border-white/10 text-white/70'
                        }`}>
                        {profile.selectedPlatforms?.length || 0} / {planLimit} selected
                    </span>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="flex flex-col items-center justify-center flex-1 text-center p-6 bg-red-500/10 border border-red-500/20 rounded-2xl mb-4">
                    <AlertCircle className="w-8 h-8 text-red-400 mb-2" />
                    <p className="text-red-200 mb-4">{error}</p>
                    <button
                        onClick={loadPlatforms}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-t-2 border-primary animate-spin" />
                        <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-primary/20" />
                    </div>
                    <p className="text-white/40 animate-pulse">Fetching providers...</p>
                </div>
            ) : (
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 overflow-y-auto pr-2 pb-4 scrollbar-hide min-h-0"
                >
                    <AnimatePresence mode='popLayout'>
                        {filteredPlatforms.map((platform) => {
                            const isSelected = (profile.selectedPlatforms || []).includes(platform.id);
                            const isLimitReached = !isSelected && (profile.selectedPlatforms || []).length >= planLimit;

                            return (
                                <motion.button
                                    key={platform.id}
                                    variants={itemVariants}
                                    layoutId={platform.id}
                                    onClick={() => togglePlatform(platform.id)}
                                    disabled={isLimitReached}
                                    whileHover={!isLimitReached ? { scale: 1.05, y: -2 } : {}}
                                    whileTap={!isLimitReached ? { scale: 0.95 } : {}}
                                    className={`
                                        group relative aspect-square rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-all duration-300
                                        ${isSelected
                                            ? 'bg-gradient-to-br from-white/15 to-white/5 border-primary/50 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                        }
                                        border backdrop-blur-md
                                        ${isLimitReached ? 'opacity-40 grayscale cursor-not-allowed' : 'cursor-pointer'}
                                    `}
                                >
                                    {/* Selection Glow Background */}
                                    {isSelected && (
                                        <div className={`absolute inset-0 bg-gradient-to-br ${platform.color} opacity-20 rounded-2xl`} />
                                    )}

                                    {/* Logo Container */}
                                    <div className={`
                                        relative w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shadow-2xl transition-transform duration-300
                                        ${isSelected ? 'scale-110' : 'group-hover:scale-110'}
                                    `}>
                                        {platform.logo ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img
                                                src={platform.logo}
                                                alt={platform.name}
                                                className="w-full h-full object-cover rounded-xl shadow-inner"
                                            />
                                        ) : (
                                            <div className={`w-full h-full rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white`}>
                                                {platform.name.charAt(0)}
                                            </div>
                                        )}

                                        {/* Status Dot */}
                                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0a0a0f] transition-all duration-300 ${isSelected ? 'bg-green-500 scale-100' : 'bg-transparent scale-0'}`} />
                                    </div>

                                    <span className="font-medium text-xs text-center text-white/90 line-clamp-2 px-1 z-10">
                                        {platform.name}
                                    </span>

                                    {/* Selected Checkmark Overlay */}
                                    <div className={`
                                        absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg transform transition-all duration-300
                                        ${isSelected ? 'scale-100 opacity-100 rotate-0' : 'scale-50 opacity-0 -rotate-90'}
                                    `}>
                                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                    </div>
                                </motion.button>
                            );
                        })}
                    </AnimatePresence>

                    {filteredPlatforms.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-white/40">
                            <Search className="w-12 h-12 mb-4 opacity-20" />
                            <p>No platforms found matching &quot;{searchQuery}&quot;</p>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Limit Warning Toast */}
            <AnimatePresence>
                {(profile.selectedPlatforms?.length || 0) >= planLimit && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-transparent border border-orange-500/20 flex items-center gap-3 backdrop-blur-md"
                    >
                        <div className="p-2 rounded-full bg-orange-500/20 text-orange-400">
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-orange-200">Plan limit reached</p>
                            <p className="text-xs text-orange-200/60">Upgrade to Team plan to track more platforms.</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
