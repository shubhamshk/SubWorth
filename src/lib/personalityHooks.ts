import { TasteProfile, Genre, ContentType } from '@/types/onboarding';

export interface PersonalityHook {
    line: string;
    tone: 'bold' | 'warm' | 'intelligent' | 'playful' | 'passionate' | 'curious';
}

/**
 * Generate a personality hook line based on user's dominant preferences
 * This creates an emotionally engaging sentence that makes users feel understood
 */
export function generatePersonalityHook(profile: TasteProfile): PersonalityHook {
    // Determine dominant genre
    const dominantGenre = profile.genres[0];

    // Determine dominant content type
    const dominantContent = profile.contentTypes[0];

    // Genre-based hooks (priority)
    if (dominantGenre) {
        switch (dominantGenre) {
            case 'Action':
                return {
                    line: "You live for the adrenaline rush",
                    tone: 'bold'
                };
            case 'Romance':
                return {
                    line: "You believe in the power of connection",
                    tone: 'warm'
                };
            case 'Thriller':
                return {
                    line: "You love unraveling mysteries",
                    tone: 'intelligent'
                };
            case 'Comedy':
                return {
                    line: "Laughter is your love language",
                    tone: 'playful'
                };
            case 'Sci-Fi':
                return {
                    line: "You're fascinated by what's possible",
                    tone: 'curious'
                };
            case 'Horror':
                return {
                    line: "You embrace the thrill of fear",
                    tone: 'bold'
                };
            case 'Fantasy':
                return {
                    line: "You believe in magic and wonder",
                    tone: 'passionate'
                };
            case 'Drama':
                return {
                    line: "You appreciate stories that move you",
                    tone: 'warm'
                };
            case 'Crime':
                return {
                    line: "You're drawn to the darker side of human nature",
                    tone: 'intelligent'
                };
            case 'Slice of Life':
                return {
                    line: "You find beauty in everyday moments",
                    tone: 'warm'
                };
        }
    }

    // Content-type based hooks (fallback)
    if (dominantContent) {
        switch (dominantContent) {
            case 'Anime':
                return {
                    line: "You appreciate art that tells bold stories",
                    tone: 'passionate'
                };
            case 'Documentaries':
                return {
                    line: "You're curious about the real world",
                    tone: 'curious'
                };
            case 'Reality Shows':
                return {
                    line: "You love watching real human drama unfold",
                    tone: 'playful'
                };
            case 'Web Series':
                return {
                    line: "You're always ahead of the curve",
                    tone: 'curious'
                };
            case 'Movies':
                return {
                    line: "You appreciate cinematic storytelling",
                    tone: 'passionate'
                };
        }
    }

    // Default hook
    return {
        line: "You have unique taste in entertainment",
        tone: 'warm'
    };
}

/**
 * Get a personalized greeting based on time of day and user name
 */
export function getPersonalizedGreeting(fullName: string | null): string {
    const hour = new Date().getHours();
    const name = fullName || 'there';

    if (hour < 12) {
        return `Good morning, ${name}`;
    } else if (hour < 18) {
        return `Good afternoon, ${name}`;
    } else {
        return `Good evening, ${name}`;
    }
}

/**
 * Generate age-appropriate tone modifier
 */
export function getAgeAppropriateModifier(age: number | null): 'casual' | 'professional' | 'friendly' {
    if (!age) return 'friendly';

    if (age < 25) return 'casual';
    if (age < 45) return 'friendly';
    return 'professional';
}
