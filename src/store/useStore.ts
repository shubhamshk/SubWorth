import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
    interests: string[];
    subscribedPlatforms: string[];
}

interface FilterState {
    searchQuery: string;
    verdictFilter: string | null;
    sortBy: 'score' | 'price' | 'name';
    sortOrder: 'asc' | 'desc';
}

interface AppState {
    // User preferences
    preferences: UserPreferences;
    setInterests: (interests: string[]) => void;
    toggleInterest: (interest: string) => void;
    setSubscribedPlatforms: (platforms: string[]) => void;
    toggleSubscription: (platformId: string) => void;

    // Filter state
    filters: FilterState;
    setSearchQuery: (query: string) => void;
    setVerdictFilter: (verdict: string | null) => void;
    setSortBy: (sortBy: 'score' | 'price' | 'name') => void;
    setSortOrder: (order: 'asc' | 'desc') => void;
    resetFilters: () => void;

    // Theme (separate from ThemeProvider for persistence)
    savedTheme: 'dark' | 'light';
    setSavedTheme: (theme: 'dark' | 'light') => void;
}

const defaultFilters: FilterState = {
    searchQuery: '',
    verdictFilter: null,
    sortBy: 'score',
    sortOrder: 'desc',
};

const defaultPreferences: UserPreferences = {
    interests: ['movies', 'series'],
    subscribedPlatforms: ['1', '2'], // Netflix, Prime by default
};

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            // User preferences
            preferences: defaultPreferences,

            setInterests: (interests) =>
                set((state) => ({
                    preferences: { ...state.preferences, interests },
                })),

            toggleInterest: (interest) =>
                set((state) => ({
                    preferences: {
                        ...state.preferences,
                        interests: state.preferences.interests.includes(interest)
                            ? state.preferences.interests.filter((i) => i !== interest)
                            : [...state.preferences.interests, interest],
                    },
                })),

            setSubscribedPlatforms: (platforms) =>
                set((state) => ({
                    preferences: { ...state.preferences, subscribedPlatforms: platforms },
                })),

            toggleSubscription: (platformId) =>
                set((state) => ({
                    preferences: {
                        ...state.preferences,
                        subscribedPlatforms: state.preferences.subscribedPlatforms.includes(platformId)
                            ? state.preferences.subscribedPlatforms.filter((p) => p !== platformId)
                            : [...state.preferences.subscribedPlatforms, platformId],
                    },
                })),

            // Filter state
            filters: defaultFilters,

            setSearchQuery: (query) =>
                set((state) => ({
                    filters: { ...state.filters, searchQuery: query },
                })),

            setVerdictFilter: (verdict) =>
                set((state) => ({
                    filters: { ...state.filters, verdictFilter: verdict },
                })),

            setSortBy: (sortBy) =>
                set((state) => ({
                    filters: { ...state.filters, sortBy },
                })),

            setSortOrder: (order) =>
                set((state) => ({
                    filters: { ...state.filters, sortOrder: order },
                })),

            resetFilters: () =>
                set(() => ({
                    filters: defaultFilters,
                })),

            // Theme
            savedTheme: 'dark',
            setSavedTheme: (theme) => set({ savedTheme: theme }),
        }),
        {
            name: 'ott-manager-storage',
            partialize: (state) => ({
                preferences: state.preferences,
                savedTheme: state.savedTheme,
            }),
        }
    )
);

export default useStore;
