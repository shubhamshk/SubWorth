'use server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Types for TMDB responses
export interface TMDBItem {
    id: number;
    title?: string;
    name?: string; // TV shows use 'name'
    poster_path: string | null;
    backdrop_path: string | null;
    media_type?: 'movie' | 'tv';
    overview: string;
    release_date?: string;
    first_air_date?: string;
    vote_average: number;
}

interface TMDBResponse {
    results: TMDBItem[];
    page: number;
    total_pages: number;
}

/**
 * Fetch data from TMDB API
 */
async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
    if (!TMDB_API_KEY) {
        console.warn('⚠️ TMDB_API_KEY is missing!');
        return { results: [] };
    }

    const queryParams = new URLSearchParams({
        api_key: TMDB_API_KEY,
        language: 'en-US',
        include_adult: 'false',
        ...params,
    });

    try {
        const res = await fetch(`${BASE_URL}${endpoint}?${queryParams.toString()}`, {
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!res.ok) {
            console.error(`TMDB Error: ${res.status} ${res.statusText}`);
            return { results: [] };
        }

        return await res.json();
    } catch (error) {
        console.error('TMDB Fetch Error:', error);
        return { results: [] };
    }
}

/**
 * Get Trending Movies & TV Shows (Weekly)
 */
export async function getTrending(): Promise<TMDBItem[]> {
    const data: TMDBResponse = await fetchTMDB('/trending/all/week');
    return data.results || [];
}

/**
 * Get Popular Movies
 */
export async function getPopularMovies(): Promise<TMDBItem[]> {
    const data: TMDBResponse = await fetchTMDB('/movie/popular', { region: 'US' });
    // Map to include media_type manually since endpoint doesn't return it
    return (data.results || []).map(item => ({ ...item, media_type: 'movie' }));
}

/**
 * Get Popular TV Series
 */
export async function getPopularSeries(): Promise<TMDBItem[]> {
    const data: TMDBResponse = await fetchTMDB('/tv/popular', { region: 'US' });
    // Map to include media_type manually since endpoint doesn't return it
    return (data.results || []).map(item => ({ ...item, media_type: 'tv' }));
}

/**
 * Search Multi (Movies + TV)
 */
export async function searchTMDB(query: string): Promise<TMDBItem[]> {
    if (!query) return [];
    const data: TMDBResponse = await fetchTMDB('/search/multi', { query });
    // Filter out 'person' results
    return (data.results || []).filter(item => item.media_type === 'movie' || item.media_type === 'tv');
}
