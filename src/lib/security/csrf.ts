/**
 * CSRF PROTECTION
 * 
 * SECURITY: Implements Double Submit Cookie pattern.
 * - Generate token stored in HTTP-only cookie
 * - Client includes token in request header
 * - Server validates they match
 * 
 * This protects against Cross-Site Request Forgery attacks.
 */

import { cookies } from 'next/headers';

const CSRF_COOKIE_NAME = '__Host-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
    const array = new Uint8Array(TOKEN_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get or create CSRF token from cookies
 * 
 * SECURITY: Creates token if not exists, returns existing otherwise
 */
export async function getCSRFToken(): Promise<string> {
    const cookieStore = await cookies();
    let token = cookieStore.get(CSRF_COOKIE_NAME)?.value;

    if (!token) {
        token = generateToken();

        // Set HTTP-only, secure, same-site strict cookie
        cookieStore.set(CSRF_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            // Cookie expires in 24 hours
            maxAge: 24 * 60 * 60
        });
    }

    return token;
}

/**
 * Validate CSRF token from request headers
 * 
 * @param headerToken - Token from X-CSRF-Token header
 * @returns true if valid, false otherwise
 * 
 * SECURITY: Always call this before processing mutations
 */
export async function validateCSRFToken(headerToken: string | null): Promise<boolean> {
    if (!headerToken) {
        return false;
    }

    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

    if (!cookieToken) {
        return false;
    }

    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(headerToken, cookieToken);
}

/**
 * Constant-time string comparison
 * SECURITY: Prevents timing attacks by comparing all bytes
 */
function timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}

/**
 * CSRF validation middleware for server actions
 * 
 * Usage:
 * ```
 * const headers = await headers();
 * await requireCSRFToken(headers);
 * // ... rest of server action
 * ```
 */
export async function requireCSRFToken(requestHeaders: Headers): Promise<void> {
    const token = requestHeaders.get(CSRF_HEADER_NAME);
    const isValid = await validateCSRFToken(token);

    if (!isValid) {
        throw new Error('Invalid CSRF token');
    }
}

/**
 * Get CSRF token for client-side usage
 * Export this token to include in mutation requests
 */
export async function getClientCSRFToken(): Promise<string> {
    // For client components, we need a non-httponly version
    // This is safe because the double-submit pattern validates both
    return getCSRFToken();
}
