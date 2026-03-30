import { notFound } from 'next/navigation';
import { requireUser } from '@/features/auth/guards';
import { EditorShell } from '@/components/worksheets/editor-shell';
import { ExportPdfButton } from '@/components/worksheets/export-pdf-button';
import type { WorksheetContent, WorksheetTheme } from '@/types/worksheet';

export default async function WorksheetEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, supabase } = await requireUser();

  const { data: worksheet, error } = await supabase
    .from('worksheets')
    .select('id,content_json,theme_json')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !worksheet) return notFound();

  return (
    <main className='p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Worksheet editor</h1>
        <ExportPdfButton worksheetId={worksheet.id} />
      </div>
      <EditorShell
        worksheetId={worksheet.id}
        initialContent={worksheet.content_json as WorksheetContent}
        initialTheme={worksheet.theme_json as WorksheetTheme}
      />
    </main>
  );
}
