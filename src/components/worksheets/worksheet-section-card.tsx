'use client';

import { CirclePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SectionLayoutConfig, WorksheetContent, WorksheetTheme } from '@/types/worksheet';
import { SortableSectionShell } from '@/components/worksheets/sortable-blocks';
import { SectionQuestionsDnd } from '@/components/worksheets/section-questions-dnd';
import type { PaletteItemType } from '@/components/worksheets/editor-dnd-types';

const inlineHeadingClass =
  'w-full border-0 bg-transparent p-0 font-semibold shadow-none outline-none ring-0 focus-visible:ring-0 placeholder:text-slate-400/60';

export const WorksheetSectionCard = ({
  section,
  sectionNumber,
  questionStartNumber,
  sectionPoints: _sectionPoints,
  isCollapsed,
  onChangeSection,
  onDuplicateSection,
  onDeleteSection,
  onAddQuestion,
  onDropPaletteItem,
  showDropTargets,
  sectionLayout,
  onSectionLayoutChange: _onSectionLayoutChange,
  showScoring,
  theme,
  selectedNodeId,
  onSelectNode,
}: {
  section: WorksheetContent['sections'][number];
  sectionNumber: number;
  questionStartNumber: number;
  sectionPoints: number;
  isCollapsed: boolean;
  onChangeSection: (next: WorksheetContent['sections'][number]) => void;
  onDuplicateSection: () => void;
  onDeleteSection: () => void;
  onAddQuestion: () => void;
  onDropPaletteItem: (type: PaletteItemType, insertIndex?: number) => void;
  showDropTargets: boolean;
  sectionLayout: SectionLayoutConfig;
  onSectionLayoutChange: (partial: Partial<SectionLayoutConfig>) => void;
  showScoring: boolean;
  theme: WorksheetTheme;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
}) => {
  const sectionNodeId = `section_${section.id}`;
  const isSectionSelected = selectedNodeId === sectionNodeId;

  return (
    <SortableSectionShell
      id={section.id}
      theme={theme}
      toolbarLabel={`S${sectionNumber}`}
      sortData={{ kind: 'section', sectionId: section.id }}
      isSelected={isSectionSelected}
      onDuplicate={onDuplicateSection}
      onDelete={onDeleteSection}
    >
      <div
        id={sectionNodeId}
        data-editor-node={sectionNodeId}
        className="space-y-2"
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          e.stopPropagation();
          onSelectNode(sectionNodeId);
        }}
      >
        <input
          value={section.heading}
          placeholder="New Section"
          className={inlineHeadingClass}
          style={{ color: theme.primaryColor, fontSize: theme.headingFontSize - 6 }}
          onMouseDown={(e) => {
            e.stopPropagation();
            onSelectNode(sectionNodeId);
          }}
          onChange={(e) =>
            onChangeSection({
              ...section,
              heading: e.target.value,
            })
          }
        />
        <hr
          className="border-0 border-t-2"
          style={{ borderColor: theme.primaryColor }}
        />
      </div>

      {!isCollapsed ? (
        <>
          <SectionQuestionsDnd
            section={section}
            questionStartNumber={questionStartNumber}
            onDropPaletteItem={onDropPaletteItem}
            showDropTargets={showDropTargets}
            sectionLayout={sectionLayout}
            showScoring={showScoring}
            theme={theme}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            onChangeQuestions={(next) =>
              onChangeSection({ ...section, questions: next })
            }
          />

          <Button
            variant="outline"
            className="mt-1 h-9 w-full border-dashed border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-700"
            onClick={onAddQuestion}
          >
            <CirclePlus className="h-3.5 w-3.5" /> Add question
          </Button>
        </>
      ) : null}
    </SortableSectionShell>
  );
};
