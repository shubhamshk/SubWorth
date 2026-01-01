'use server';

import { createServerClient } from '@/lib/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

export type VerdictStatus = 'pending' | 'ready';

export interface MonthlyVerdict {
    id: string;
    month: number;
    year: number;
    status: VerdictStatus;
    verdictData: any;
    createdAt: string;
}

export async function getLatestVerdict(): Promise<{ success: boolean; data?: MonthlyVerdict; error?: string }> {
    noStore(); // Don't cache this, we want real-time status
    try {
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { success: false, error: 'Not authenticated' };

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        const { data, error } = await supabase
            .from('monthly_verdicts')
            .select('*')
            .eq('user_id', user.id)
            .eq('month', currentMonth)
            .eq('year', currentYear)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No verdict found for this month yet
                return { success: true, data: undefined };
            }
            console.error('Error fetching verdict:', error);
            return { success: false, error: 'Failed to fetch verdict' };
        }

        return {
            success: true,
            data: {
                id: data.id,
                month: data.month,
                year: data.year,
                status: data.status,
                verdictData: data.verdict_data,
                createdAt: data.created_at
            }
        };
    } catch (err) {
        console.error('Unexpected error fetching verdict:', err);
        return { success: false, error: 'Unexpected error' };
    }
}
