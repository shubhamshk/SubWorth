'use client';

import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Settings, Filter } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Platform } from '@/data/platforms';
import { useStore } from '@/store/useStore';
import { getSupabaseClient } from '@/lib/supabase/client';
import { TasteProfile } from '@/types/onboarding';
import { getThemeVariant, applyThemeVariant } from '@/lib/themeVariants';
import PlatformSelector from '@/components/dashboard/PlatformSelector';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import InfoStrip from '@/components/dashboard/InfoStrip';
import PlatformPreviewCard from '@/components/dashboard/PlatformPreviewCard';
import { WatchProvider } from '@/app/actions/tmdb';

// Helper to convert TMDB Provider to internal Platform shape
const mapProviderToPlatform = (provider: WatchProvider): Platform => {
    const knownMetadata: Record<number, Partial<Platform>> = {
        8: { color: 'from-red-600 to-black', monthlyPrice: 15.49, currency: '$' }, // Netflix
        119: { color: 'from-blue-500 to-cyan-400', monthlyPrice: 8.99, currency: '$' }, // Prime
        337: { color: 'from-blue-900 to-white', monthlyPrice: 7.99, currency: '$' }, // Disney
        15: { color: 'from-green-500 to-lime-400', monthlyPrice: 9.99, currency: '$' }, // Hulu
        384: { color: 'from-purple-900 to-black', monthlyPrice: 9.99, currency: '$' }, // HBO Max
    };

    const meta = knownMetadata[provider.provider_id] || {
        color: 'from-gray-700 to-gray-900',
        monthlyPrice: 9.99,
        currency: '$'
    };

    return {
        id: provider.provider_id.toString(),
        name: provider.provider_name,
        logo: provider.provider_name.substring(0, 1),
        logoPath: provider.logo_path,
        thisMonthContent: [],
        ...meta
    } as Platform;
};

export default function DashboardPage() {
    const setInterests = useStore((state) => state.setInterests);
    const setTasteProfile = useStore((state) => state.setTasteProfile);
    const tasteProfile = useStore((state) => state.tasteProfile);
    const trackedProviders = useStore((state) => state.trackedProviders);

    const [isSelectorOpen, setIsSelectorOpen] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Auto-open selector if no platforms selected
    useEffect(() => {
        if (!isLoadingProfile && trackedProviders.length === 0) {
            const timer = setTimeout(() => setIsSelectorOpen(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [isLoadingProfile, trackedProviders]);

    // Fetch user profile from Supabase
    useEffect(() => {
        async function fetchUserProfile() {
            try {
                const supabase = getSupabaseClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data: profile } = await supabase
                        .from('user_profiles')
                        .select('user_name, user_age, taste_profile')
                        .eq('id', user.id)
                        .single() as { data: { user_name: string | null; user_age: number | null; taste_profile: any } | null };

                    if (profile && profile.taste_profile) {
                        const loadedProfile: TasteProfile = {
                            ...profile.taste_profile,
                            userName: profile.user_name,
                            userAge: profile.user_age
                        };
                        setTasteProfile(loadedProfile);
                        const interests = [
                            ...(loadedProfile.genres || []),
                            ...(loadedProfile.contentTypes || [])
                        ];
                        setInterests(interests);

                        const dominantGenre = loadedProfile.genres?.[0];
                        const themeVariant = getThemeVariant(dominantGenre);
                        applyThemeVariant(themeVariant);
                    }
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setIsLoadingProfile(false);
            }
        }

        fetchUserProfile();
    }, [setInterests, setTasteProfile]);

    const activePlatforms = useMemo(() => {
        return trackedProviders.map(mapProviderToPlatform);
    }, [trackedProviders]);

    const filteredPlatforms = useMemo(() => {
        if (!searchQuery) return activePlatforms;
        return activePlatforms.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [activePlatforms, searchQuery]);

    return (
        <DashboardLayout header={
            !isLoadingProfile && tasteProfile ? <DashboardHeader profile={tasteProfile} /> : null
        }>
            <div className="min-h-screen pb-20">
                {/* 1. Info Strip (Now top of content) */}
                <InfoStrip />

                {/* 2. Main Content Area */}
                <div className="max-w-7xl mx-auto px-4 lg:px-6 pt-6">

                    {/* Filter / Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search your platforms..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={() => setIsSelectorOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm font-medium whitespace-nowrap"
                            >
                                <Settings className="w-4 h-4 text-gray-400" />
                                Manage Platforms
                            </button>
                        </div>
                    </div>

                    {/* 4. Platform Preview Grid */}
                    <div className="space-y-12">
                        {filteredPlatforms.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2 gap-8">
                                {filteredPlatforms.map(platform => (
                                    <PlatformPreviewCard
                                        key={platform.id}
                                        platform={platform}
                                        tmdbProviderId={parseInt(platform.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                                <Filter className="w-8 h-8 text-gray-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-300">No platforms found</h3>
                                <p className="text-gray-500">Try adjusting your search or add more platforms.</p>
                            </div>
                        )}
                    </div>
                </div>

                <PlatformSelector
                    isOpen={isSelectorOpen}
                    onClose={() => setIsSelectorOpen(false)}
                    isInitialSetup={trackedProviders.length === 0}
                />
            </div>
        </DashboardLayout>
    );
}

