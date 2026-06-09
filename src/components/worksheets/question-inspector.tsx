'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { QuestionType, WorksheetQuestion } from '@/types/worksheet';

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'short_answer', label: 'Short answer' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'fill_in_blank', label: 'Fill in the blank' },
  { value: 'matching', label: 'Matching' },
  { value: 'essay', label: 'Essay' },
];

const TRUE_FALSE_OPTIONS = ['True', 'False'] as const;

function buildQuestionByType(
  current: WorksheetQuestion,
  question_type: QuestionType,
): WorksheetQuestion {
  const base: WorksheetQuestion = {
    id: current.id,
    question_type,
    prompt: current.prompt,
    points: current.points ?? 1,
    answer: current.answer ?? '',
  };

  if (question_type === 'multiple_choice') {
    return {
      ...base,
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      answer: 'Option 1',
    };
  }

  if (question_type === 'true_false') {
    return { ...base, options: [...TRUE_FALSE_OPTIONS], answer: 'True' };
  }

  if (question_type === 'matching') {
    return { ...base, options: ['Pair 1', 'Pair 2', 'Pair 3'] };
  }

  return { ...base, options: undefined };
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function QuestionInspector({
  question,
  showScoring,
  onChange,
}: {
  question: WorksheetQuestion;
  showScoring: boolean;
  onChange: (next: WorksheetQuestion) => void;
}) {
  const baseId = `inspector_question_${question.id}`;

  return (
    <div className="space-y-4">
      <Field label="Question type">
        <Select
          value={question.question_type}
          onValueChange={(nextType) =>
            onChange(buildQuestionByType(question, nextType as QuestionType))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUESTION_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Prompt" htmlFor={`${baseId}_prompt`}>
        <Textarea
          id={`${baseId}_prompt`}
          value={question.prompt}
          onChange={(e) => onChange({ ...question, prompt: e.target.value })}
          placeholder={
            question.question_type === 'fill_in_blank'
              ? 'There are ___________________ months.'
              : 'Question prompt'
          }
          rows={3}
        />
        {question.question_type === 'fill_in_blank' ? (
          <p className="text-xs text-muted-foreground">
            Use three or more underscores (
            <span className="font-mono">___</span>) where students should write
            their answer.
          </p>
        ) : null}
      </Field>

      {showScoring ? (
        <Field label="Points" htmlFor={`${baseId}_pts`}>
          <Input
            id={`${baseId}_pts`}
            type="number"
            min={1}
            step={1}
            value={question.points ?? 1}
            onChange={(e) => {
              const n = Number(e.target.value);
              onChange({
                ...question,
                points: Number.isNaN(n) ? 1 : Math.max(1, n),
              });
            }}
          />
        </Field>
      ) : null}

      {(question.question_type === 'multiple_choice' ||
        question.question_type === 'matching') && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Options</p>
          {(question.options ?? []).map((option, optionIndex) => (
            <div
              key={`${question.id}_opt_${optionIndex}`}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="w-5 shrink-0 text-xs text-muted-foreground">
                {String.fromCharCode(65 + optionIndex)}.
              </span>
              <Input
                value={option}
                onChange={(e) => {
                  const nextOptions = [...(question.options ?? [])];
                  nextOptions[optionIndex] = e.target.value;
                  onChange({ ...question, options: nextOptions });
                }}
                placeholder={`Option ${optionIndex + 1}`}
                className="min-w-0 flex-1"
              />
              {question.question_type === 'multiple_choice' ? (
                <Button
                  type="button"
                  variant={question.answer === option ? 'default' : 'outline'}
                  size="sm"
                  className="h-8 shrink-0 text-xs"
                  onClick={() => onChange({ ...question, answer: option })}
                >
                  Correct
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 text-xs text-rose-600 hover:text-rose-700"
                disabled={
                  question.question_type === 'multiple_choice' &&
                  (question.options?.length ?? 0) <= 2
                }
                onClick={() => {
                  const nextOptions = [...(question.options ?? [])].filter(
                    (_, i) => i !== optionIndex,
                  );
                  const nextAnswer =
                    question.answer === option
                      ? (nextOptions[0] ?? '')
                      : question.answer;
                  onChange({
                    ...question,
                    options: nextOptions,
                    answer: nextAnswer,
                  });
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() =>
              onChange({
                ...question,
                options: [
                  ...(question.options ?? []),
                  `Option ${(question.options?.length ?? 0) + 1}`,
                ],
              })
            }
          >
            Add option
          </Button>
        </div>
      )}

      {question.question_type === 'true_false' ? (
        <Field label="Correct answer">
          <div className="flex gap-2">
            {TRUE_FALSE_OPTIONS.map((value) => (
              <Button
                key={value}
                type="button"
                variant={question.answer === value ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs"
                onClick={() => onChange({ ...question, answer: value })}
              >
                {value}
              </Button>
            ))}
          </div>
        </Field>
      ) : null}

      {question.question_type === 'short_answer' ? (
        <Field label="Expected answer (optional)" htmlFor={`${baseId}_ans`}>
          <Input
            id={`${baseId}_ans`}
            value={question.answer ?? ''}
            placeholder="Optional teacher answer"
            onChange={(e) => onChange({ ...question, answer: e.target.value })}
          />
        </Field>
      ) : null}

      {question.question_type === 'fill_in_blank' ||
      question.question_type === 'essay' ||
      question.question_type === 'matching' ? (
        question.question_type !== 'matching' ? (
          <Field label="Answer" htmlFor={`${baseId}_ans_long`}>
            <Textarea
              id={`${baseId}_ans_long`}
              value={question.answer ?? ''}
              placeholder="Expected answer"
              rows={3}
              onChange={(e) =>
                onChange({ ...question, answer: e.target.value })
              }
            />
          </Field>
        ) : null
      ) : null}
    </div>
  );
}
