'use client';

import {
  ChevronDown,
  ChevronRight,
  CirclePlus,
  Copy,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SectionLayoutConfig, WorksheetContent } from '@/types/worksheet';
import { SortableSectionShell } from '@/components/worksheets/sortable-blocks';
import { SectionQuestionsDnd } from '@/components/worksheets/section-questions-dnd';
import type { PaletteItemType } from '@/components/worksheets/editor-dnd-types';

export const WorksheetSectionCard = ({
  section,
  sectionNumber,
  questionStartNumber,
  sectionPoints,
  isCollapsed,
  onToggleCollapsed,
  onChangeSection,
  onDuplicateSection,
  onDeleteSection,
  onAddQuestion,
  onDropPaletteItem,
  showDropTargets,
  sectionLayout,
  onSectionLayoutChange,
}: {
  section: WorksheetContent['sections'][number];
  sectionNumber: number;
  questionStartNumber: number;
  sectionPoints: number;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
  onChangeSection: (next: WorksheetContent['sections'][number]) => void;
  onDuplicateSection: () => void;
  onDeleteSection: () => void;
  onAddQuestion: () => void;
  onDropPaletteItem: (type: PaletteItemType, insertIndex?: number) => void;
  showDropTargets: boolean;
  sectionLayout: SectionLayoutConfig;
  onSectionLayoutChange: (partial: Partial<SectionLayoutConfig>) => void;
}) => {
  return (
    <SortableSectionShell
      id={section.id}
      sortData={{ kind: 'section', sectionId: section.id }}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Section {sectionNumber}
        </p>
        <div className="flex items-center gap-1">
          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {sectionPoints} pts
          </span>
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs text-slate-600"
            onClick={onToggleCollapsed}
          >
            {isCollapsed ? (
              <>
                <ChevronRight className="h-3.5 w-3.5" /> Show section
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" /> Hide section
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs text-slate-600"
            onClick={onDuplicateSection}
          >
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </Button>
          <Button
            variant="ghost"
            className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700"
            onClick={onDeleteSection}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </div>

      <Input
        id={`section_${section.id}`}
        className="w-full border-slate-300 bg-white font-medium"
        value={section.heading}
        placeholder="Section heading"
        onChange={(e) =>
          onChangeSection({
            ...section,
            heading: e.target.value,
          })
        }
      />

      {!isCollapsed && (
        <>
          <div className="mt-2 flex flex-wrap items-center gap-2 rounded-md border border-slate-100 bg-slate-50/80 px-2 py-2">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Question layout
            </span>
            <Select
              value={sectionLayout.mode}
              onValueChange={(value) => {
                const mode = value as SectionLayoutConfig['mode'];
                onSectionLayoutChange(
                  mode === 'grid'
                    ? {
                        mode: 'grid',
                        gridColumns: sectionLayout.gridColumns ?? 2,
                      }
                    : { mode: 'stack', gridColumns: undefined },
                );
              }}
            >
              <SelectTrigger className="h-8 w-[130px] bg-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stack">Single column</SelectItem>
                <SelectItem value="grid">Grid</SelectItem>
              </SelectContent>
            </Select>
            {sectionLayout.mode === 'grid' ? (
              <>
                <Select
                  value={String(sectionLayout.gridColumns ?? 2)}
                  onValueChange={(v) =>
                    onSectionLayoutChange({
                      gridColumns: Number(v) as 2 | 3 | 4,
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-[100px] bg-white text-xs">
                    <SelectValue placeholder="Cols" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 columns</SelectItem>
                    <SelectItem value="3">3 columns</SelectItem>
                    <SelectItem value="4">4 columns</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={sectionLayout.border ?? 'none'}
                  onValueChange={(value) =>
                    onSectionLayoutChange({
                      border: value as SectionLayoutConfig['border'],
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-[120px] bg-white text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No border</SelectItem>
                    <SelectItem value="outer">Outer border</SelectItem>
                    <SelectItem value="cells">Cell borders</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : null}
          </div>

          <SectionQuestionsDnd
            section={section}
            questionStartNumber={questionStartNumber}
            onDropPaletteItem={onDropPaletteItem}
            showDropTargets={showDropTargets}
            sectionLayout={sectionLayout}
            onChangeQuestions={(next) =>
              onChangeSection({ ...section, questions: next })
            }
          />

          <Button
            variant="outline"
            className="mt-1 h-9 w-full border-dashed text-xs border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-700"
            onClick={onAddQuestion}
          >
            <CirclePlus className="h-3.5 w-3.5" /> Add question
          </Button>
        </>
      )}
    </SortableSectionShell>
  );
};
