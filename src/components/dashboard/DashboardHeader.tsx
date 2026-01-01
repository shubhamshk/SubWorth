'use client';

import { useMemo } from 'react';
import { TasteProfile } from '@/types/onboarding';
import { Sparkles } from 'lucide-react';

interface DashboardHeaderProps {
    profile: TasteProfile;
}

export default function DashboardHeader({ profile }: DashboardHeaderProps) {
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    }, []);

    const flavorText = useMemo(() => {
        const genres = profile.genres || [];
        const contentTypes = profile.contentTypes || [];

        // Check Content Types first for Anime distinctiveness
        if (contentTypes.includes('Anime')) {
            return "Power-ups, plot twists, and legendary arcs await ⚡";
        }

        // Check Genres
        if (genres.includes('Action') || genres.includes('Crime')) {
            return "Explosions, speed, and adrenaline — your kind of month 🔥";
        }
        if (genres.includes('Romance') || genres.includes('Drama')) {
            return "Love stories and emotional highs are trending for you 💖";
        }
        if (genres.includes('Sci-Fi') || genres.includes('Fantasy')) {
            return "New worlds and epic sagas are calling 🚀";
        }
        if (genres.includes('Horror') || genres.includes('Thriller')) {
            return "Chills, thrills, and suspenseful nights ahead 👻";
        }

        return "Here's what's trending for your unique taste ✨";
    }, [profile.genres, profile.contentTypes]);

    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-white truncate">
                    {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">{profile.fullName}</span>
                </h1>
            </div>
            <p className="text-xs md:text-sm text-foreground-muted flex items-center gap-1.5 truncate">
                <Sparkles className="w-3 h-3 text-yellow-500 shrink-0" />
                {flavorText}
            </p>
        </div>
    );
}

