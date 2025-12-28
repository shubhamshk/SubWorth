/**
 * Recommendation Engine
 * 
 * This module contains the scoring logic for OTT platforms.
 * The algorithm considers user interests, content quality, and value for money.
 * 
 * SCORING RULES:
 * 1. Base score from platform quality (0-10)
 * 2. Content relevance bonus based on user interests (0-3)
 * 3. Content freshness bonus for new releases (0-2)
 * 4. Value-for-money adjustment based on price vs content
 * 5. Special event bonuses (live sports, premieres, etc.)
 * 
 * VERDICT THRESHOLDS:
 * - BUY: Score >= 7.5 - High value, must subscribe
 * - CONTINUE: Score 5.5-7.4 - Keep if already subscribed
 * - PAUSE: Score 4.0-5.4 - Consider pausing, limited value
 * - SKIP: Score < 4.0 - Not worth the money this month
 */

import { Platform, VerdictType, Content } from '@/data/platforms';

export interface PlatformScore {
    platformId: string;
    totalScore: number;
    verdict: VerdictType;
    breakdown: {
        baseScore: number;
        relevanceBonus: number;
        freshnessBonus: number;
        valueAdjustment: number;
        eventBonus: number;
    };
    matchedContent: Content[];
    potentialSavings: number;
}

/**
 * Calculate relevance score based on user interests
 * Max bonus: 3 points
 */
function calculateRelevanceBonus(
    platform: Platform,
    userInterests: string[]
): { bonus: number; matchedContent: Content[] } {
    if (userInterests.length === 0) {
        return { bonus: 0, matchedContent: [] };
    }

    const matchedContent: Content[] = [];
    let relevanceScore = 0;

    platform.thisMonthContent.forEach((content) => {
        const hasMatchingGenre = content.genre.some((g) =>
            userInterests.some((interest) =>
                g.toLowerCase().includes(interest.toLowerCase()) ||
                interest.toLowerCase().includes(g.toLowerCase())
            )
        );

        if (hasMatchingGenre) {
            matchedContent.push(content);
            // Higher rated content gets more weight
            const ratingWeight = (content.rating || 7) / 10;
            relevanceScore += 0.5 * ratingWeight;
        }
    });

    // Cap at 3 points
    const bonus = Math.min(relevanceScore, 3);
    return { bonus, matchedContent };
}

/**
 * Calculate freshness bonus for new releases this month
 * Max bonus: 2 points
 */
function calculateFreshnessBonus(platform: Platform): number {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const freshReleases = platform.thisMonthContent.filter((content) => {
        const releaseDate = new Date(content.releaseDate);
        return (
            releaseDate.getMonth() === thisMonth &&
            releaseDate.getFullYear() === thisYear &&
            releaseDate >= now
        );
    });

    // 0.4 points per upcoming release, capped at 2
    return Math.min(freshReleases.length * 0.4, 2);
}

/**
 * Calculate value adjustment based on price vs content ratio
 * Range: -1 to +1 points
 */
function calculateValueAdjustment(platform: Platform): number {
    const contentCount = platform.thisMonthContent.length;
    const avgRating =
        platform.thisMonthContent.reduce((sum, c) => sum + (c.rating || 7), 0) /
        Math.max(contentCount, 1);

    // Value = (content quality × quantity) / price factor
    const priceFactor = platform.monthlyPrice / 500; // Normalize around ₹500
    const contentValue = (avgRating / 10) * contentCount;
    const valueRatio = contentValue / priceFactor;

    // Convert to -1 to +1 range
    if (valueRatio >= 2) return 1;
    if (valueRatio >= 1) return 0.5;
    if (valueRatio >= 0.5) return 0;
    if (valueRatio >= 0.25) return -0.5;
    return -1;
}

/**
 * Calculate bonus for special events (live sports, premieres)
 * Max bonus: 1 point
 */
function calculateEventBonus(platform: Platform, userInterests: string[]): number {
    let bonus = 0;

    platform.thisMonthContent.forEach((content) => {
        // Live content gets a bonus
        if (content.type === 'live') {
            const isRelevant = content.genre.some((g) =>
                userInterests.some((i) => i.toLowerCase().includes(g.toLowerCase()))
            );
            if (isRelevant) {
                bonus += 0.5;
            }
        }

        // High-rated premieres get a bonus
        if ((content.rating || 0) >= 8.5) {
            bonus += 0.25;
        }
    });

    return Math.min(bonus, 1);
}

/**
 * Determine verdict based on total score
 */
function getVerdict(score: number): VerdictType {
    if (score >= 7.5) return 'buy';
    if (score >= 5.5) return 'continue';
    if (score >= 4.0) return 'pause';
    return 'skip';
}

/**
 * Calculate potential savings if user skips this platform
 */
function calculatePotentialSavings(
    platform: Platform,
    verdict: VerdictType
): number {
    if (verdict === 'skip' || verdict === 'pause') {
        return platform.monthlyPrice;
    }
    return 0;
}

/**
 * Main scoring function
 * Calculates the recommendation score for a platform based on user interests
 */
export function scorePlatform(
    platform: Platform,
    userInterests: string[]
): PlatformScore {
    const { bonus: relevanceBonus, matchedContent } = calculateRelevanceBonus(
        platform,
        userInterests
    );
    const freshnessBonus = calculateFreshnessBonus(platform);
    const valueAdjustment = calculateValueAdjustment(platform);
    const eventBonus = calculateEventBonus(platform, userInterests);

    const totalScore = Math.min(
        10,
        Math.max(
            0,
            platform.baseScore +
            relevanceBonus +
            freshnessBonus +
            valueAdjustment +
            eventBonus
        )
    );

    const verdict = getVerdict(totalScore);
    const potentialSavings = calculatePotentialSavings(platform, verdict);

    return {
        platformId: platform.id,
        totalScore: Math.round(totalScore * 10) / 10,
        verdict,
        breakdown: {
            baseScore: platform.baseScore,
            relevanceBonus: Math.round(relevanceBonus * 10) / 10,
            freshnessBonus: Math.round(freshnessBonus * 10) / 10,
            valueAdjustment: Math.round(valueAdjustment * 10) / 10,
            eventBonus: Math.round(eventBonus * 10) / 10,
        },
        matchedContent,
        potentialSavings,
    };
}

/**
 * Score all platforms for a user
 */
export function scoreAllPlatforms(
    platforms: Platform[],
    userInterests: string[]
): PlatformScore[] {
    return platforms
        .map((platform) => scorePlatform(platform, userInterests))
        .sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Calculate total potential savings
 */
export function calculateTotalSavings(scores: PlatformScore[]): number {
    return scores.reduce((total, score) => total + score.potentialSavings, 0);
}
