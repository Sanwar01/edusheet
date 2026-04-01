import { getMonthStartIso, isProPlan } from '@/features/billing/limits';
import type { SupabaseClient } from '@supabase/supabase-js';

type DashboardData = {
  worksheets: Array<{
    id: string;
    title: string;
    subject: string | null;
    grade_level: string | null;
    status: string;
    updated_at: string;
  }>;
  worksheetCount: number;
  generationUsage: string;
  exportUsage: string;
};

export async function getDashboardData({
  supabase,
  userId,
}: {
  supabase: SupabaseClient;
  userId: string;
}): Promise<DashboardData> {
  const monthStart = getMonthStartIso();
  const [subscriptionRes, worksheetsCount, aiMonthCount, exportsMonthCount, worksheetsRes] =
    await Promise.all([
      supabase
        .from('subscriptions')
        .select('plan,status')
        .eq('user_id', userId)
        .maybeSingle(),
      supabase
        .from('worksheets')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId),
      supabase
        .from('ai_generations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', monthStart),
      supabase
        .from('exports')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', monthStart),
      supabase
        .from('worksheets')
        .select('id,title,subject,grade_level,status,updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false }),
    ]);

  const isPro = isProPlan(subscriptionRes.data?.plan, subscriptionRes.data?.status);
  const worksheets = (worksheetsRes.data ?? []).map((worksheet) => ({
    ...worksheet,
    status: worksheet.status ?? 'draft',
  }));

  return {
    worksheets,
    worksheetCount: worksheetsCount.count ?? 0,
    generationUsage: isPro ? '∞' : `${aiMonthCount.count ?? 0}/10`,
    exportUsage: isPro ? '∞' : `${exportsMonthCount.count ?? 0}/5`,
  };
}
