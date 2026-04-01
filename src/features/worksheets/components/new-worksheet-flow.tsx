'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { GRADE_LEVELS, SUBJECTS, type WorksheetType } from '@/constants';
import { fetchJson } from '@/lib/api/client';
import { EditorShell } from '@/components/worksheets/editor-shell';
import { GenerateWorksheetResponseSchema } from '@/lib/validators/api';
import { NewWorksheetGeneratorForm } from '@/features/worksheets/components/new-worksheet-generator-form';

export function NewWorksheetFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0] ?? '');
  const [gradeLevel, setGradeLevel] = useState(GRADE_LEVELS[5] ?? GRADE_LEVELS[0]);
  const [worksheetType, setWorksheetType] = useState<WorksheetType>('practice');
  const [questionTypes, setQuestionTypes] = useState<string[]>([
    'multiple_choice',
    'short_answer',
  ]);
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<
    'easy' | 'medium' | 'hard' | 'mixed'
  >('mixed');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const isBlankMode = searchParams.get('mode') === 'blank';
  const blankTitle = searchParams.get('title')?.trim() || 'Untitled Worksheet';

  async function handleGenerate() {
    if (loading) return;
    if (!topic.trim()) {
      toast.error('Please enter a topic first.');
      return;
    }
    if (!subject.trim()) {
      toast.error('Please select a subject.');
      return;
    }
    if (questionTypes.length === 0) {
      toast.error('Select at least one question type.');
      return;
    }
    if (!Number.isFinite(numQuestions) || numQuestions < 1 || numQuestions > 30) {
      toast.error('Please choose between 1 and 30 questions.');
      return;
    }

    setLoading(true);
    try {
      const payload = await fetchJson<unknown>(
        '/api/ai/generate-worksheet',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            subject,
            gradeLevel,
            worksheetType,
            numQuestions,
            questionTypes,
            difficulty,
            additionalInstructions,
          }),
        },
        'Failed to generate worksheet.',
      );
      const json = GenerateWorksheetResponseSchema.parse(payload);

      router.push(`/dashboard/worksheets/${json.worksheetId}/edit`);
    } catch (error) {
      toast.error('Could not generate worksheet', {
        description:
          error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleBlankCreate = async () => {
    const title = topic.trim() || 'Untitled Worksheet';
    router.push(
      `/dashboard/worksheets/new?mode=blank&title=${encodeURIComponent(title)}`,
    );
  };

  if (isBlankMode) {
    return (
      <EditorShell
        initialContent={{
          title: blankTitle,
          instructions: '',
          sections: [],
        }}
        initialTheme={{
          headingFontSize: 28,
          bodyFontSize: 16,
          fontFamily: 'inter',
          primaryColor: '#2563eb',
          textColor: '#111827',
          spacingPreset: 'comfortable',
        }}
      />
    );
  }

  return (
    <NewWorksheetGeneratorForm
      state={{
        topic,
        subject,
        gradeLevel,
        worksheetType,
        questionTypes,
        numQuestions,
        difficulty,
        additionalInstructions,
        loading,
      }}
      actions={{
        setTopic,
        setSubject,
        setGradeLevel,
        setWorksheetType,
        setQuestionTypes,
        setNumQuestions,
        setDifficulty,
        setAdditionalInstructions,
        onGenerate: handleGenerate,
        onStartBlank: handleBlankCreate,
      }}
    />
  );
}
