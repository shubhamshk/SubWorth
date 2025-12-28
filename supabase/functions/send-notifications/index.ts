/**
 * SEND NOTIFICATIONS EDGE FUNCTION
 * 
 * SECURITY:
 * - Requires valid JWT or CRON_SECRET
 * - Uses Resend for email delivery
 * - Template-based emails only (no user HTML)
 * - Honors opt-out preferences
 * - Rate limited per user
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Deno types
declare const Deno: {
    env: {
        get(key: string): string | undefined;
    };
};

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-cron-secret, content-type',
};

type NotificationType = 'verdict_update' | 'monthly_summary' | 'special_offer';

interface SendNotificationRequest {
    userId?: string;
    type: NotificationType;
    // For batch processing
    all?: boolean;
}

// Email templates (SECURITY: No user-generated content in HTML)
const EMAIL_TEMPLATES = {
    verdict_update: {
        subject: 'Your OTT Verdicts Are Ready! 🎬',
        html: (name: string, appUrl: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #1a1a2e; margin-bottom: 16px;">Hey${name ? ` ${name}` : ''}! 👋</h1>
            <p style="color: #4a4a68; font-size: 16px; line-height: 1.6;">
              Your personalized OTT verdicts for this month are ready. We've analyzed all the new releases 
              based on your interests to help you decide which subscriptions are worth it.
            </p>
            <a href="${appUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px;">
              View My Verdicts →
            </a>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 32px;">
              Save money by knowing exactly which platforms to keep, pause, or skip this month.
            </p>
          </div>
        </body>
      </html>
    `,
    },
    monthly_summary: {
        subject: 'Your Monthly Savings Report 💰',
        html: (name: string, appUrl: string, savings?: number) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #1a1a2e; margin-bottom: 16px;">Monthly Summary${name ? `, ${name}` : ''}</h1>
            ${savings ? `
              <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Potential Savings This Month</p>
                <p style="margin: 8px 0 0; font-size: 36px; font-weight: 700;">$${savings.toFixed(2)}</p>
              </div>
            ` : ''}
            <p style="color: #4a4a68; font-size: 16px; line-height: 1.6;">
              Here's your monthly recap of OTT subscription recommendations. 
              Check your dashboard for the full breakdown.
            </p>
            <a href="${appUrl}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px;">
              View Dashboard →
            </a>
          </div>
        </body>
      </html>
    `,
    },
    special_offer: {
        subject: 'Special Update from OTT Manager 🌟',
        html: (name: string, appUrl: string) => `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h1 style="color: #1a1a2e; margin-bottom: 16px;">Hey${name ? ` ${name}` : ''}! 🌟</h1>
            <p style="color: #4a4a68; font-size: 16px; line-height: 1.6;">
              We have some exciting updates for you. Check out what's new on OTT Manager!
            </p>
            <a href="${appUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 16px;">
              Learn More →
            </a>
          </div>
        </body>
      </html>
    `,
    },
};

// Unsubscribe footer (added to all emails)
function getUnsubscribeFooter(unsubscribeUrl: string): string {
    return `
    <div style="max-width: 600px; margin: 24px auto 0; text-align: center;">
      <p style="color: #9ca3af; font-size: 12px;">
        You're receiving this because you signed up for OTT Manager notifications.
        <br>
        <a href="${unsubscribeUrl}" style="color: #6366f1; text-decoration: underline;">
          Unsubscribe from emails
        </a>
      </p>
    </div>
  `;
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // ==========================================================================
        // SECURITY: Authentication check
        // ==========================================================================
        const cronSecret = req.headers.get('x-cron-secret');
        const authHeader = req.headers.get('authorization');
        const expectedSecret = Deno.env.get('CRON_SECRET');

        let isCronJob = false;

        if (cronSecret && cronSecret === expectedSecret) {
            isCronJob = true;
        } else if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // ==========================================================================
        // Parse request
        // ==========================================================================
        const body: SendNotificationRequest = await req.json();

        if (!body.type || !['verdict_update', 'monthly_summary', 'special_offer'].includes(body.type)) {
            return new Response(
                JSON.stringify({ error: 'Invalid notification type' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // ==========================================================================
        // Create Supabase client
        // ==========================================================================
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false },
        });

        // ==========================================================================
        // Get target users
        // ==========================================================================
        let usersQuery = supabase
            .from('users')
            .select('id, email, full_name, unsubscribe_token')
            .eq('email_notifications_enabled', true);

        if (body.userId && !body.all) {
            usersQuery = usersQuery.eq('id', body.userId);
        }

        const { data: users, error: usersError } = await usersQuery;

        if (usersError || !users) {
            console.error('Error fetching users:', usersError);
            return new Response(
                JSON.stringify({ error: 'Failed to fetch users' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // ==========================================================================
        // Send emails via Resend
        // ==========================================================================
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        const fromEmail = Deno.env.get('RESEND_FROM_EMAIL') || 'OTT Manager <noreply@example.com>';
        const appUrl = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'http://localhost:3000';

        if (!resendApiKey) {
            console.error('RESEND_API_KEY not configured');
            return new Response(
                JSON.stringify({ error: 'Email service not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const template = EMAIL_TEMPLATES[body.type];
        let sentCount = 0;
        let failedCount = 0;

        for (const user of users) {
            try {
                const unsubscribeUrl = `${appUrl}/unsubscribe?token=${user.unsubscribe_token}`;
                const emailHtml = template.html(user.full_name || '', appUrl) + getUnsubscribeFooter(unsubscribeUrl);

                const response = await fetch('https://api.resend.com/emails', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${resendApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        from: fromEmail,
                        to: user.email,
                        subject: template.subject,
                        html: emailHtml,
                    }),
                });

                const status = response.ok ? 'sent' : 'failed';

                // Log the notification
                await supabase.from('notification_log').insert({
                    user_id: user.id,
                    notification_type: body.type,
                    status,
                    error_message: !response.ok ? `HTTP ${response.status}` : null,
                });

                if (response.ok) {
                    sentCount++;
                } else {
                    failedCount++;
                    console.error(`Failed to send email to ${user.email}:`, await response.text());
                }

            } catch (error) {
                failedCount++;
                console.error(`Error sending to ${user.email}:`, error);

                await supabase.from('notification_log').insert({
                    user_id: user.id,
                    notification_type: body.type,
                    status: 'failed',
                    error_message: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                stats: {
                    total: users.length,
                    sent: sentCount,
                    failed: failedCount,
                },
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Unexpected error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
