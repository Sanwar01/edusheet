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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CirclePlus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorksheetSectionCard } from '@/components/worksheets/worksheet-section-card';
import {
  isPaletteItemType,
  PALETTE_DRAG_MIME,
  type PaletteItemType,
} from '@/components/worksheets/editor-dnd-types';
import type {
  SectionLayoutConfig,
  WorksheetContent,
  WorksheetLayout,
  WorksheetTheme,
} from '@/types/worksheet';
import { defaultSectionLayout } from '@/features/worksheets/layout';

type CompletionState = {
  hasTitle: boolean;
  hasInstructions: boolean;
  hasSection: boolean;
  hasQuestions: boolean;
  questionCount: number;
  doneCount: number;
};

type EditPaneModel = {
  content: WorksheetContent;
  theme: WorksheetTheme;
  layout: WorksheetLayout;
  contentFontClass: string;
  sectionSpacingClass: string;
  pointsBySection: Record<string, number>;
  sectionCollapsed: Record<string, boolean>;
  isPaletteDragging: boolean;
  isBlankWorksheet: boolean;
  completion: CompletionState;
};

type EditPaneCommands = {
  setContentWithHistory: (
    updater: WorksheetContent | ((prev: WorksheetContent) => WorksheetContent),
  ) => void;
  setSectionCollapsed: (
    updater: (prev: Record<string, boolean>) => Record<string, boolean>,
  ) => void;
  addFromPalette: (type: PaletteItemType) => void;
  addSection: () => void;
  onSectionsDragEnd: (event: DragEndEvent) => void;
  addQuestionFromPaletteToSection: (
    sectionId: string,
    type: PaletteItemType,
    insertIndex?: number,
  ) => void;
  updateSectionById: (
    sectionId: string,
    updater: (
      section: WorksheetContent['sections'][number],
    ) => WorksheetContent['sections'][number],
  ) => void;
  duplicateSection: (sectionId: string) => void;
  deleteSection: (sectionId: string) => void;
  addQuestionToSection: (sectionId: string) => void;
  insertSectionAt: (insertIndex: number) => void;
  setIsPaletteDragging: (next: boolean) => void;
  updateSectionLayout: (
    sectionId: string,
    partial: Partial<SectionLayoutConfig>,
  ) => void;
};

export function EditorEditPane({
  model,
  commands,
}: {
  model: EditPaneModel;
  commands: EditPaneCommands;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  return (
    <>
      {model.isBlankWorksheet && (
        <aside className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:w-72">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-semibold text-slate-900">
              Guided checklist
            </h2>
          </div>

          <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Complete {model.completion.doneCount}/4 basics
          </div>

          <ul className="space-y-2 text-sm">
            <li
              className={
                model.completion.hasTitle
                  ? 'text-emerald-700'
                  : 'text-slate-600'
              }
            >
              {model.completion.hasTitle ? '✓' : '•'} Add worksheet title
            </li>
            <li
              className={
                model.completion.hasInstructions
                  ? 'text-emerald-700'
                  : 'text-slate-600'
              }
            >
              {model.completion.hasInstructions ? '✓' : '•'} Add student
              instructions
            </li>
            <li
              className={
                model.completion.hasSection
                  ? 'text-emerald-700'
                  : 'text-slate-600'
              }
            >
              {model.completion.hasSection ? '✓' : '•'} Create at least one
              section
            </li>
            <li
              className={
                model.completion.hasQuestions
                  ? 'text-emerald-700'
                  : 'text-slate-600'
              }
            >
              {model.completion.hasQuestions ? '✓' : '•'} Add at least one
              question
            </li>
          </ul>

          <p className="mt-4 text-xs leading-5 text-slate-500">
            Tip: drag sections and questions by the handle dots to reorder.
          </p>
        </aside>
      )}

      <div
        className={`w-full rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-sm md:px-10 ${model.contentFontClass}`}
        style={{
          color: model.theme.textColor,
          fontSize: model.theme.bodyFontSize,
        }}
      >
        {model.theme.headerStyle === 'lesson' ? (
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
            <input
              id="worksheet_title"
              value={model.content.title}
              onChange={(e) => {
                commands.setContentWithHistory((prev) => ({
                  ...prev,
                  title: e.target.value,
                }));
              }}
              className="min-w-[200px] flex-1 border-none bg-transparent text-2xl font-bold text-slate-900 outline-none md:text-3xl"
              style={{
                fontSize: model.theme.headingFontSize,
                color: model.theme.primaryColor,
              }}
              placeholder="Worksheet title"
            />
            {model.theme.showNameLine ? (
              <div
                className="shrink-0 text-sm"
                style={{ color: model.theme.textColor }}
              >
                Name:{' '}
                <span className="inline-block min-w-48 border-b border-slate-400 pb-0.5 align-bottom" />
              </div>
            ) : null}
          </div>
        ) : (
          <input
            id="worksheet_title"
            value={model.content.title}
            onChange={(e) => {
              commands.setContentWithHistory((prev) => ({
                ...prev,
                title: e.target.value,
              }));
            }}
            className="w-full border-none bg-transparent text-2xl font-bold text-slate-900 outline-none md:text-3xl"
            style={{
              fontSize: model.theme.headingFontSize,
              color: model.theme.primaryColor,
            }}
            placeholder="Worksheet title"
          />
        )}

        <textarea
          id="worksheet_instructions"
          value={model.content.instructions || ''}
          onChange={(e) => {
            commands.setContentWithHistory((prev) => ({
              ...prev,
              instructions: e.target.value,
            }));
          }}
          placeholder="Short instructions for students"
          className={`mt-2 mb-6 w-full resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm italic text-slate-700 outline-none ${model.contentFontClass}`}
          rows={3}
          style={{
            fontSize: model.theme.bodyFontSize,
            color: model.theme.textColor,
          }}
        />

        {model.content.sections.length === 0 ? (
          <div
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              const rawType = event.dataTransfer.getData(PALETTE_DRAG_MIME);
              if (!rawType || !isPaletteItemType(rawType)) return;
              commands.addFromPalette(rawType);
            }}
            className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center"
          >
            <p className="text-sm font-medium text-slate-800">
              Start by adding your first section
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Example: Vocabulary, Reading, or Math Practice
            </p>
            <p className="mt-1 text-xs text-slate-500">
              You can also drag a component from the left panel.
            </p>
            <Button className="mt-4" onClick={commands.addSection}>
              <CirclePlus className="h-4 w-4" /> Add first section
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={commands.onSectionsDragEnd}
          >
            <SortableContext
              items={model.content.sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className={model.sectionSpacingClass}>
                {model.content.sections.map((section, index) => {
                  const questionStartNumber =
                    model.content.sections
                      .slice(0, index)
                      .reduce((sum, s) => sum + s.questions.length, 0) + 1;
                  return (
                    <div key={section.id} className="space-y-2">
                      {model.isPaletteDragging ? (
                        <div
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            const rawType =
                              event.dataTransfer.getData(PALETTE_DRAG_MIME);
                            if (!rawType || !isPaletteItemType(rawType)) return;
                            commands.setIsPaletteDragging(false);
                            if (rawType === 'section') {
                              commands.insertSectionAt(index);
                              return;
                            }
                            commands.addQuestionFromPaletteToSection(
                              section.id,
                              rawType,
                              0,
                            );
                          }}
                          className="rounded border border-dashed border-indigo-300 bg-indigo-50/60 px-2 py-1 text-[11px] text-slate-600 transition-colors hover:border-indigo-500 hover:bg-indigo-100/70"
                        >
                          Drop component here (before section {index + 1})
                        </div>
                      ) : null}
                      <WorksheetSectionCard
                        section={section}
                        sectionNumber={index + 1}
                        questionStartNumber={questionStartNumber}
                        sectionPoints={model.pointsBySection[section.id] ?? 0}
                        isCollapsed={Boolean(
                          model.sectionCollapsed[section.id],
                        )}
                        onToggleCollapsed={() =>
                          commands.setSectionCollapsed((prev) => ({
                            ...prev,
                            [section.id]: !prev[section.id],
                          }))
                        }
                        onChangeSection={(nextSection) =>
                          commands.updateSectionById(
                            section.id,
                            () => nextSection,
                          )
                        }
                        onDropPaletteItem={(type, insertIndex) =>
                          commands.addQuestionFromPaletteToSection(
                            section.id,
                            type,
                            insertIndex,
                          )
                        }
                        showDropTargets={model.isPaletteDragging}
                        sectionLayout={
                          model.layout.sectionLayouts[section.id] ??
                          defaultSectionLayout()
                        }
                        onSectionLayoutChange={(partial) =>
                          commands.updateSectionLayout(section.id, partial)
                        }
                        onDuplicateSection={() =>
                          commands.duplicateSection(section.id)
                        }
                        onDeleteSection={() =>
                          commands.deleteSection(section.id)
                        }
                        onAddQuestion={() =>
                          commands.addQuestionToSection(section.id)
                        }
                      />
                    </div>
                  );
                })}
                {model.isPaletteDragging ? (
                  <div
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      const rawType =
                        event.dataTransfer.getData(PALETTE_DRAG_MIME);
                      if (!rawType || !isPaletteItemType(rawType)) return;
                      commands.setIsPaletteDragging(false);
                      if (rawType === 'section') {
                        commands.insertSectionAt(model.content.sections.length);
                        return;
                      }
                      const lastSectionId =
                        model.content.sections[
                          model.content.sections.length - 1
                        ]?.id;
                      if (!lastSectionId) return;
                      commands.addQuestionFromPaletteToSection(
                        lastSectionId,
                        rawType,
                      );
                    }}
                    className="rounded border border-dashed border-indigo-300 bg-indigo-50/60 px-2 py-1 text-[11px] text-slate-600 transition-colors hover:border-indigo-500 hover:bg-indigo-100/70"
                  >
                    Drop component here (end of worksheet)
                  </div>
                ) : null}
              </div>
            </SortableContext>
          </DndContext>
        )}

        <Button
          variant="outline"
          className="mt-4 w-full border-dashed border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-700"
          onClick={commands.addSection}
        >
          <CirclePlus className="h-4 w-4" /> Add section
        </Button>
      </div>
    </>
  );
}
