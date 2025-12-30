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
    userName: string | null;
    userAge: number | null;
    contentTypes: ContentType[];
    genres: Genre[];
    languages: Language[];
    favoriteShows: FavoriteShow[];
    behavior: WatchBehavior | null;
    confidence: ConfidenceLevel;
    onboardingCompleted: boolean;
}

export const INITIAL_PROFILE: TasteProfile = {
    userName: null,
    userAge: null,
    contentTypes: [],
    genres: [],
    languages: [],
    favoriteShows: [],
    behavior: null,
    confidence: 'low',
    onboardingCompleted: false
};
