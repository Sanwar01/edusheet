'use client';

import { Input } from '@/components/ui/input';
import type { WorksheetSection } from '@/types/worksheet';

export function SectionInspector({
  section,
  onChangeSection,
}: {
  section: WorksheetSection;
  onChangeSection: (next: WorksheetSection) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        Section heading
      </label>
      <Input
        value={section.heading}
        placeholder="Section heading"
        onChange={(e) =>
          onChangeSection({ ...section, heading: e.target.value })
        }
      />
    </div>
  );
}
