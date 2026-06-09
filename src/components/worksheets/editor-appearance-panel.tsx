'use client';

import type { Dispatch, SetStateAction } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SectionLayoutControls } from '@/components/worksheets/section-layout-controls';
import { ThemeSettingsSidebar } from '@/components/worksheets/theme-settings-sidebar';
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
  WorksheetTheme,
} from '@/types/worksheet';
import { isStructureBlock } from '@/types/worksheet';

export function EditorAppearancePanel({
  theme,
  setTheme,
  content,
  layout,
  selectedNodeId,
  onUpdateSection,
  onUpdateSectionLayout,
}: {
  theme: WorksheetTheme;
  setTheme: Dispatch<SetStateAction<WorksheetTheme>>;
  content: WorksheetContent;
  layout: WorksheetLayout;
  selectedNodeId: string | null;
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

  if (
    selection.type === 'none' ||
    selection.type === 'worksheet_title' ||
    selection.type === 'worksheet_instructions'
  ) {
    return (
      <ThemeSettingsSidebar
        theme={theme}
        setTheme={setTheme}
        embedded
        includePanels={['typography', 'layout', 'pageHeader', 'colors']}
      />
    );
  }

  return (
    <div className="space-y-4 px-4 py-3 pb-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Layout for
        </p>
        <p className="mt-0.5 text-sm font-medium text-foreground">
          {selectionLabel(selection)}
        </p>
      </div>

      {selection.type === 'section' ? (
        <SectionLayoutControls
          sectionLayout={
            layout.sectionLayouts[selection.sectionId] ?? defaultSectionLayout()
          }
          onSectionLayoutChange={(partial) =>
            onUpdateSectionLayout(selection.sectionId, partial)
          }
        />
      ) : null}

      {selection.type === 'question' ? (
        <QuestionLayoutControls
          question={selection.question}
          theme={theme}
          setTheme={setTheme}
        />
      ) : null}

      {selection.type === 'block' ? (
        <BlockLayoutControls
          block={selection.block}
          onChange={(next) =>
            updateBlock(selection.sectionId, selection.block.id, next)
          }
        />
      ) : null}
    </div>
  );
}

function QuestionLayoutControls({
  question,
  theme,
  setTheme,
}: {
  question: WorksheetQuestion;
  theme: WorksheetTheme;
  setTheme: Dispatch<SetStateAction<WorksheetTheme>>;
}) {
  if (
    question.question_type !== 'multiple_choice' &&
    question.question_type !== 'true_false'
  ) {
    return (
      <EmptyLayoutState message="This question type has no layout options." />
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">
          Answer options layout
        </label>
        <p className="text-xs text-muted-foreground mt-1">
          How choices appear for this question in preview and export.
        </p>
        <Select
          value={theme.optionLayout}
          onValueChange={(value) =>
            setTheme((t) => ({
              ...t,
              optionLayout: value as WorksheetTheme['optionLayout'],
            }))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vertical">Vertical list</SelectItem>
            <SelectItem value="horizontal">Horizontal row</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function BlockLayoutControls({
  block,
  onChange,
}: {
  block: WorksheetStructureBlock;
  onChange: (next: WorksheetStructureBlock) => void;
}) {
  if (block.block_type === 'heading') {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Heading level
        </label>
        <Select
          value={String(block.level ?? 3)}
          onValueChange={(v) =>
            onChange({
              ...block,
              level: Number(v) as 2 | 3 | 4,
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">Heading 2</SelectItem>
            <SelectItem value="3">Heading 3</SelectItem>
            <SelectItem value="4">Heading 4</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (block.block_type === 'spacer') {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Height (px)
        </label>
        <Input
          type="number"
          min={8}
          max={200}
          step={4}
          value={block.heightPx ?? 24}
          onChange={(e) => {
            const n = Number(e.target.value);
            onChange({
              ...block,
              heightPx: Number.isNaN(n) ? 24 : Math.min(200, Math.max(8, n)),
            });
          }}
        />
      </div>
    );
  }

  if (block.block_type === 'callout') {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Callout style
        </label>
        <Select
          value={block.tone ?? 'info'}
          onValueChange={(v) =>
            onChange({
              ...block,
              tone: v as 'info' | 'warning' | 'success',
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="success">Success</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return <EmptyLayoutState message="This block has no layout options." />;
}

function EmptyLayoutState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/80 bg-muted/30 px-4 py-8 text-center">
      <SlidersHorizontal className="h-6 w-6 text-muted-foreground/50" />
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}
