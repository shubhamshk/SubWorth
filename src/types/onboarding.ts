export type ContentType = 'Movies' | 'Web Series' | 'Anime' | 'Documentaries' | 'Reality Shows';

export type Genre =
    | 'Action' | 'Drama' | 'Thriller' | 'Romance' | 'Comedy'
    | 'Sci-Fi' | 'Horror' | 'Fantasy' | 'Crime' | 'Slice of Life';

export type Language =
    | 'English' | 'Hindi' | 'Korean' | 'Japanese' | 'Regional' | 'International';

export type WatchBehavior =
    | 'Binge watch'
    | 'Casual weekends'
    | 'Only trending shows'
    | 'Only specific genres'
    | 'Watch 1-2 shows/month';

export interface FavoriteShow {
    id: string; // Internal ID (can be same as tmdb_id + type)
    tmdb_id: number;
    title: string;
    media_type: 'movie' | 'tv';
    poster_path: string | null;
}

export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface TasteProfile {
    fullName: string | null;
    age: number | null;
    contentTypes: ContentType[];
    genres: Genre[];
    languages: Language[];
    favoriteShows: FavoriteShow[];
    selectedPlatforms: string[]; // IDs of selected platforms
    behavior: WatchBehavior | null;
    confidence: ConfidenceLevel;
    onboardingCompleted: boolean;
    plan?: 'pro' | 'team' | null;
}

export const INITIAL_PROFILE: TasteProfile = {
    fullName: null,
    age: null,
    contentTypes: [],
    genres: [],
    languages: [],
    favoriteShows: [],
    selectedPlatforms: [],
    behavior: null,
    confidence: 'low',
    onboardingCompleted: false,
    plan: null
};
