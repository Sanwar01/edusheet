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
import type { WorksheetContent } from '@/types/worksheet';
import { SortableSectionShell } from '@/components/worksheets/sortable-blocks';
import { SectionQuestionsDnd } from '@/components/worksheets/section-questions-dnd';

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
}) => {
  return (
    <SortableSectionShell id={section.id}>
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
          <SectionQuestionsDnd
            section={section}
            questionStartNumber={questionStartNumber}
            onChangeQuestions={(next) =>
              onChangeSection({ ...section, questions: next })
            }
          />

          <Button
            variant="outline"
            className="mt-1 h-9 w-full border-dashed text-xs"
            onClick={onAddQuestion}
          >
            <CirclePlus className="h-3.5 w-3.5" /> Add question
          </Button>
        </>
      )}
    </SortableSectionShell>
  );
};
