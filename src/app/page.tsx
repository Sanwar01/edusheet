import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main>
      <section className='mx-auto max-w-6xl px-6 py-20'>
        <h1 className='text-5xl font-bold tracking-tight'>Build classroom-ready worksheets in minutes.</h1>
        <p className='mt-4 max-w-2xl text-lg text-slate-600'>
          EduSheet AI helps teachers generate worksheet drafts with AI, then fully customize every detail in a practical visual editor.
        </p>
        <div className='mt-8 flex gap-3'>
          <Button asChild>
            <Link href='/sign-up'>Start free</Link>
          </Button>
          <Button asChild variant='outline'>
            <Link href='/pricing'>View pricing</Link>
          </Button>
        </div>
      </section>

      <section className='mx-auto grid max-w-6xl gap-4 px-6 pb-16 md:grid-cols-3'>
        <div className='rounded-lg border bg-white p-4'>AI generates structured worksheet drafts</div>
        <div className='rounded-lg border bg-white p-4'>Drag, reorder, and edit every section</div>
        <div className='rounded-lg border bg-white p-4'>Export printable PDFs and track usage</div>
      </section>
    </main>
  );
}
