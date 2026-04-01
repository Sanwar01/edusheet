'use client';

import { useState } from 'react';
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
  rectSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ChevronDown, ChevronRight, Copy, Trash2 } from 'lucide-react';
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
import type {
  QuestionType,
  SectionLayoutConfig,
  WorksheetContent,
  WorksheetQuestion,
} from '@/types/worksheet';
import { defaultSectionLayout } from '@/features/worksheets/layout';
import { cn } from '@/lib/utils';
import { SortableQuestionShell } from '@/components/worksheets/sortable-blocks';
import { duplicateQuestion } from '@/components/worksheets/editor-shell.helpers';
import {
  isPaletteItemType,
  PALETTE_DRAG_MIME,
  type PaletteItemType,
} from '@/components/worksheets/editor-dnd-types';

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: 'short_answer', label: 'Short answer' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'fill_in_blank', label: 'Fill in the blank' },
  { value: 'matching', label: 'Matching' },
  { value: 'essay', label: 'Essay' },
];

const TRUE_FALSE_OPTIONS = ['True', 'False'] as const;

const questionTypeLabelMap: Record<QuestionType, string> = {
  short_answer: 'Short answer',
  multiple_choice: 'Multiple choice',
  true_false: 'True / False',
  fill_in_blank: 'Fill in the blank',
  matching: 'Matching',
  essay: 'Essay',
};

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
  onDropPaletteItem,
  showDropTargets,
  sectionLayout = defaultSectionLayout(),
}: {
  section: WorksheetContent['sections'][number];
  onChangeQuestions: (next: WorksheetQuestion[]) => void;
  questionStartNumber: number;
  onDropPaletteItem: (type: PaletteItemType, insertIndex?: number) => void;
  showDropTargets: boolean;
  sectionLayout?: SectionLayoutConfig;
}) => {
  const [collapsedByQuestionId, setCollapsedByQuestionId] = useState<
    Record<string, boolean>
  >({});
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const isGrid = sectionLayout.mode === 'grid';
  const gridCols = sectionLayout.gridColumns ?? 2;
  const gridColsClass =
    gridCols === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : gridCols === 3
        ? 'grid-cols-1 sm:grid-cols-3'
        : 'grid-cols-2 sm:grid-cols-4';
  const sortStrategy = isGrid
    ? rectSortingStrategy
    : verticalListSortingStrategy;

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
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          const rawType = event.dataTransfer.getData(PALETTE_DRAG_MIME);
          if (!rawType || !isPaletteItemType(rawType)) return;
          if (rawType === 'section') return;
          onDropPaletteItem(rawType, 0);
        }}
        className={`rounded-md border border-dashed px-3 py-4 text-sm transition-colors ${
          showDropTargets
            ? 'border-indigo-300 bg-indigo-50/60 text-slate-600 hover:border-indigo-500 hover:bg-indigo-100/70'
            : 'border-slate-300 bg-slate-50 text-slate-500'
        }`}
      >
        No questions yet. Click <span className="font-medium">Add question</span>{' '}
        to begin, or drop a question here.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={section.questions.map((q) => q.id)}
          strategy={sortStrategy}
        >
          <div
            className={cn(
              isGrid &&
                sectionLayout.border === 'outer' &&
                'rounded-lg border-2 border-slate-300 p-3',
            )}
          >
            <div
              className={cn(
                isGrid ? `grid gap-2 ${gridColsClass}` : 'space-y-2.5',
              )}
            >
            {section.questions.map((question, index) => (
              <div
                key={question.id}
                className={cn(
                  'space-y-2',
                  isGrid &&
                    sectionLayout.border === 'cells' &&
                    'rounded-md border border-slate-200 bg-white p-2',
                )}
              >
                {showDropTargets ? (
                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      const rawType = event.dataTransfer.getData(PALETTE_DRAG_MIME);
                      if (!rawType || !isPaletteItemType(rawType)) return;
                      if (rawType === 'section') return;
                      onDropPaletteItem(rawType, index);
                    }}
                    className="rounded border border-dashed border-indigo-300 bg-indigo-50/60 px-2 py-1 text-[11px] text-slate-600 transition-colors hover:border-indigo-500 hover:bg-indigo-100/70"
                  >
                    Drop question here (before {questionStartNumber + index})
                  </div>
                ) : null}
                <SortableQuestionShell
                  id={question.id}
                  sortData={{
                    kind: 'question',
                    questionId: question.id,
                    sectionId: section.id,
                    index,
                  }}
                >
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-slate-500">
                  Question {questionStartNumber + index}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-7 px-2 text-xs text-slate-600"
                    onClick={() =>
                      setCollapsedByQuestionId((prev) => ({
                        ...prev,
                        [question.id]: !prev[question.id],
                      }))
                    }
                  >
                    {collapsedByQuestionId[question.id] ? (
                      <>
                        <ChevronRight className="h-3.5 w-3.5" /> Show question
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" /> Hide question
                      </>
                    )}
                  </Button>
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
                      min={1}
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
                                    : Math.max(1, Number(e.target.value)),
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
                  id={`question_${question.id}`}
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
              {collapsedByQuestionId[question.id] ? (
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span className="rounded-full bg-white px-2 py-1">
                    Type: {questionTypeLabelMap[question.question_type]}
                  </span>
                  <span className="rounded-full bg-white px-2 py-1">
                    Points: {question.points ?? 1}
                  </span>
                  <span className="rounded-full bg-white px-2 py-1">
                    Answer: {question.answer?.trim() ? 'Set' : 'Not set'}
                  </span>
                </div>
              ) : (
                <>
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
                          {question.question_type === 'multiple_choice' && (
                            <Button
                              type="button"
                              variant={
                                question.answer === option
                                  ? 'default'
                                  : 'outline'
                              }
                              className="h-8 text-xs"
                              onClick={() =>
                                onChangeQuestions(
                                  section.questions.map((q) =>
                                    q.id === question.id
                                      ? { ...q, answer: option }
                                      : q,
                                  ),
                                )
                              }
                            >
                              Correct
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700"
                            disabled={
                              question.question_type === 'multiple_choice' &&
                              (question.options?.length ?? 0) <= 2
                            }
                            onClick={() =>
                              onChangeQuestions(
                                section.questions.map((q) => {
                                  if (q.id !== question.id) return q;
                                  const nextOptions = [
                                    ...(q.options ?? []),
                                  ].filter((_, i) => i !== optionIndex);
                                  const nextAnswer =
                                    q.answer === option
                                      ? (nextOptions[0] ?? '')
                                      : q.answer;
                                  return {
                                    ...q,
                                    options: nextOptions,
                                    answer: nextAnswer,
                                  };
                                }),
                              )
                            }
                          >
                            Remove
                          </Button>
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
                      {question.question_type === 'multiple_choice' && (
                        <p className="text-xs text-slate-500">
                          Multiple choice requires at least 2 options and one
                          correct answer.
                        </p>
                      )}
                    </div>
                  )}
                  {question.question_type === 'true_false' ? (
                    <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2">
                      <p className="mb-1 text-xs font-medium text-slate-500">
                        Correct answer
                      </p>
                      <div className="flex gap-2">
                        {TRUE_FALSE_OPTIONS.map((value) => (
                          <Button
                            key={value}
                            type="button"
                            variant={
                              question.answer === value ? 'default' : 'outline'
                            }
                            className="h-8 text-xs"
                            onClick={() =>
                              onChangeQuestions(
                                section.questions.map((q) =>
                                  q.id === question.id
                                    ? { ...q, answer: value }
                                    : q,
                                ),
                              )
                            }
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : question.question_type === 'short_answer' ? (
                    <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-2">
                      <p className="mb-1 text-xs font-medium text-slate-500">
                        Expected answer (optional)
                      </p>
                      <Input
                        value={question.answer ?? ''}
                        placeholder="Optional teacher answer"
                        className="w-full border-slate-200 bg-white"
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
                  ) : (
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
                  )}
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
                      onClick={() => {
                        const confirmed = window.confirm(
                          'Delete this question? This cannot be undone.',
                        );
                        if (!confirmed) return;
                        onChangeQuestions(
                          section.questions.filter((q) => q.id !== question.id),
                        );
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                </>
              )}
                </SortableQuestionShell>
              </div>
            ))}
            </div>
          </div>
        </SortableContext>
      </DndContext>
      {showDropTargets ? (
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const rawType = event.dataTransfer.getData(PALETTE_DRAG_MIME);
            if (!rawType || !isPaletteItemType(rawType)) return;
            if (rawType === 'section') return;
            onDropPaletteItem(rawType, section.questions.length);
          }}
          className="rounded-md border border-dashed border-indigo-300 bg-indigo-50/60 px-3 py-2 text-xs text-slate-600 transition-colors hover:border-indigo-500 hover:bg-indigo-100/70"
        >
          Drop a question component here (end of section).
        </div>
      ) : null}
    </div>
  );
};
