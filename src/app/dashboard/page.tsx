import { requireUser } from '@/features/auth/guards';
import { DashboardPageContent } from '@/features/dashboard/components/dashboard-page-content';

export default async function DashboardPage() {
  const { profile } = await requireUser();
  return <DashboardPageContent profile={profile} />;
}
