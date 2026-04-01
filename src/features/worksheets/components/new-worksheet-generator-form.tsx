'use client';

import { FilePlus, Loader2, Sparkles } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { GRADE_LEVELS, QUESTION_TYPES, SUBJECTS } from '@/constants';

type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

type GeneratorState = {
  topic: string;
  subject: string;
  gradeLevel: string;
  questionTypes: string[];
  numQuestions: number;
  difficulty: Difficulty;
  additionalInstructions: string;
  loading: boolean;
};

type GeneratorActions = {
  setTopic: (value: string) => void;
  setSubject: (value: string) => void;
  setGradeLevel: (value: string) => void;
  setQuestionTypes: (value: string[]) => void;
  setNumQuestions: (value: number) => void;
  setDifficulty: (value: Difficulty) => void;
  setAdditionalInstructions: (value: string) => void;
  onGenerate: () => void;
  onStartBlank: () => void;
};

export function NewWorksheetGeneratorForm({
  state,
  actions,
}: {
  state: GeneratorState;
  actions: GeneratorActions;
}) {
  return (
    <div className="min-h-screen bg-background">
      <main className="container max-w-4xl py-8">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex flex-col items-start gap-2">
            <h1 className="font-display text-2xl font-bold text-foreground">
              Create a new worksheet
            </h1>
            <p className="text-sm text-muted-foreground">
              Let AI do the heavy lifting, or start from scratch.
            </p>
          </div>
          <Button variant="outline" onClick={actions.onStartBlank}>
            <FilePlus className="h-4 w-4" />
            Start Blank
          </Button>
        </div>

        <div className="mt-6 rounded-xl border bg-card p-6 shadow-sm">
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
                value={state.topic}
                onChange={(e) => actions.setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, Fractions, World War II"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={state.subject} onValueChange={actions.setSubject}>
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
                <Select
                  value={state.gradeLevel}
                  onValueChange={actions.setGradeLevel}
                >
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
                  value={state.numQuestions}
                  onChange={(e) => actions.setNumQuestions(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={state.difficulty}
                  onValueChange={(v: Difficulty) => actions.setDifficulty(v)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question Types</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {QUESTION_TYPES.map((qt) => (
                  <label
                    key={qt.id}
                    className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={state.questionTypes.includes(qt.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            actions.setQuestionTypes([...state.questionTypes, qt.id]);
                          } else {
                            actions.setQuestionTypes(
                              state.questionTypes.filter((t) => t !== qt.id),
                            );
                          }
                        }}
                      />
                      <span className="text-sm font-medium">{qt.label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t pt-2">
              <Label>Additional Instructions (optional)</Label>
              <Textarea
                value={state.additionalInstructions}
                onChange={(e) => actions.setAdditionalInstructions(e.target.value)}
                placeholder="e.g. Include a bonus question, make it fun and engaging, focus on vocabulary..."
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                className="flex-1 gap-2"
                onClick={actions.onGenerate}
                disabled={state.loading}
              >
                {state.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {state.loading ? 'Generating…' : 'Generate with AI'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
