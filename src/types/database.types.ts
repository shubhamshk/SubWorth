/**
 * DATABASE TYPES
 * 
 * TypeScript types for Supabase database tables.
 * In production, generate these with: npx supabase gen types typescript
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type VerdictType = 'buy' | 'continue' | 'pause' | 'skip';
export type ContentType = 'movie' | 'series' | 'documentary' | 'live' | 'special';
export type NotificationFrequency = 'daily' | 'weekly' | 'monthly' | 'never';
export type NotificationType = 'verdict_update' | 'monthly_summary' | 'special_offer';
export type NotificationStatus = 'sent' | 'delivered' | 'failed' | 'bounced';

export type Database = {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    auth_id: string;
                    email: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    email_notifications_enabled: boolean;
                    notification_frequency: NotificationFrequency;
                    unsubscribe_token: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    auth_id: string;
                    email: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    email_notifications_enabled?: boolean;
                    notification_frequency?: NotificationFrequency;
                    unsubscribe_token?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    auth_id?: string;
                    email?: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    email_notifications_enabled?: boolean;
                    notification_frequency?: NotificationFrequency;
                    unsubscribe_token?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            ott_platforms: {
                Row: {
                    id: string;
                    name: string;
                    slug: string;
                    logo_url: string | null;
                    color_from: string;
                    color_to: string;
                    monthly_price: number;
                    yearly_price: number | null;
                    currency: string;
                    categories: string[];
                    base_score: number;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    slug: string;
                    logo_url?: string | null;
                    color_from?: string;
                    color_to?: string;
                    monthly_price: number;
                    yearly_price?: number | null;
                    currency?: string;
                    categories?: string[];
                    base_score: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    slug?: string;
                    logo_url?: string | null;
                    color_from?: string;
                    color_to?: string;
                    monthly_price?: number;
                    yearly_price?: number | null;
                    currency?: string;
                    categories?: string[];
                    base_score?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            monthly_releases: {
                Row: {
                    id: string;
                    platform_id: string;
                    title: string;
                    content_type: ContentType;
                    genres: string[];
                    release_date: string;
                    rating: number | null;
                    description: string | null;
                    thumbnail_url: string | null;
                    release_month: number;
                    release_year: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    platform_id: string;
                    title: string;
                    content_type: ContentType;
                    genres?: string[];
                    release_date: string;
                    rating?: number | null;
                    description?: string | null;
                    thumbnail_url?: string | null;
                    release_month: number;
                    release_year: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    platform_id?: string;
                    title?: string;
                    content_type?: ContentType;
                    genres?: string[];
                    release_date?: string;
                    rating?: number | null;
                    description?: string | null;
                    thumbnail_url?: string | null;
                    release_month?: number;
                    release_year?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            user_interests: {
                Row: {
                    id: string;
                    user_id: string;
                    interest: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    interest: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    interest?: string;
                    created_at?: string;
                };
            };

            user_verdicts: {
                Row: {
                    id: string;
                    user_id: string;
                    platform_id: string;
                    verdict: VerdictType;
                    total_score: number;
                    base_score: number;
                    relevance_bonus: number;
                    freshness_bonus: number;
                    value_adjustment: number;
                    event_bonus: number;
                    potential_savings: number;
                    verdict_month: number;
                    verdict_year: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    platform_id: string;
                    verdict: VerdictType;
                    total_score: number;
                    base_score: number;
                    relevance_bonus: number;
                    freshness_bonus: number;
                    value_adjustment: number;
                    event_bonus: number;
                    potential_savings?: number;
                    verdict_month: number;
                    verdict_year: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    platform_id?: string;
                    verdict?: VerdictType;
                    total_score?: number;
                    base_score?: number;
                    relevance_bonus?: number;
                    freshness_bonus?: number;
                    value_adjustment?: number;
                    event_bonus?: number;
                    potential_savings?: number;
                    verdict_month?: number;
                    verdict_year?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            notification_log: {
                Row: {
                    id: string;
                    user_id: string;
                    notification_type: NotificationType;
                    sent_at: string;
                    status: NotificationStatus;
                    error_message: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    notification_type: NotificationType;
                    sent_at?: string;
                    status?: NotificationStatus;
                    error_message?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    notification_type?: NotificationType;
                    sent_at?: string;
                    status?: NotificationStatus;
                    error_message?: string | null;
                    created_at?: string;
                };
            };
            rate_limit_log: {
                Row: {
                    id: string;
                    identifier: string;
                    action: string;
                    attempted_at: string;
                    expires_at: string;
                };
                Insert: {
                    id?: string;
                    identifier: string;
                    action: string;
                    attempted_at?: string;
                    expires_at: string;
                };
                Update: {
                    id?: string;
                    identifier?: string;
                    action?: string;
                    attempted_at?: string;
                    expires_at?: string;
                };
            };
            subscription_plans: {
                Row: {
                    id: string;
                    name: 'FREE' | 'PRO' | 'TEAM';
                    price_monthly: number;
                    price_yearly: number | null;
                    features: Json;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    price_monthly: number;
                    price_yearly?: number | null;
                    features?: Json;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    price_monthly?: number;
                    price_yearly?: number | null;
                    features?: Json;
                    created_at?: string;
                };
            };
            user_subscriptions: {
                Row: {
                    id: string;
                    user_id: string;
                    plan_id: string;
                    status: 'active' | 'cancelled' | 'expired';
                    started_at: string;
                    ends_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    plan_id: string;
                    status: string;
                    started_at?: string;
                    ends_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    plan_id?: string;
                    status?: string;
                    started_at?: string;
                    ends_at?: string | null;
                    created_at?: string;
                };
            };
            feature_flags: {
                Row: {
                    id: string;
                    key: string;
                    description: string | null;
                };
                Insert: {
                    id?: string;
                    key: string;
                    description?: string | null;
                };
                Update: {
                    id?: string;
                    key?: string;
                    description?: string | null;
                };
            };
            plan_features: {
                Row: {
                    id: string;
                    plan_id: string;
                    feature_id: string;
                    enabled: boolean;
                };
                Insert: {
                    id?: string;
                    plan_id: string;
                    feature_id: string;
                    enabled?: boolean;
                };
                Update: {
                    id?: string;
                    plan_id?: string;
                    feature_id?: string;
                    enabled?: boolean;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            get_user_id: {
                Args: Record<string, never>;
                Returns: string;
            };
            calculate_user_verdict: {
                Args: {
                    p_user_id: string;
                    p_platform_id: string;
                    p_verdict_month?: number;
                    p_verdict_year?: number;
                };
                Returns: Database['public']['Tables']['user_verdicts']['Row'];
            };
            recalculate_user_verdicts: {
                Args: {
                    p_user_id: string;
                    p_month?: number;
                    p_year?: number;
                };
                Returns: Database['public']['Tables']['user_verdicts']['Row'][];
            };
            recalculate_all_verdicts: {
                Args: {
                    p_month?: number;
                    p_year?: number;
                };
                Returns: { processed_users: number; processed_verdicts: number }[];
            };
            check_rate_limit: {
                Args: {
                    p_identifier: string;
                    p_action: string;
                    p_max_attempts: number;
                    p_window_minutes: number;
                };
                Returns: boolean;
            };
            cleanup_rate_limits: {
                Args: Record<string, never>;
                Returns: number;
            };
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}

// Application-level types for frontend compatibility
export interface Platform {
    id: string;
    name: string;
    slug: string;
    logo: string;
    color: string;
    monthlyPrice: number;
    yearlyPrice?: number;
    currency: string;
    thisMonthContent: Content[];
    baseScore: number;
    categories: string[];
}

export interface Content {
    id: string;
    title: string;
    type: ContentType;
    genre: string[];
    releaseDate: string;
    rating?: number;
    description: string;
}

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
