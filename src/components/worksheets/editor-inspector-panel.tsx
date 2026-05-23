'use client';

import { MousePointerClick } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { QuestionInspector } from '@/components/worksheets/question-inspector';
import { SectionInspector } from '@/components/worksheets/section-inspector';
import { StructureBlockInspector } from '@/components/worksheets/structure-block-inspector';
import { defaultSectionLayout } from '@/features/worksheets/layout';
import {
  resolveEditorSelection,
  selectionLabel,
} from '@/features/worksheets/editor/resolve-editor-selection';
import type {
  SectionLayoutConfig,
  WorksheetContent,
  WorksheetLayout,
  WorksheetQuestion,
  WorksheetSection,
  WorksheetStructureBlock,
} from '@/types/worksheet';
import { isStructureBlock, isWorksheetQuestion } from '@/types/worksheet';

export function EditorInspectorPanel({
  content,
  layout,
  selectedNodeId,
  showScoring,
  onContentChange,
  onUpdateSection,
  onUpdateSectionLayout,
}: {
  content: WorksheetContent;
  layout: WorksheetLayout;
  selectedNodeId: string | null;
  showScoring: boolean;
  onContentChange: (
    updater: WorksheetContent | ((prev: WorksheetContent) => WorksheetContent),
  ) => void;
  onUpdateSection: (
    sectionId: string,
    updater: (section: WorksheetSection) => WorksheetSection,
  ) => void;
  onUpdateSectionLayout: (
    sectionId: string,
    partial: Partial<SectionLayoutConfig>,
  ) => void;
}) {
  const selection = resolveEditorSelection(content, selectedNodeId);

  if (selection.type === 'none') {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
        <MousePointerClick className="h-8 w-8 text-muted-foreground/60" />
        <div>
          <p className="text-sm font-medium text-foreground">Nothing selected</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Click a section, question, or block on the canvas to edit its
            settings here.
          </p>
        </div>
      </div>
    );
  }

  const updateBlock = (
    sectionId: string,
    blockId: string,
    next: WorksheetStructureBlock,
  ) => {
    onUpdateSection(sectionId, (section) => ({
      ...section,
      questions: section.questions.map((row) =>
        row.id === blockId && isStructureBlock(row) ? next : row,
      ),
    }));
  };

  const updateQuestion = (
    sectionId: string,
    questionId: string,
    next: WorksheetQuestion,
  ) => {
    onUpdateSection(sectionId, (section) => ({
      ...section,
      questions: section.questions.map((row) =>
        row.id === questionId && isWorksheetQuestion(row) ? next : row,
      ),
    }));
  };

  return (
    <div className="space-y-4 px-4 py-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Selected
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground">
          {selectionLabel(selection)}
        </p>
      </div>

      {selection.type === 'worksheet_title' ? (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Title
          </label>
          <Input
            value={content.title}
            onChange={(e) =>
              onContentChange((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Worksheet title"
          />
        </div>
      ) : null}

      {selection.type === 'worksheet_instructions' ? (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">
            Instructions
          </label>
          <Textarea
            value={content.instructions || ''}
            onChange={(e) =>
              onContentChange((prev) => ({
                ...prev,
                instructions: e.target.value,
              }))
            }
            placeholder="Instructions for students"
            rows={4}
          />
        </div>
      ) : null}

      {selection.type === 'section' ? (
        <SectionInspector
          section={selection.section}
          sectionLayout={
            layout.sectionLayouts[selection.sectionId] ?? defaultSectionLayout()
          }
          onChangeSection={(next) => onUpdateSection(selection.sectionId, () => next)}
          onSectionLayoutChange={(partial) =>
            onUpdateSectionLayout(selection.sectionId, partial)
          }
        />
      ) : null}

      {selection.type === 'question' ? (
        <QuestionInspector
          question={selection.question}
          showScoring={showScoring}
          onChange={(next) =>
            updateQuestion(selection.sectionId, selection.question.id, next)
          }
        />
      ) : null}

      {selection.type === 'block' ? (
        <StructureBlockInspector
          block={selection.block}
          onChange={(next) =>
            updateBlock(selection.sectionId, selection.block.id, next)
          }
        />
      ) : null}
    </div>
  );
}
