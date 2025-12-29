import { Genre } from '@/types/onboarding';

export interface ThemeVariant {
    primaryGradient: string;
    accentColor: string;
    glowColor: string;
    backgroundColor: string;
}

/**
 * Get theme variant based on user's dominant genre
 * Provides subtle visual mood changes without being overwhelming
 */
export function getThemeVariant(dominantGenre: Genre | undefined): ThemeVariant {
    if (!dominantGenre) {
        return {
            primaryGradient: 'from-primary to-accent',
            accentColor: 'rgb(99, 102, 241)',
            glowColor: 'rgba(99, 102, 241, 0.2)',
            backgroundColor: 'rgb(10, 10, 15)'
        };
    }

    switch (dominantGenre) {
        case 'Action':
            return {
                primaryGradient: 'from-red-500 to-orange-500',
                accentColor: 'rgb(239, 68, 68)',
                glowColor: 'rgba(239, 68, 68, 0.2)',
                backgroundColor: 'rgb(15, 10, 10)'
            };

        case 'Romance':
            return {
                primaryGradient: 'from-pink-500 to-rose-500',
                accentColor: 'rgb(236, 72, 153)',
                glowColor: 'rgba(236, 72, 153, 0.2)',
                backgroundColor: 'rgb(15, 10, 12)'
            };

        case 'Thriller':
            return {
                primaryGradient: 'from-purple-600 to-indigo-600',
                accentColor: 'rgb(124, 58, 237)',
                glowColor: 'rgba(124, 58, 237, 0.2)',
                backgroundColor: 'rgb(8, 8, 15)'
            };

        case 'Comedy':
            return {
                primaryGradient: 'from-yellow-500 to-amber-500',
                accentColor: 'rgb(234, 179, 8)',
                glowColor: 'rgba(234, 179, 8, 0.2)',
                backgroundColor: 'rgb(15, 13, 8)'
            };

        case 'Sci-Fi':
            return {
                primaryGradient: 'from-cyan-500 to-blue-500',
                accentColor: 'rgb(6, 182, 212)',
                glowColor: 'rgba(6, 182, 212, 0.2)',
                backgroundColor: 'rgb(8, 12, 15)'
            };

        case 'Horror':
            return {
                primaryGradient: 'from-red-700 to-gray-900',
                accentColor: 'rgb(185, 28, 28)',
                glowColor: 'rgba(185, 28, 28, 0.2)',
                backgroundColor: 'rgb(10, 8, 8)'
            };

        case 'Fantasy':
            return {
                primaryGradient: 'from-violet-500 to-purple-500',
                accentColor: 'rgb(139, 92, 246)',
                glowColor: 'rgba(139, 92, 246, 0.2)',
                backgroundColor: 'rgb(12, 10, 15)'
            };

        case 'Drama':
            return {
                primaryGradient: 'from-slate-500 to-gray-600',
                accentColor: 'rgb(100, 116, 139)',
                glowColor: 'rgba(100, 116, 139, 0.2)',
                backgroundColor: 'rgb(10, 11, 13)'
            };

        case 'Crime':
            return {
                primaryGradient: 'from-gray-700 to-slate-800',
                accentColor: 'rgb(71, 85, 105)',
                glowColor: 'rgba(71, 85, 105, 0.2)',
                backgroundColor: 'rgb(8, 9, 11)'
            };

        case 'Slice of Life':
            return {
                primaryGradient: 'from-emerald-500 to-teal-500',
                accentColor: 'rgb(16, 185, 129)',
                glowColor: 'rgba(16, 185, 129, 0.2)',
                backgroundColor: 'rgb(8, 15, 12)'
            };

        default:
            return {
                primaryGradient: 'from-primary to-accent',
                accentColor: 'rgb(99, 102, 241)',
                glowColor: 'rgba(99, 102, 241, 0.2)',
                backgroundColor: 'rgb(10, 10, 15)'
            };
    }
}

/**
 * Apply theme variant to document root
 */
export function applyThemeVariant(variant: ThemeVariant) {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.style.setProperty('--theme-accent', variant.accentColor);
    root.style.setProperty('--theme-glow', variant.glowColor);
}
