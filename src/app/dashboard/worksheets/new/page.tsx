'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function NewWorksheetPage() {
  const router = useRouter();
  const [topic, setTopic] = useState('Fractions');
  const [subject, setSubject] = useState('Math');
  const [gradeLevel, setGradeLevel] = useState('5');
  const [questionTypes, setQuestionTypes] = useState('short_answer,multiple_choice');
  const [numberOfQuestions, setNumberOfQuestions] = useState(8);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/ai/generate-worksheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic,
        subject,
        gradeLevel,
        numberOfQuestions,
        questionTypes: questionTypes.split(',').map((s) => s.trim()),
        difficulty,
        additionalInstructions,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? 'Failed to generate worksheet');
      return;
    }

    router.push(`/dashboard/worksheets/${json.worksheetId}/edit`);
  }

  return (
    <main className='mx-auto max-w-2xl space-y-4 p-6'>
      <h1 className='text-2xl font-semibold'>Generate new worksheet</h1>
      <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder='Topic' />
      <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder='Subject' />
      <Input value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} placeholder='Grade level' />
      <Input
        value={numberOfQuestions}
        onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
        type='number'
        placeholder='Number of questions'
      />
      <Input value={questionTypes} onChange={(e) => setQuestionTypes(e.target.value)} placeholder='Question types (comma separated)' />
      <Input value={difficulty} onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard' | 'mixed')} placeholder='Difficulty' />
      <Textarea value={additionalInstructions} onChange={(e) => setAdditionalInstructions(e.target.value)} placeholder='Additional instructions' />
      {error && <p className='text-sm text-red-600'>{error}</p>}
      <Button onClick={handleGenerate} disabled={loading}>{loading ? 'Generating...' : 'Generate worksheet'}</Button>
    </main>
  );
}
