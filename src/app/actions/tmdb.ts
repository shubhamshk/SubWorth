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

export interface WatchProvider {
    provider_id: number;
    provider_name: string;
    logo_path: string | null;
    display_priority: number;
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

/**
 * Get available OTT Providers (Watch Providers)
 */
export async function getWatchProviders(region = 'US'): Promise<WatchProvider[]> {
    // We'll fetch movie providers as they are generally the same for TV
    const data = await fetchTMDB('/watch/providers/movie', { watch_region: region });
    return (data.results || [])
        .sort((a: WatchProvider, b: WatchProvider) => a.display_priority - b.display_priority)
        .slice(0, 50); // Top 50 providers
}

/**
 * Get Trending/Popular Content for a specific Provider
 * Uses discover endpoint
 */
export async function getContentByProvider(providerId: number, region = 'US'): Promise<{ movies: TMDBItem[], series: TMDBItem[] }> {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const dateGte = thirtyDaysAgo.toISOString().split('T')[0];
    const dateLte = today.toISOString().split('T')[0];

    // Fetch movies
    const moviesData = await fetchTMDB('/discover/movie', {
        with_watch_providers: providerId.toString(),
        watch_region: region,
        sort_by: 'popularity.desc',
        'primary_release_date.gte': dateGte,
        'primary_release_date.lte': dateLte
    });

    // Fetch TV shows
    const tvData = await fetchTMDB('/discover/tv', {
        with_watch_providers: providerId.toString(),
        watch_region: region,
        sort_by: 'popularity.desc',
        'first_air_date.gte': dateGte,
        'first_air_date.lte': dateLte
    });

    const movies = (moviesData.results || [])
        .map((m: any) => ({ ...m, media_type: 'movie' }))
        .slice(0, 5);

    const series = (tvData.results || [])
        .map((s: any) => ({ ...s, media_type: 'tv' }))
        .slice(0, 5);

    return { movies, series };
}
