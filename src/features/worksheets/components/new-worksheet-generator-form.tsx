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
import {
  GRADE_LEVELS,
  QUESTION_TYPES,
  SUBJECTS,
  WORKSHEET_TYPES,
  type WorksheetType,
} from '@/constants';

type Difficulty = 'easy' | 'medium' | 'hard' | 'mixed';

type GeneratorState = {
  topic: string;
  subject: string;
  gradeLevel: string;
  worksheetType: WorksheetType;
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
  setWorksheetType: (value: WorksheetType) => void;
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
  const hasTopic = state.topic.trim().length > 1;
  const hasSubject = state.subject.trim().length > 0;
  const hasQuestionTypes = state.questionTypes.length > 0;
  const hasValidQuestionCount =
    Number.isFinite(state.numQuestions) &&
    state.numQuestions >= 1 &&
    state.numQuestions <= 30;
  const canGenerate =
    hasTopic && hasSubject && hasQuestionTypes && hasValidQuestionCount && !state.loading;
  const instructionsLength = state.additionalInstructions.length;
  const estimatedMinutes = Math.max(5, Math.round(state.numQuestions * 1.5));

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
            Pick your settings and generate a teacher-ready worksheet draft.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <span>
              Questions: <span className="font-medium text-foreground">{state.numQuestions}</span>
            </span>
            <span>•</span>
            <span>
              Est. completion time:{' '}
              <span className="font-medium text-foreground">~{estimatedMinutes} min</span>
            </span>
            <span>•</span>
            <span>
              Type:{' '}
              <span className="font-medium text-foreground">
                {WORKSHEET_TYPES.find((t) => t.id === state.worksheetType)?.label}
              </span>
            </span>
          </div>

          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label>Topic *</Label>
              <Input
                value={state.topic}
                onChange={(e) => actions.setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, Fractions, World War II"
              />
              {!hasTopic ? (
                <p className="text-xs text-amber-600">
                  Add a clear topic so the AI can generate focused questions.
                </p>
              ) : null}
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
                <p className="text-xs text-muted-foreground">
                  Helps match vocabulary and curriculum style.
                </p>
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
                <p className="text-xs text-muted-foreground">
                  AI adjusts complexity and reading level.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Worksheet Type</Label>
                <Select
                  value={state.worksheetType}
                  onValueChange={(v: WorksheetType) => actions.setWorksheetType(v)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select worksheet type" />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKSHEET_TYPES.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Sets tone and rigor for generated questions.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Number of Questions</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={state.numQuestions}
                  onChange={(e) => actions.setNumQuestions(Number(e.target.value))}
                />
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 15].map((count) => (
                    <Button
                      key={count}
                      type="button"
                      size="sm"
                      variant={state.numQuestions === count ? 'default' : 'outline'}
                      className="h-7 px-2 text-xs"
                      onClick={() => actions.setNumQuestions(count)}
                    >
                      {count} Qs
                    </Button>
                  ))}
                </div>
                {!hasValidQuestionCount ? (
                  <p className="text-xs text-rose-600">
                    Enter between 1 and 30 questions.
                  </p>
                ) : null}
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
                <p className="text-xs text-muted-foreground">
                  Mixed is best for differentiated classroom practice.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question Types</Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {QUESTION_TYPES.map((qt) => (
                  <label
                    key={qt.id}
                    className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                      state.questionTypes.includes(qt.id)
                        ? 'border-primary/50 bg-primary/5'
                        : 'hover:bg-muted/50'
                    }`}
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
              {!hasQuestionTypes ? (
                <p className="text-xs text-rose-600">
                  Select at least one question type.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Tip: choose 2-3 types for balanced worksheets.
                </p>
              )}
            </div>

            <div className="space-y-2 border-t pt-2">
              <Label>Additional Instructions (optional)</Label>
              <Textarea
                value={state.additionalInstructions}
                onChange={(e) => actions.setAdditionalInstructions(e.target.value)}
                placeholder="e.g. Include a bonus question, make it fun and engaging, focus on vocabulary..."
                rows={3}
                maxLength={1000}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Optional teacher notes for tone, style, or constraints.</span>
                <span>{instructionsLength}/1000</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                className="flex-1 gap-2"
                onClick={actions.onGenerate}
                disabled={!canGenerate}
              >
                {state.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {state.loading ? 'Generating…' : 'Generate with AI'}
              </Button>
            </div>
            {!canGenerate ? (
              <p className="text-xs text-muted-foreground">
                Complete topic, question count, and question type selections to generate.
              </p>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
