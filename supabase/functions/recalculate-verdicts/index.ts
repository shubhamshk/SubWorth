/**
 * RECALCULATE VERDICTS EDGE FUNCTION
 * 
 * SECURITY:
 * - Protected by CRON_SECRET header
 * - No public access
 * - Rate limited to 1 per hour
 * - Uses service role for database operations
 * 
 * Usage:
 * - Called by Supabase Cron (pg_cron) on the 1st of each month
 * - Can also be triggered manually by admin with secret header
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Deno types for Edge Functions
declare const Deno: {
    env: {
        get(key: string): string | undefined;
    };
};

// CORS headers for the response
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-cron-secret, content-type',
};

// Rate limit tracking (simple in-memory for Edge Functions)
let lastExecutionTime = 0;
const MIN_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // ==========================================================================
        // SECURITY: Verify CRON_SECRET header
        // ==========================================================================
        const cronSecret = req.headers.get('x-cron-secret');
        const expectedSecret = Deno.env.get('CRON_SECRET');

        if (!expectedSecret) {
            console.error('CRON_SECRET not configured');
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (cronSecret !== expectedSecret) {
            console.warn('Invalid CRON_SECRET attempted');
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // ==========================================================================
        // SECURITY: Rate limit check
        // ==========================================================================
        const now = Date.now();
        if (now - lastExecutionTime < MIN_INTERVAL_MS) {
            const retryAfter = Math.ceil((MIN_INTERVAL_MS - (now - lastExecutionTime)) / 1000);
            return new Response(
                JSON.stringify({
                    error: 'Rate limited',
                    retryAfter
                }),
                {
                    status: 429,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json',
                        'Retry-After': retryAfter.toString()
                    }
                }
            );
        }

        lastExecutionTime = now;

        // ==========================================================================
        // Create Supabase client with service role
        // ==========================================================================
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });

        // ==========================================================================
        // Get current month/year
        // ==========================================================================
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        console.log(`Starting verdict recalculation for ${month}/${year}`);

        // ==========================================================================
        // Call the recalculate_all_verdicts function
        // ==========================================================================
        const { data, error } = await supabase.rpc('recalculate_all_verdicts', {
            p_month: month,
            p_year: year,
        });

        if (error) {
            console.error('Recalculation error:', error);
            return new Response(
                JSON.stringify({ error: 'Recalculation failed', details: error.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const result = data?.[0] || { processed_users: 0, processed_verdicts: 0 };

        console.log(`Recalculation complete: ${result.processed_users} users, ${result.processed_verdicts} verdicts`);

        // ==========================================================================
        // Cleanup expired rate limits
        // ==========================================================================
        await supabase.rpc('cleanup_rate_limits');

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Verdicts recalculated successfully',
                stats: {
                    month,
                    year,
                    processedUsers: result.processed_users,
                    processedVerdicts: result.processed_verdicts,
                    executedAt: new Date().toISOString(),
                },
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('Unexpected error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
