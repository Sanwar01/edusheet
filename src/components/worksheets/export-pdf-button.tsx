'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api/client';

export const ExportPdfButton = ({ worksheetId }: { worksheetId: string }) => {
  const [loading, setLoading] = useState(false);

  const exportPdf = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const printWindow = window.open('', '_blank', 'noopener,noreferrer');
      if (!printWindow) {
        throw new Error('Please allow popups to export.');
      }

      const res = await fetch('/api/exports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worksheetId }),
      });

      if (!res.ok) {
        printWindow.close();
        throw new Error(await getApiErrorMessage(res, 'Failed to export PDF.'));
      }

      const payload = (await res.json()) as { html?: string };
      if (!payload.html) {
        printWindow.close();
        throw new Error('Export HTML is missing.');
      }

      printWindow.document.open();
      printWindow.document.write(payload.html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      toast.error('Failed to export PDF', {
        description:
          error instanceof Error ? error.message : 'Unknown error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1">
      <Button variant="outline" onClick={exportPdf} disabled={loading}>
        {loading ? 'Exporting...' : 'Export PDF'}
      </Button>
      <p className="text-xs text-slate-500">Opens print dialog (Save as PDF)</p>
    </div>
  );
};
