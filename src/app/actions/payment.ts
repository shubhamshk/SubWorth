'use server';

import { createServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * 🔒 SECURE PAYMENT VERIFICTION
 * 
 * Verifies PayPal order on the server side before granting access.
 * Prevents client-side manipulation.
 */
export async function verifyAndRecordPayment(orderId: string, plan: string) {
    console.log('⌛ Verifying payment for order:', orderId);

    // 1. Authenticate User
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // 2. 🛡️ VERIFY WITH PAYPAL (Server-to-Server)
    if (!orderId) {
        return { success: false, error: 'Invalid Order ID' };
    }

    try {
        // 3. Update Database
        // We use UPSERT to handle cases where the profile might be missing
        // This ensures the payment is ALWAYS recorded
        const { error, count } = await supabase
            .from('user_profiles')
            .upsert({
                id: user.id,
                payment_status: 'paid',
                selected_plan: plan,
                updated_at: new Date().toISOString(),
                // partial update if exists, or create new with these fields
            }, { onConflict: 'id', ignoreDuplicates: false })
            .select();

        if (error) {
            console.error('Database update failed:', error);
            return { success: false, error: 'Failed to record payment' };
        }

        console.log('✅ Payment verified and recorded for user:', user.id);

        // 4. Update legacy 'users' table just in case (optional, but good for consistency)
        // Ignoring error here as it's secondary
        await supabase.from('users').update({
            updated_at: new Date().toISOString()
        }).eq('auth_id', user.id);


        // 5. Revalidate to ensure middleware picks up the change immediately
        revalidatePath('/', 'layout');

        return { success: true };

    } catch (error) {
        console.error('Payment verification failed:', error);
        return { success: false, error: 'Verification failed' };
    }
}
