/**
 * IN-MEMORY RATE LIMITER
 * 
 * SECURITY: Prevents brute-force and abuse attacks.
 * 
 * LIMITATIONS:
 * - Resets on server restart/redeploy
 * - Not shared across serverless instances
 * - For production scale, upgrade to Redis
 * 
 * This implementation is suitable for:
 * - Development
 * - Small-scale production
 * - Single-instance deployments
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// In-memory store - cleared on restart
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Start cleanup timer
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitStore.entries()) {
            if (entry.resetAt < now) {
                rateLimitStore.delete(key);
            }
        }
    }, CLEANUP_INTERVAL);
}

export interface RateLimitConfig {
    /** Maximum attempts allowed in the window */
    maxAttempts: number;
    /** Window duration in milliseconds */
    windowMs: number;
    /** Custom key prefix (default: 'rate') */
    keyPrefix?: string;
}

export interface RateLimitResult {
    /** Whether the request is allowed */
    allowed: boolean;
    /** Remaining attempts in the current window */
    remaining: number;
    /** When the rate limit resets (Unix timestamp) */
    resetAt: number;
    /** Retry after (milliseconds) - 0 if allowed */
    retryAfter: number;
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
    LOGIN: {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
        keyPrefix: 'login'
    },
    VERDICT_REFRESH: {
        maxAttempts: 10,
        windowMs: 60 * 60 * 1000, // 1 hour
        keyPrefix: 'verdict'
    },
    NOTIFICATION: {
        maxAttempts: 3,
        windowMs: 24 * 60 * 60 * 1000, // 24 hours
        keyPrefix: 'notification'
    },
    API_GENERAL: {
        maxAttempts: 100,
        windowMs: 60 * 1000, // 1 minute
        keyPrefix: 'api'
    }
} as const;

/**
 * Check rate limit for a given identifier and action.
 * 
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 * 
 * SECURITY: Call this BEFORE processing the request
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const key = `${config.keyPrefix || 'rate'}:${identifier}`;
    const now = Date.now();

    let entry = rateLimitStore.get(key);

    // Create new entry if none exists or window has passed
    if (!entry || entry.resetAt < now) {
        entry = {
            count: 0,
            resetAt: now + config.windowMs
        };
    }

    // Check if over limit
    if (entry.count >= config.maxAttempts) {
        return {
            allowed: false,
            remaining: 0,
            resetAt: entry.resetAt,
            retryAfter: entry.resetAt - now
        };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(key, entry);

    return {
        allowed: true,
        remaining: config.maxAttempts - entry.count,
        resetAt: entry.resetAt,
        retryAfter: 0
    };
}

/**
 * Reset rate limit for an identifier (e.g., after successful login)
 */
export function resetRateLimit(identifier: string, keyPrefix: string): void {
    const key = `${keyPrefix}:${identifier}`;
    rateLimitStore.delete(key);
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(result.resetAt / 1000).toString(),
        ...(result.retryAfter > 0 ? {
            'Retry-After': Math.ceil(result.retryAfter / 1000).toString()
        } : {})
    };
}

/**
 * Create a rate limiter function with preset config
 */
export function createRateLimiter(config: RateLimitConfig) {
    return (identifier: string) => checkRateLimit(identifier, config);
}

// Pre-configured limiters
export const loginRateLimiter = createRateLimiter(RATE_LIMITS.LOGIN);
export const verdictRateLimiter = createRateLimiter(RATE_LIMITS.VERDICT_REFRESH);
export const notificationRateLimiter = createRateLimiter(RATE_LIMITS.NOTIFICATION);
export const apiRateLimiter = createRateLimiter(RATE_LIMITS.API_GENERAL);
