'use client';

import { isProPlan } from '@/features/billing/limits';
import { useDashboardData } from '../hooks/use-dashboard-data';
import { useAuth } from '@/context/auth';
import { DashboardHeader } from './dashboard-header';
import { DashboardStatsGrid } from './dashboard-stats-grid';
import { DashboardErrorState } from './dashboard-error-state';
import { WorksheetsListCard } from '@/features/worksheets/components/worksheets-list-card';

type DashboardProfile = {
  plan?: string | null;
  status?: string | null;
} | null;

export function DashboardPageContent({
  profile,
}: {
  profile: DashboardProfile;
}) {
  const { user } = useAuth();
  const {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    goToNextPage,
    goToPreviousPage,
    refetch,
  } = useDashboardData();
  const isPro = isProPlan(profile?.plan, profile?.status);

  if (error) {
    return <DashboardErrorState message={error} />;
  }

  const worksheets = data?.worksheets ?? [];
  const worksheetCount = data?.worksheetCount ?? 0;
  const generationUsage = data?.generationUsage ?? '0/5';
  const exportUsage = data?.exportUsage ?? '0/5';

  return (
    <>
      <DashboardHeader userName={user?.user_metadata.full_name} />
      <DashboardStatsGrid
        loading={loading}
        isPro={isPro}
        plan={profile?.plan}
        worksheetCount={worksheetCount}
        generationUsage={generationUsage}
        exportUsage={exportUsage}
      />
      <WorksheetsListCard
        loading={loading}
        worksheets={worksheets}
        currentPage={currentPage}
        totalPages={totalPages}
        onPreviousPage={goToPreviousPage}
        onNextPage={goToNextPage}
        onWorksheetChanged={refetch}
        title="Recent Worksheets"
      />
    </>
  );
}
