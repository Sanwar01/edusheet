'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function WorksheetRowActions({ worksheetId }: { worksheetId: string }) {
  const router = useRouter();

  async function duplicateWorksheet() {
    await fetch(`/api/worksheets/${worksheetId}/duplicate`, { method: 'POST' });
    router.refresh();
  }

  async function deleteWorksheet() {
    await fetch(`/api/worksheets/${worksheetId}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className='flex gap-2'>
      <Button variant='outline' onClick={duplicateWorksheet}>
        Duplicate
      </Button>
      <Button variant='destructive' onClick={deleteWorksheet}>
        Delete
      </Button>
    </div>
  );
}
