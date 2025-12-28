/**
 * SECURITY HEADERS CONFIGURATION
 * 
 * SECURITY: These headers protect against common web attacks.
 * Apply to all responses via Next.js middleware.
 */

/**
 * Content Security Policy (CSP)
 * Prevents XSS by controlling which resources can be loaded
 */
export function getCSPHeader(nonce?: string): string {
    const directives = [
        // Only allow scripts from same origin and inline with nonce
        `script-src 'self' ${nonce ? `'nonce-${nonce}'` : "'unsafe-inline'"} 'unsafe-eval'`,
        // Only allow styles from same origin
        `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
        // Only allow fonts from same origin and Google Fonts
        `font-src 'self' https://fonts.gstatic.com`,
        // Only allow images from same origin, data URIs, and blob URLs
        `img-src 'self' data: blob: https:`,
        // Connect to self and Supabase
        `connect-src 'self' https://*.supabase.co wss://*.supabase.co`,
        // Only allow forms to submit to self
        `form-action 'self'`,
        // Only allow framing by self
        `frame-ancestors 'self'`,
        // Base URI restriction
        `base-uri 'self'`,
        // Default fallback
        `default-src 'self'`,
        // Upgrade insecure requests in production
        ...(process.env.NODE_ENV === 'production' ? ['upgrade-insecure-requests'] : [])
    ];

    return directives.join('; ');
}

/**
 * Complete security headers object
 */
export const securityHeaders: Record<string, string> = {
    // Prevent clickjacking
    'X-Frame-Options': 'SAMEORIGIN',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Enable browser XSS filter
    'X-XSS-Protection': '1; mode=block',

    // Referrer policy - don't leak URLs to other origins
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Prevent browser features we don't need
    'Permissions-Policy': [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'interest-cohort=()' // Opt out of FLoC
    ].join(', '),

    // HSTS - force HTTPS (only in production)
    ...(process.env.NODE_ENV === 'production' ? {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    } : {})
};

/**
 * Get complete headers including CSP
 */
export function getAllSecurityHeaders(nonce?: string): Record<string, string> {
    return {
        ...securityHeaders,
        'Content-Security-Policy': getCSPHeader(nonce)
    };
}

/**
 * CORS headers configuration
 * 
 * SECURITY: Strict origin whitelist - no wildcards
 */
export function getCORSHeaders(origin: string | null): Record<string, string> {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim());

    // Check if origin is in whitelist
    if (origin && allowedOrigins.includes(origin)) {
        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400' // 24 hours
        };
    }

    // No CORS headers for unknown origins
    return {};
}

/**
 * Apply security headers to a Response object
 */
export function applySecurityHeaders(
    response: Response,
    origin?: string | null
): Response {
    const headers = new Headers(response.headers);

    // Add security headers
    for (const [key, value] of Object.entries(getAllSecurityHeaders())) {
        headers.set(key, value);
    }

    // Add CORS headers if applicable
    if (origin) {
        for (const [key, value] of Object.entries(getCORSHeaders(origin))) {
            headers.set(key, value);
        }
    }

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}
