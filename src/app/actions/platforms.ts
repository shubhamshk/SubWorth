/**
 * PLATFORM DATA SERVER ACTIONS
 * 
 * SECURITY:
 * - Read-only operations (no write access for users)
 * - RLS enforced at database level
 * - Caching for performance
 */

'use server';

import { unstable_cache as cache } from 'next/cache';
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
