'use client';

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Copy, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type {
  QuestionType,
  WorksheetContent,
  WorksheetQuestion,
} from '@/types/worksheet';
import { SortableQuestionShell } from '@/components/worksheets/sortable-blocks';
import { duplicateQuestion } from '@/components/worksheets/editor-shell.helpers';

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'short_answer', label: 'Short answer' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'fill_in_blank', label: 'Fill in the blank' },
  { value: 'matching', label: 'Matching' },
  { value: 'essay', label: 'Essay' },
];

const buildQuestionByType = (
  current: WorksheetQuestion,
  question_type: QuestionType,
): WorksheetQuestion => {
  const base: WorksheetQuestion = {
    id: current.id,
    question_type,
    prompt: current.prompt,
    points: current.points ?? 1,
    answer: current.answer ?? '',
  };

  if (question_type === 'multiple_choice') {
    return { ...base, options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'] };
  }

  if (question_type === 'true_false') {
    return { ...base, options: ['True', 'False'], answer: 'True' };
  }

  if (question_type === 'matching') {
    return { ...base, options: ['Pair 1', 'Pair 2', 'Pair 3'] };
  }

  if (question_type === 'fill_in_blank') {
    return { ...base, options: undefined };
  }

  if (question_type === 'essay' || question_type === 'short_answer') {
    return { ...base, options: undefined };
  }

  return base;
};

export const SectionQuestionsDnd = ({
  section,
  onChangeQuestions,
  questionStartNumber,
}: {
  section: WorksheetContent['sections'][number];
  onChangeQuestions: (next: WorksheetQuestion[]) => void;
  questionStartNumber: number;
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = section.questions.findIndex((q) => q.id === active.id);
    const newIndex = section.questions.findIndex((q) => q.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChangeQuestions(arrayMove(section.questions, oldIndex, newIndex));
  };

  if (section.questions.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500">
        No questions yet. Click{' '}
        <span className="font-medium">Add question</span> to begin.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext
        items={section.questions.map((q) => q.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2.5">
          {section.questions.map((question, index) => (
            <SortableQuestionShell key={question.id} id={question.id}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-500">
                  Question {questionStartNumber + index}
                </p>
                <div className="flex items-center gap-1">
                  <Select
                    value={question.question_type}
                    onValueChange={(nextType) =>
                      onChangeQuestions(
                        section.questions.map((q) =>
                          q.id === question.id
                            ? buildQuestionByType(q, nextType as QuestionType)
                            : q,
                        ),
                      )
                    }
                  >
                    <SelectTrigger className="h-7 w-[150px] bg-slate-100 text-xs">
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
                  <div className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    <span>Pts</span>
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={question.points ?? 1}
                      onChange={(e) =>
                        onChangeQuestions(
                          section.questions.map((q) =>
                            q.id === question.id
                              ? {
                                  ...q,
                                  points: Number.isNaN(Number(e.target.value))
                                    ? 1
                                    : Math.max(0, Number(e.target.value)),
                                }
                              : q,
                          ),
                        )
                      }
                      className="h-5 w-12 rounded border border-slate-300 bg-white px-1 text-right text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              <Textarea
                value={question.prompt}
                placeholder="Type the question prompt here"
                className="w-full border-slate-200 bg-white font-semibold"
                onChange={(e) =>
                  onChangeQuestions(
                    section.questions.map((q) =>
                      q.id === question.id
                        ? { ...q, prompt: e.target.value }
                        : q,
                    ),
                  )
                }
              />
              {(question.question_type === 'multiple_choice' ||
                question.question_type === 'matching') && (
                <div className="mt-2 space-y-1.5">
                  {(question.options ?? []).map((option, optionIndex) => (
                    <div
                      key={`${question.id}_opt_${optionIndex}`}
                      className="flex items-center gap-2"
                    >
                      <span className="text-xs text-slate-500">
                        {String.fromCharCode(65 + optionIndex)}.
                      </span>
                      <input
                        value={option}
                        onChange={(e) =>
                          onChangeQuestions(
                            section.questions.map((q) => {
                              if (q.id !== question.id) return q;
                              const nextOptions = [...(q.options ?? [])];
                              nextOptions[optionIndex] = e.target.value;
                              return { ...q, options: nextOptions };
                            }),
                          )
                        }
                        placeholder={`Option ${optionIndex + 1}`}
                        className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-sm outline-none focus:border-slate-300"
                      />
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-xs text-slate-600"
                    onClick={() =>
                      onChangeQuestions(
                        section.questions.map((q) =>
                          q.id === question.id
                            ? {
                                ...q,
                                options: [
                                  ...(q.options ?? []),
                                  `Option ${(q.options?.length ?? 0) + 1}`,
                                ],
                              }
                            : q,
                        ),
                      )
                    }
                  >
                    Add option
                  </Button>
                </div>
              )}
              <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2">
                <p className="mb-1 text-xs font-medium text-slate-500">
                  Answer
                </p>
                <Textarea
                  value={question.answer ?? ''}
                  placeholder="Type the expected answer"
                  className="w-full h-full border-slate-200 bg-white"
                  onChange={(e) =>
                    onChangeQuestions(
                      section.questions.map((q) =>
                        q.id === question.id
                          ? { ...q, answer: e.target.value }
                          : q,
                      ),
                    )
                  }
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                <Button
                  variant="ghost"
                  className="h-8 px-2 text-xs text-slate-600"
                  onClick={() =>
                    onChangeQuestions([
                      ...section.questions,
                      duplicateQuestion(question),
                    ])
                  }
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </Button>
                <Button
                  variant="ghost"
                  className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700"
                  onClick={() =>
                    onChangeQuestions(
                      section.questions.filter((q) => q.id !== question.id),
                    )
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </SortableQuestionShell>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
