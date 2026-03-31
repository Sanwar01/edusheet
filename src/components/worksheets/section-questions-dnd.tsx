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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { WorksheetContent, WorksheetQuestion } from '@/types/worksheet';
import { SortableQuestionShell } from '@/components/worksheets/sortable-blocks';
import { duplicateQuestion } from '@/components/worksheets/editor-shell.helpers';

export const SectionQuestionsDnd = ({
  section,
  onChangeQuestions,
}: {
  section: WorksheetContent['sections'][number];
  onChangeQuestions: (next: WorksheetQuestion[]) => void;
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
        <div className="space-y-2">
          {section.questions.map((question) => (
            <SortableQuestionShell key={question.id} id={question.id}>
              <Textarea
                value={question.prompt}
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
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="px-3 py-1.5 text-xs"
                  onClick={() =>
                    onChangeQuestions([
                      ...section.questions,
                      duplicateQuestion(question),
                    ])
                  }
                >
                  Duplicate question
                </Button>
                <Button
                  variant="ghost"
                  className="px-3 py-1.5 text-xs"
                  onClick={() =>
                    onChangeQuestions(
                      section.questions.filter((q) => q.id !== question.id),
                    )
                  }
                >
                  Delete question
                </Button>
              </div>
            </SortableQuestionShell>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
