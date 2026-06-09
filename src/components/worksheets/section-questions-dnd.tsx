'use client';

import { useMemo } from 'react';
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
import type {
  SectionLayoutConfig,
  WorksheetContent,
  WorksheetQuestion,
  WorksheetSectionItem,
  WorksheetStructureBlock,
  WorksheetTheme,
} from '@/types/worksheet';
import { isWorksheetQuestion } from '@/types/worksheet';
import { defaultSectionLayout } from '@/features/worksheets/layout';
import { sectionQuestionGridColsClass } from '@/features/worksheets/section-grid-responsive';
import { cn } from '@/lib/utils';
import { SortableQuestionShell } from '@/components/worksheets/sortable-blocks';
import { StructureBlockEditor } from '@/components/worksheets/structure-block-editor';
import { WorksheetQuestionEditorView } from '@/components/worksheets/worksheet-question-editor-view';
import { duplicateQuestion } from '@/components/worksheets/editor-shell.helpers';
import {
  isPaletteItemType,
  PALETTE_DRAG_MIME,
  type PaletteItemType,
} from '@/components/worksheets/editor-dnd-types';

function blockToolbarLabel(block: WorksheetStructureBlock): string {
  const labels: Record<WorksheetStructureBlock['block_type'], string> = {
    heading: 'H',
    paragraph: 'P',
    divider: '—',
    spacer: 'Sp',
    callout: 'C',
    image: 'Img',
  };
  return labels[block.block_type];
}

function replaceQuestionInSectionItems(
  items: WorksheetSectionItem[],
  questionId: string,
  updater: (q: WorksheetQuestion) => WorksheetQuestion,
): WorksheetSectionItem[] {
  return items.map((row) =>
    row.id === questionId && isWorksheetQuestion(row) ? updater(row) : row,
  );
}

export const SectionQuestionsDnd = ({
  section,
  onChangeQuestions,
  questionStartNumber,
  onDropPaletteItem,
  showDropTargets,
  sectionLayout = defaultSectionLayout(),
  showScoring: _showScoring,
  selectedNodeId,
  onSelectNode,
  theme,
}: {
  section: WorksheetContent['sections'][number];
  onChangeQuestions: (next: WorksheetSectionItem[]) => void;
  questionStartNumber: number;
  onDropPaletteItem: (type: PaletteItemType, insertIndex?: number) => void;
  showDropTargets: boolean;
  sectionLayout?: SectionLayoutConfig;
  showScoring?: boolean;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  theme: WorksheetTheme;
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const questionOrdinalById = useMemo(() => {
    const map = new Map<string, number>();
    let n = questionStartNumber;
    for (const row of section.questions) {
      if (isWorksheetQuestion(row)) {
        map.set(row.id, n);
        n += 1;
      }
    }
    return map;
  }, [section.questions, questionStartNumber]);

  const isGrid = sectionLayout.mode === 'grid';
  const gridColsClass = sectionQuestionGridColsClass(sectionLayout.gridColumns);
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
        No content yet. Click{' '}
        <span className="font-medium">Add question</span> to begin, or drop a
        block or question here.
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
                isGrid
                  ? `grid auto-rows-min gap-2 ${gridColsClass}`
                  : 'space-y-2.5',
              )}
            >
              {section.questions.map((item, index) => {
                if (!isWorksheetQuestion(item)) {
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        'space-y-2',
                        isGrid && 'col-span-full min-w-0',
                        isGrid &&
                          sectionLayout.border === 'cells' &&
                          'rounded-md border border-slate-200 bg-white p-3',
                      )}
                    >
                      {showDropTargets ? (
                        <div
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            const rawType =
                              event.dataTransfer.getData(PALETTE_DRAG_MIME);
                            if (!rawType || !isPaletteItemType(rawType)) return;
                            if (rawType === 'section') return;
                            onDropPaletteItem(rawType, index);
                          }}
                          className="rounded border border-dashed border-indigo-300 bg-indigo-50/60 px-2 py-1 text-[11px] text-slate-600 transition-colors hover:border-indigo-500 hover:bg-indigo-100/70"
                        >
                          Drop here (insert before this row)
                        </div>
                      ) : null}
                      <SortableQuestionShell
                        id={item.id}
                        variant="block"
                        theme={theme}
                        toolbarLabel={blockToolbarLabel(item)}
                        editorNodeId={`block_${item.id}`}
                        isSelected={selectedNodeId === `block_${item.id}`}
                        onSelect={() => onSelectNode(`block_${item.id}`)}
                        onDuplicate={() =>
                          onChangeQuestions([
                            ...section.questions.slice(0, index + 1),
                            { ...item, id: crypto.randomUUID() },
                            ...section.questions.slice(index + 1),
                          ])
                        }
                        onDelete={() =>
                          onChangeQuestions(
                            section.questions.filter((_, i) => i !== index),
                          )
                        }
                        sortData={{
                          kind: 'structure_block',
                          blockId: item.id,
                          sectionId: section.id,
                          index,
                        }}
                      >
                        <StructureBlockEditor
                          block={item}
                          theme={theme}
                          isGrid={isGrid}
                          isSelected={selectedNodeId === `block_${item.id}`}
                          onChange={(next) =>
                            onChangeQuestions(
                              section.questions.map((row, i) =>
                                i === index ? next : row,
                              ),
                            )
                          }
                        />
                      </SortableQuestionShell>
                    </div>
                  );
                }

                const question = item;
                const qOrdinal =
                  questionOrdinalById.get(question.id) ?? questionStartNumber;

                return (
                  <div
                    key={question.id}
                    className={cn(
                      'space-y-2',
                      isGrid && 'min-w-0',
                      isGrid &&
                        sectionLayout.border === 'cells' &&
                        'rounded-md border border-slate-200 bg-white p-3',
                    )}
                  >
                    {showDropTargets ? (
                      <div
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          const rawType =
                            event.dataTransfer.getData(PALETTE_DRAG_MIME);
                          if (!rawType || !isPaletteItemType(rawType)) return;
                          if (rawType === 'section') return;
                          onDropPaletteItem(rawType, index);
                        }}
                        className="rounded border border-dashed border-indigo-300 bg-indigo-50/60 px-2 py-1 text-[11px] text-slate-600 transition-colors hover:border-indigo-500 hover:bg-indigo-100/70"
                      >
                        Drop here (insert before question {qOrdinal})
                      </div>
                    ) : null}
                    <SortableQuestionShell
                      id={question.id}
                      theme={theme}
                      toolbarLabel={`Q${qOrdinal}`}
                      editorNodeId={`question_${question.id}`}
                      isSelected={selectedNodeId === `question_${question.id}`}
                      onSelect={() => onSelectNode(`question_${question.id}`)}
                      onDuplicate={() =>
                        onChangeQuestions([
                          ...section.questions,
                          duplicateQuestion(question),
                        ])
                      }
                      onDelete={() =>
                        onChangeQuestions(
                          section.questions.filter((q) => q.id !== question.id),
                        )
                      }
                      sortData={{
                        kind: 'question',
                        questionId: question.id,
                        sectionId: section.id,
                        index,
                      }}
                    >
                      <WorksheetQuestionEditorView
                        question={question}
                        index={qOrdinal}
                        theme={theme}
                        optionLayout={theme.optionLayout}
                        onPromptChange={(prompt) =>
                          onChangeQuestions(
                            replaceQuestionInSectionItems(
                              section.questions,
                              question.id,
                              (q) => ({ ...q, prompt }),
                            ),
                          )
                        }
                      />
                    </SortableQuestionShell>
                  </div>
                );
              })}
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
          Drop a block or question here (end of section).
        </div>
      ) : null}
    </div>
  );
};
