/**
 * PLATFORM DATA SERVER ACTIONS
 * 
 * SECURITY:
 * - Read-only operations (no write access for users)
 * - RLS enforced at database level
 * - Caching for performance
 */

'use server';

import { unstable_cache as cache, revalidateTag } from 'next/cache';
import { createServerClient, requireAuth, createServiceRoleClient } from '@/lib/supabase/server';
import { verdictRateLimiter, resetRateLimit } from '@/lib/security';
import type { Platform, Content, PlatformScore, VerdictType } from '@/types/database.types';

import type { ActionResult } from '@/types';

/**
 * Get all active OTT platforms
 * 
 * Cached for 1 hour since platform data rarely changes
 */
export const getPlatforms = cache(
    async (): Promise<ActionResult<Platform[]>> => {
        try {
            const supabase = (await createServerClient()) as any;

            const { data: platforms, error } = await supabase
                .from('ott_platforms')
                .select('*')
                .eq('is_active', true)
                .order('name');

            if (error) {
                console.error('Get platforms error:', error);
                return { success: false, error: 'Failed to load platforms' };
            }

            // Get current month releases for each platform
            const currentDate = new Date();
            const month = currentDate.getMonth() + 1; // 1-12
            const year = currentDate.getFullYear();

            const { data: releases } = await supabase
                .from('monthly_releases')
                .select('*')
                .eq('release_month', month)
                .eq('release_year', year);

            // Transform to frontend format
            const transformedPlatforms: Platform[] = platforms.map((p: any) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                logo: p.name.charAt(0), // Use first letter as logo fallback
                color: `from-[${p.color_from}] to-[${p.color_to}]`,
                monthlyPrice: Number(p.monthly_price),
                yearlyPrice: p.yearly_price ? Number(p.yearly_price) : undefined,
                currency: p.currency,
                categories: p.categories,
                baseScore: Number(p.base_score),
                thisMonthContent: (releases || [])
                    .filter((r: any) => r.platform_id === p.id)
                    .map((r: any): Content => ({
                        id: r.id,
                        title: r.title,
                        type: r.content_type as Content['type'],
                        genre: r.genres,
                        releaseDate: r.release_date,
                        rating: r.rating ? Number(r.rating) : undefined,
                        description: r.description || ''
                    }))
            }));

            return {
                success: true,
                data: transformedPlatforms
            };
        } catch (error) {
            console.error('Get platforms error:', error);
            return {
                success: false,
                error: 'Failed to load platforms'
            };
        }
    },
    ['platforms'],
    { revalidate: 3600, tags: ['platforms'] } // Cache for 1 hour
);

/**
 * Get monthly releases for current month
 * 
 * Cached for 1 hour
 */
export const getMonthlyReleases = cache(
    async (month?: number, year?: number): Promise<ActionResult<Content[]>> => {
        try {
            const supabase = (await createServerClient()) as any;

            const currentDate = new Date();
            const targetMonth = month || currentDate.getMonth() + 1;
            const targetYear = year || currentDate.getFullYear();

            const { data: releases, error } = await supabase
                .from('monthly_releases')
                .select('*')
                .eq('release_month', targetMonth)
                .eq('release_year', targetYear)
                .order('release_date');

            if (error) {
                console.error('Get releases error:', error);
                return { success: false, error: 'Failed to load releases' };
            }

            const transformedReleases: Content[] = releases.map((r: any) => ({
                id: r.id,
                title: r.title,
                type: r.content_type as Content['type'],
                genre: r.genres,
                releaseDate: r.release_date,
                rating: r.rating ? Number(r.rating) : undefined,
                description: r.description || ''
            }));

            return {
                success: true,
                data: transformedReleases
            };
        } catch (error) {
            console.error('Get releases error:', error);
            return {
                success: false,
                error: 'Failed to load releases'
            };
        }
    },
    ['monthly-releases'],
    { revalidate: 3600, tags: ['releases'] }
);

/**
 * Get user's tracked platforms with full details
 * 
 * Performs a server-side join between user's selected keys (TMDB slugs)
 * and the canonical ott_platforms table.
 */
export async function getUserTrackedPlatforms(): Promise<ActionResult<Platform[]>> {
    try {
        const user = await requireAuth();
        const supabase = (await createServerClient()) as any;

        // 1. Get user's selected platform slugs from profile
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('taste_profile')
            .eq('id', user.id)
            .single();

        // Safe extraction of selectedPlatforms
        const tasteProfile = profile?.taste_profile || {};
        const selectedSlugs: string[] = Array.isArray(tasteProfile.selectedPlatforms)
            ? tasteProfile.selectedPlatforms
            : [];

        if (selectedSlugs.length === 0) {
            return { success: true, data: [] };
        }

        // 2. Fetch platform details for these slugs
        // We use 'in' operator to find matches by slug OR by id (support both formats)
        const { data: platforms, error } = await supabase
            .from('ott_platforms')
            .select('*')
            .eq('is_active', true)
            .or(`slug.in.(${selectedSlugs.map(s => `"${s}"`).join(',')}),id.in.(${selectedSlugs.filter(s => s.length === 36).map(s => `"${s}"`).join(',')})`);

        // Note: The OR query above handles both UUIDs (if stored) and TMDB slugs.
        // Simplified approach if we knew they were only slugs: .in('slug', selectedSlugs)

        if (error) {
            console.error('Get tracked platforms error:', error);
            return { success: false, error: 'Failed to load tracked platforms' };
        }

        // 3. Transform to frontend format
        const transformed: Platform[] = platforms.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            logo: p.logo_url || p.name.charAt(0),
            color: `from-[${p.color_from}] to-[${p.color_to}]`,
            monthlyPrice: Number(p.monthly_price),
            currency: p.currency,
            categories: p.categories,
            baseScore: Number(p.base_score),
            thisMonthContent: [] // Content not strictly needed for the list view, optimized out
        }));

        return { success: true, data: transformed };

    } catch (error) {
        console.error('Get tracked platforms error:', error);
        return { success: false, error: 'Failed to load tracked platforms' };
    }
}

/**
 * Get user's verdicts for current month
 */
export async function getUserVerdicts(): Promise<ActionResult<PlatformScore[]>> {
    try {
        const user = await requireAuth();
        const supabase = (await createServerClient()) as any;

        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Get user record
        const { data: userRecord } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', user.id)
            .single();

        if (!userRecord) {
            return { success: false, error: 'User not found' };
        }

        // Get verdicts (RLS enforced)
        const { data: verdicts, error } = await supabase
            .from('user_verdicts')
            .select('*')
            .eq('user_id', userRecord.id)
            .eq('verdict_month', month)
            .eq('verdict_year', year);

        if (error) {
            console.error('Get verdicts error:', error);
            return { success: false, error: 'Failed to load verdicts' };
        }

        // Transform to frontend format
        const scores: PlatformScore[] = verdicts.map((v: any) => ({
            platformId: v.platform_id,
            totalScore: Number(v.total_score),
            verdict: v.verdict as VerdictType,
            breakdown: {
                baseScore: Number(v.base_score),
                relevanceBonus: Number(v.relevance_bonus),
                freshnessBonus: Number(v.freshness_bonus),
                valueAdjustment: Number(v.value_adjustment),
                eventBonus: Number(v.event_bonus)
            },
            matchedContent: [], // Populated on frontend if needed
            potentialSavings: Number(v.potential_savings)
        }));

        return {
            success: true,
            data: scores
        };
    } catch (error) {
        console.error('Get verdicts error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to load verdicts'
        };
    }
}

/**
 * Refresh user's verdicts (recalculate based on current interests)
 * 
 * SECURITY:
 * - Rate limited to 10 per hour
 * - Uses service role for calculation function
 */
export async function refreshVerdicts(): Promise<ActionResult<PlatformScore[]>> {
    try {
        const user = await requireAuth();

        // Rate limit check
        const rateLimitResult = verdictRateLimiter(user.id);

        if (!rateLimitResult.allowed) {
            return {
                success: false,
                error: `Rate limit exceeded. Try again in ${Math.ceil(rateLimitResult.retryAfter / 60000)} minutes.`
            };
        }

        const supabase = (await createServerClient()) as any;

        // Get user record
        const { data: userRecord } = await supabase
            .from('users')
            .select('id')
            .eq('auth_id', user.id)
            .single();

        if (!userRecord) {
            return { success: false, error: 'User not found' };
        }

        // Use service role client to call the calculation function
        const serviceClient = createServiceRoleClient();

        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        // Call the recalculate function
        const { data, error } = await serviceClient.rpc('recalculate_user_verdicts', {
            p_user_id: userRecord.id,
            p_month: month,
            p_year: year
        });

        if (error) {
            console.error('Recalculate verdicts error:', error);
            return { success: false, error: 'Failed to recalculate verdicts' };
        }

        // Transform results
        const scores: PlatformScore[] = (data || []).map((v: Record<string, unknown>) => ({
            platformId: v.platform_id as string,
            totalScore: Number(v.total_score),
            verdict: v.verdict as VerdictType,
            breakdown: {
                baseScore: Number(v.base_score),
                relevanceBonus: Number(v.relevance_bonus),
                freshnessBonus: Number(v.freshness_bonus),
                valueAdjustment: Number(v.value_adjustment),
                eventBonus: Number(v.event_bonus)
            },
            matchedContent: [],
            potentialSavings: Number(v.potential_savings)
        }));

        return {
            success: true,
            data: scores
        };
    } catch (error) {
        console.error('Refresh verdicts error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to refresh verdicts'
        };
    }
}

/**
 * Get single platform by slug
 */
export async function getPlatformBySlug(slug: string): Promise<ActionResult<Platform | null>> {
    try {
        const supabase = (await createServerClient()) as any;

        const { data: platform, error } = await supabase
            .from('ott_platforms')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return { success: true, data: null };
            }
            console.error('Get platform error:', error);
            return { success: false, error: 'Failed to load platform' };
        }

        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const { data: releases } = await supabase
            .from('monthly_releases')
            .select('*')
            .eq('platform_id', platform.id)
            .eq('release_month', month)
            .eq('release_year', year);

        const transformedPlatform: Platform = {
            id: platform.id,
            name: platform.name,
            slug: platform.slug,
            logo: platform.name.charAt(0),
            color: `from-[${platform.color_from}] to-[${platform.color_to}]`,
            monthlyPrice: Number(platform.monthly_price),
            yearlyPrice: platform.yearly_price ? Number(platform.yearly_price) : undefined,
            currency: platform.currency,
            categories: platform.categories,
            baseScore: Number(platform.base_score),
            thisMonthContent: (releases || []).map((r: any): Content => ({
                id: r.id,
                title: r.title,
                type: r.content_type as Content['type'],
                genre: r.genres,
                releaseDate: r.release_date,
                rating: r.rating ? Number(r.rating) : undefined,
                description: r.description || ''
            }))
        };

        return {
            success: true,
            data: transformedPlatform
        };
    } catch (error) {
        console.error('Get platform error:', error);
        return {
            success: false,
            error: 'Failed to load platform'
        };
    }
}

/**
 * TMDB API Configuration
 */
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/original';

/**
 * Search/List OTT Providers from TMDB
 * 
 * Fetches all providers for a region and filters by query.
 * Uses 'IN' as default region based on user requirements.
 */
export const searchTMDBProviders = cache(
    async (query: string = ''): Promise<ActionResult<any[]>> => {
        try {
            const apiKey = process.env.TMDB_API_KEY;
            if (!apiKey) {
                console.error('TMDB_API_KEY is not set');
                return { success: false, error: 'Service configuration error' };
            }

            // Fetch generic movie providers for India (common market, covers most global ones)
            // We cache this call effectively via Next.js cache
            const response = await fetch(
                `${TMDB_BASE_URL}/watch/providers/movie?api_key=${apiKey}&language=en-US&watch_region=IN`,
                { next: { revalidate: 86400 } } // Cache for 24 hours
            );

            if (!response.ok) {
                console.error('TMDB API Error:', response.status, response.statusText);
                return { success: false, error: 'Failed to fetch providers from TMDB' };
            }

            const data = await response.json();
            const providers = data.results || [];

            // Filter by search query if present
            const filtered = query
                ? providers.filter((p: any) =>
                    p.provider_name.toLowerCase().includes(query.toLowerCase())
                )
                : providers;

            // Sort by priority (display_priority)
            filtered.sort((a: any, b: any) => a.display_priority - b.display_priority);

            // Map to UI format
            const mapped = filtered.map((p: any) => ({
                id: `tmdb-${p.provider_id}`, // Prefix to avoid collision with potential DB UUIDs, or just use ID
                tmdbId: p.provider_id,
                name: p.provider_name,
                logo: p.logo_path ? `${TMDB_IMAGE_URL}${p.logo_path}` : null,
                // Generate a consistent gradient based on name/id hash (simplified)
                color: getConsistentGradient(p.provider_name)
            }));

            return { success: true, data: mapped };

        } catch (error) {
            console.error('Search TMDB providers error:', error);
            return {
                success: false,
                error: 'Failed to load providers'
            };
        }
    },
    ['tmdb-providers'],
    { revalidate: 3600, tags: ['providers'] }
);

// Helper to generate consistent gradients
function getConsistentGradient(str: string): string {
    const gradients = [
        'from-red-600 to-red-900',
        'from-blue-600 to-blue-900',
        'from-green-600 to-green-900',
        'from-purple-600 to-purple-900',
        'from-pink-600 to-pink-900',
        'from-orange-600 to-orange-900',
        'from-indigo-600 to-indigo-900',
        'from-teal-600 to-teal-900',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
}

/**
 * Sync selected platforms from TMDB to DB
 * 
 * Takes a list of IDs (some might be 'tmdb-123').
 * Ensures they exist in ott_platforms table.
 * Returns the corresponding UUIDs.
 */
export async function syncSelectedPlatforms(platformIds: string[]): Promise<ActionResult<string[]>> {
    try {
        const supabase = createServiceRoleClient();
        const resolvedIds: string[] = [];

        for (const id of platformIds) {
            // If it's already a UUID (likely), check if it exists or just pass it
            // Simple heuristic for UUID: length 36 and contains dashes
            if (id.length === 36 && id.includes('-') && !id.startsWith('tmdb-')) {
                resolvedIds.push(id);
                continue;
            }

            if (id.startsWith('tmdb-')) {
                const tmdbId = id.replace('tmdb-', '');
                const slug = `tmdb-${tmdbId}`;

                // Check if exists
                const { data: existing } = await supabase
                    .from('ott_platforms')
                    .select('id')
                    .eq('slug', slug)
                    .single();

                if (existing) {
                    resolvedIds.push(existing.id);
                    continue;
                }

                // Fetch details from TMDB to insert
                // We need provider name and logo
                const apiKey = process.env.TMDB_API_KEY;
                if (!apiKey) continue;

                // We can fetch singular provider? TMDB API doesn't have "get provider details" endpoint easily
                // except via the list we already fetched.
                // Re-fetching full list is inefficient but safe.
                // Better: Client passed the NAME/LOGO? No, we only received IDs.
                // We will fetch the full list again (cached) and find the provider.

                // Note: We use the existing searchTMDBProviders logic but internal
                const response = await fetch(
                    `${TMDB_BASE_URL}/watch/providers/movie?api_key=${apiKey}&language=en-US&watch_region=IN`,
                    { next: { revalidate: 86400 } }
                );

                if (!response.ok) continue;

                const data = await response.json();
                const provider = (data.results || []).find((p: any) => String(p.provider_id) === tmdbId);

                if (provider) {
                    const color = getConsistentGradient(provider.provider_name);
                    const colorFrom = color.split(' ')[0].replace('from-', ''); // rough parsing
                    const colorTo = color.split(' ')[1].replace('to-', '');

                    // Insert new platform
                    const { data: inserted, error: insertError } = await supabase
                        .from('ott_platforms')
                        .insert({
                            name: provider.provider_name,
                            slug: slug,
                            logo_url: provider.logo_path ? `${TMDB_IMAGE_URL}${provider.logo_path}` : null,
                            is_active: true,
                            base_score: 5.0,
                            monthly_price: 0, // Unknown, default to 0
                            categories: ['streaming'],
                            color_from: '#6366f1', // Fallback defaults as gradient parsing is tricky
                            color_to: '#8b5cf6'
                        })
                        .select('id')
                        .single();

                    if (inserted) {
                        resolvedIds.push(inserted.id);
                        revalidateTag('platforms');
                    } else {
                        console.error('Failed to insert platform:', insertError);
                    }
                }
            } else {
                // Unknown format, maybe legacy slug like 'netflix'
                // Try to find by slug
                const { data: existing } = await supabase
                    .from('ott_platforms')
                    .select('id')
                    .eq('slug', id)
                    .single();

                if (existing) {
                    resolvedIds.push(existing.id);
                }
            }
        }

        return { success: true, data: resolvedIds };
    } catch (error) {
        console.error('Sync platforms error:', error);
        return { success: false, error: 'Failed to sync platforms' };
    }
}
