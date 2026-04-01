import { Suspense } from 'react';
import { NewWorksheetFlow } from '@/features/worksheets/components/new-worksheet-flow';

export default function NewWorksheetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <NewWorksheetFlow />
    </Suspense>
  );
}
