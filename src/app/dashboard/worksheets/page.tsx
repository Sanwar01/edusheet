import { requireUser } from '@/features/auth/guards';
import { WorksheetsPageContent } from '@/features/worksheets/components/worksheets-page-content';

export default async function WorksheetsPage() {
  await requireUser();
  return <WorksheetsPageContent />;
}
