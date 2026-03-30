import Link from 'next/link';
import { requireUser } from '@/features/auth/guards';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WorksheetRowActions } from '@/components/worksheets/worksheet-row-actions';

export default async function WorksheetsPage() {
  const { user, supabase } = await requireUser();

  const { data: worksheets } = await supabase
    .from('worksheets')
    .select('id,title,subject,grade_level,updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  return (
    <main className='space-y-4 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>Worksheets</h1>
        <Button asChild>
          <Link href='/dashboard/worksheets/new'>New worksheet</Link>
        </Button>
      </div>

      <div className='space-y-3'>
        {worksheets?.map((worksheet) => (
          <Card key={worksheet.id} className='flex items-center justify-between'>
            <div>
              <h2 className='font-semibold'>{worksheet.title}</h2>
              <p className='text-sm text-slate-600'>
                {worksheet.subject} • {worksheet.grade_level}
              </p>
            </div>
            <div className='flex gap-2'>
              <Button asChild variant='outline'>
                <Link href={`/dashboard/worksheets/${worksheet.id}/edit`}>Edit</Link>
              </Button>
              <WorksheetRowActions worksheetId={worksheet.id} />
            </div>
          </Card>
        ))}
      </div>
    </main>
  );
}
