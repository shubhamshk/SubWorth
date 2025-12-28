import { create } from 'zustand';
import { TasteProfile, INITIAL_PROFILE } from '@/types/onboarding';

interface UserState {
    profile: TasteProfile;
    setProfile: (profile: Partial<TasteProfile>) => void;
    updateConfidence: () => void;
}

export const useStore = create<UserState>((set, get) => ({
    profile: INITIAL_PROFILE,

    setProfile: (updates) =>
        set((state) => ({
            profile: { ...state.profile, ...updates }
        })),

    updateConfidence: () => {
        const { profile } = get();
        let score = 0;

        if (profile.contentTypes.length > 0) score++;
        if (profile.genres.length >= 3) score++;
        if (profile.favoriteShows.length >= 3) score++;
        if (profile.behavior) score++;

        let confidence: 'low' | 'medium' | 'high' = 'low';
        if (score >= 3) confidence = 'medium';
        if (score >= 4) confidence = 'high';

        set((state) => ({
            profile: { ...state.profile, confidence }
        }));
    }
}));
