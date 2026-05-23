'use client';

import type { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SectionLayoutConfig, WorksheetSection } from '@/types/worksheet';

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

export function SectionInspector({
  section,
  sectionLayout,
  onChangeSection,
  onSectionLayoutChange,
}: {
  section: WorksheetSection;
  sectionLayout: SectionLayoutConfig;
  onChangeSection: (next: WorksheetSection) => void;
  onSectionLayoutChange: (partial: Partial<SectionLayoutConfig>) => void;
}) {
  return (
    <div className="space-y-4">
      <Field label="Section heading">
        <Input
          value={section.heading}
          placeholder="Section heading"
          onChange={(e) =>
            onChangeSection({ ...section, heading: e.target.value })
          }
        />
      </Field>

      <div className="space-y-3 rounded-lg border border-border/60 bg-secondary/40 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Question layout
        </p>
        <Field label="Layout mode">
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
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stack">Single column</SelectItem>
              <SelectItem value="grid">Grid</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        {sectionLayout.mode === 'grid' ? (
          <>
            <Field label="Columns">
              <Select
                value={String(sectionLayout.gridColumns ?? 2)}
                onValueChange={(v) =>
                  onSectionLayoutChange({
                    gridColumns: Number(v) as 2 | 3 | 4,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 columns</SelectItem>
                  <SelectItem value="3">3 columns</SelectItem>
                  <SelectItem value="4">4 columns</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Grid borders">
              <Select
                value={sectionLayout.border ?? 'none'}
                onValueChange={(value) =>
                  onSectionLayoutChange({
                    border: value as SectionLayoutConfig['border'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No border</SelectItem>
                  <SelectItem value="outer">Outer border</SelectItem>
                  <SelectItem value="cells">Cell borders</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </>
        ) : null}
      </div>
    </div>
  );
}
