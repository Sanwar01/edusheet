'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Loader2, Sparkles, FilePlus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { GRADE_LEVELS, QUESTION_TYPES, SUBJECTS } from '@/constants';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/api/client';
import { EditorShell } from '@/components/worksheets/editor-shell';

export default function NewWorksheetPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('5');
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
    if (questionTypes.length === 0) {
      toast.error('Select at least one question type.');
      return;
    }

    setLoading(true);
    try {
      const json = await fetchJson<{ worksheetId: string }>(
        '/api/ai/generate-worksheet',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            subject,
            gradeLevel,
            numQuestions,
            questionTypes,
            difficulty,
            additionalInstructions,
          }),
        },
        'Failed to generate worksheet.',
      );

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

  // Quick create without AI
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
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl py-8">
        <div className="flex flex-row gap-2 justify-between items-center">
          <div className="flex flex-col gap-2 items-start">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Create a new worksheet
            </h1>
            <p className="text-sm text-muted-foreground">
              Let AI do the heavy lifting, or start from scratch.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleBlankCreate}
          >
            <FilePlus className="h-4 w-4" />
            Start Blank
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm mt-6">
          <h1 className="font-display text-xl font-bold text-card-foreground">
            Generate with AI
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fill in the details and let AI create your worksheet.
          </p>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label>Topic *</Label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, Fractions, World War II"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select onValueChange={(v) => setSubject(v)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Grade Level</Label>
                <Select onValueChange={(v) => setGradeLevel(v)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  defaultValue="medium"
                  onValueChange={(v: 'easy' | 'medium' | 'hard' | 'mixed') =>
                    setDifficulty(v)
                  }
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question Types</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {QUESTION_TYPES.map((qt) => (
                  <label
                    key={qt.id}
                    className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={questionTypes.includes(qt.id)}
                      onCheckedChange={(checked) => {
                        if (checked)
                          setQuestionTypes([...questionTypes, qt.id]);
                        else
                          setQuestionTypes(
                            questionTypes.filter((t) => t !== qt.id),
                          );
                      }}
                    />
                    <span className="text-sm font-medium">{qt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label>Additional Instructions (optional)</Label>
              <Textarea
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="e.g. Include a bonus question, make it fun and engaging, focus on vocabulary..."
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                className="flex-1 gap-2"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {loading ? 'Generating…' : 'Generate with AI'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
