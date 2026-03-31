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
      const res = await fetch('/api/exports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worksheetId }),
      });

      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, 'Failed to export PDF.'));
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const opened = window.open(url, '_blank', 'noopener,noreferrer');
      if (!opened) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${worksheetId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
    <Button variant="outline" onClick={exportPdf} disabled={loading}>
      {loading ? 'Exporting...' : 'Export PDF'}
    </Button>
  );
};
