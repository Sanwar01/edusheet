import { getMonthStartIso, isProPlan } from '@/features/billing/limits';
import type { SupabaseClient } from '@supabase/supabase-js';

export type DashboardData = {
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
  page = 1,
  pageSize = 10,
}: {
  supabase: SupabaseClient;
  userId: string;
  page?: number;
  pageSize?: number;
}): Promise<DashboardData> {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const rangeFrom = (safePage - 1) * safePageSize;
  const rangeTo = rangeFrom + safePageSize - 1;
  const monthStart = getMonthStartIso();
  const [
    subscriptionRes,
    worksheetsCount,
    aiMonthCount,
    exportsMonthCount,
    worksheetsRes,
  ] = await Promise.all([
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
      .range(rangeFrom, rangeTo)
      .order('updated_at', { ascending: false }),
  ]);

  const isPro = isProPlan(
    subscriptionRes.data?.plan,
    subscriptionRes.data?.status,
  );
  const worksheets = (worksheetsRes.data ?? []).map((worksheet) => ({
    ...worksheet,
    status: worksheet.status ?? 'draft',
  }));

  return {
    worksheets,
    worksheetCount: worksheetsCount.count ?? 0,
    generationUsage: isPro ? '∞' : `${aiMonthCount.count ?? 0}/5`,
    exportUsage: isPro ? '∞' : `${exportsMonthCount.count ?? 0}/5`,
  };
}
