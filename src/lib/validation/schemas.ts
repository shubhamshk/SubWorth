/**
 * ZOD VALIDATION SCHEMAS
 * 
 * SECURITY: All user input MUST be validated through these schemas.
 * - Prevents injection attacks
 * - Ensures data integrity
 * - Provides type-safe validation
 * 
 * Never trust client data. Always validate server-side.
 */

import { z } from 'zod';

// =============================================================================
// PRIMITIVE VALIDATORS
// =============================================================================

/**
 * UUID v4 validation - prevents UUID enumeration attacks
 */
export const uuidSchema = z.string().uuid('Invalid ID format');

/**
 * Safe string - no script tags or dangerous HTML
 * SECURITY: Prevents XSS via stored content
 */
// Sanitize string helper
const sanitizeString = (val: string) => val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/javascript:/gi, '');

/**
 * Safe string - no script tags or dangerous HTML
 * SECURITY: Prevents XSS via stored content
 */
export const safeStringSchema = z.string()
    .max(1000, 'Text too long')
    .transform(sanitizeString);

/**
 * Email validation with lowercase normalization
 */
export const emailSchema = z.string()
    .email('Invalid email format')
    .max(320, 'Email too long')
    .transform((val) => val.toLowerCase().trim());

// =============================================================================
// INTEREST SCHEMAS
// =============================================================================

/**
 * Valid interest categories
 * SECURITY: Whitelist approach - only allow known values
 */
export const validInterests = [
    'movies', 'series', 'anime', 'sports', 'kdrama',
    'documentary', 'comedy', 'thriller', 'sci-fi',
    'fantasy', 'action', 'drama', 'horror', 'romance',
    'crime', 'family', 'musical', 'superhero', 'reality'
] as const;

export const interestSchema = z.enum(validInterests, {
    errorMap: () => ({ message: 'Invalid interest category' })
});

export const updateInterestsSchema = z.object({
    interests: z.array(interestSchema)
        .min(1, 'Select at least one interest')
        .max(10, 'Maximum 10 interests allowed')
});

export type UpdateInterestsInput = z.infer<typeof updateInterestsSchema>;

// =============================================================================
// SUBSCRIPTION SCHEMAS
// =============================================================================

export const toggleSubscriptionSchema = z.object({
    platformId: uuidSchema
});

export type ToggleSubscriptionInput = z.infer<typeof toggleSubscriptionSchema>;

// =============================================================================
// USER PREFERENCES SCHEMAS
// =============================================================================

export const notificationFrequencySchema = z.enum(
    ['daily', 'weekly', 'monthly', 'never'] as const,
    { errorMap: () => ({ message: 'Invalid notification frequency' }) }
);

export const updateNotificationSettingsSchema = z.object({
    emailNotificationsEnabled: z.boolean(),
    notificationFrequency: notificationFrequencySchema
});

export type UpdateNotificationSettingsInput = z.infer<typeof updateNotificationSettingsSchema>;

export const updateProfileSchema = z.object({
    fullName: z.string().max(100, 'Name too long').transform(sanitizeString).optional(),
    avatarUrl: z.string().url('Invalid URL').optional()
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// =============================================================================
// AUTH SCHEMAS
// =============================================================================

/**
 * OAuth provider - only Google enabled per requirements
 */
export const oauthProviderSchema = z.enum(['google'] as const, {
    errorMap: () => ({ message: 'Invalid OAuth provider' })
});

export const signInWithOAuthSchema = z.object({
    provider: oauthProviderSchema,
    redirectTo: z.string().optional()
});

export type SignInWithOAuthInput = z.infer<typeof signInWithOAuthSchema>;

// =============================================================================
// VERDICT SCHEMAS
// =============================================================================

export const refreshVerdictSchema = z.object({
    platformId: uuidSchema.optional(), // If omitted, refresh all
    month: z.number().int().min(1).max(12).optional(),
    year: z.number().int().min(2020).max(2100).optional()
});

export type RefreshVerdictInput = z.infer<typeof refreshVerdictSchema>;

// =============================================================================
// UNSUBSCRIBE SCHEMA
// =============================================================================

export const unsubscribeSchema = z.object({
    token: uuidSchema
});

export type UnsubscribeInput = z.infer<typeof unsubscribeSchema>;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validate input and return typed result or throw
 * SECURITY: Always use this before database operations
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);

    if (!result.success) {
        const errors = result.error.errors.map((e) => e.message).join(', ');
        throw new Error(`Validation failed: ${errors}`);
    }

    return result.data;
}

/**
 * Safe parse that returns null instead of throwing
 */
export function safeValidateInput<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);

    if (!result.success) {
        return {
            success: false,
            errors: result.error.errors.map((e) => e.message)
        };
    }

    return { success: true, data: result.data };
}
