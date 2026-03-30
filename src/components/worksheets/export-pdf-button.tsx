'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ExportPdfButton({ worksheetId }: { worksheetId: string }) {
  const [loading, setLoading] = useState(false);

  async function exportPdf() {
    setLoading(true);
    const res = await fetch('/api/exports/pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ worksheetId }),
    });

    if (!res.ok) {
      setLoading(false);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worksheetId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setLoading(false);
  }

  return (
    <Button variant='outline' onClick={exportPdf} disabled={loading}>
      {loading ? 'Exporting...' : 'Export PDF'}
    </Button>
  );
}
