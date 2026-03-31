import { notFound } from 'next/navigation';
import { requireUser } from '@/features/auth/guards';
import { EditorShell } from '@/components/worksheets/editor-shell';
import type { WorksheetContent, WorksheetTheme } from '@/types/worksheet';

export default async function WorksheetEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, supabase } = await requireUser();

  const { data: worksheet, error } = await supabase
    .from('worksheets')
    .select('id,title,content_json,theme_json')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !worksheet) return notFound();

  return (
    <EditorShell
      worksheetId={worksheet.id}
      initialContent={worksheet.content_json as WorksheetContent}
      initialTheme={worksheet.theme_json as WorksheetTheme}
    />
  );
}
