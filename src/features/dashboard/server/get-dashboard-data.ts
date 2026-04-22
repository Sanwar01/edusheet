import { getMonthStartIso, getPlanLimits, isProPlan } from '@/features/billing/limits';
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
  plan: string;
  status: string | null;
  isPro: boolean;
  generationLimit: number | null;
  exportLimit: number | null;
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
  const limits = getPlanLimits(subscriptionRes.data?.plan, subscriptionRes.data?.status);
  const generationCount = aiMonthCount.count ?? 0;
  const exportCount = exportsMonthCount.count ?? 0;
  const worksheets = (worksheetsRes.data ?? []).map((worksheet) => ({
    ...worksheet,
    status: worksheet.status ?? 'draft',
  }));

  return {
    worksheets,
    worksheetCount: worksheetsCount.count ?? 0,
    plan: subscriptionRes.data?.plan ?? 'free',
    status: subscriptionRes.data?.status ?? null,
    isPro,
    generationLimit: limits.generationsPerMonth,
    exportLimit: limits.exportsPerMonth,
    generationUsage:
      limits.generationsPerMonth === null
        ? String(generationCount)
        : `${generationCount}/${limits.generationsPerMonth}`,
    exportUsage:
      limits.exportsPerMonth === null
        ? String(exportCount)
        : `${exportCount}/${limits.exportsPerMonth}`,
  };
}
