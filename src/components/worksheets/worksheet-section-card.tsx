'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { WorksheetContent } from '@/types/worksheet';
import { SortableSectionShell } from '@/components/worksheets/sortable-blocks';
import { SectionQuestionsDnd } from '@/components/worksheets/section-questions-dnd';

export const WorksheetSectionCard = ({
  section,
  onChangeSection,
  onDuplicateSection,
  onDeleteSection,
}: {
  section: WorksheetContent['sections'][number];
  onChangeSection: (next: WorksheetContent['sections'][number]) => void;
  onDuplicateSection: () => void;
  onDeleteSection: () => void;
}) => {
  return (
    <SortableSectionShell id={section.id}>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="min-w-[200px] flex-1 font-medium"
          value={section.heading}
          onChange={(e) =>
            onChangeSection({
              ...section,
              heading: e.target.value,
            })
          }
        />
        <Button
          variant="outline"
          className="px-3 py-1.5 text-xs"
          onClick={onDuplicateSection}
        >
          Duplicate
        </Button>
        <Button
          variant="destructive"
          className="px-3 py-1.5 text-xs"
          onClick={onDeleteSection}
        >
          Delete
        </Button>
      </div>

      <SectionQuestionsDnd
        section={section}
        onChangeQuestions={(next) =>
          onChangeSection({ ...section, questions: next })
        }
      />
    </SortableSectionShell>
  );
};
