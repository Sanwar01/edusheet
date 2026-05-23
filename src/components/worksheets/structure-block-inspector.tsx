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
import { Textarea } from '@/components/ui/textarea';
import { ImageBlockEditor } from '@/components/worksheets/image-block-editor';
import type { WorksheetStructureBlock } from '@/types/worksheet';

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium text-muted-foreground"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function StructureBlockInspector({
  block,
  onChange,
}: {
  block: WorksheetStructureBlock;
  onChange: (next: WorksheetStructureBlock) => void;
}) {
  const baseId = `inspector_block_${block.id}`;

  if (block.block_type === 'heading') {
    return (
      <div className="space-y-3">
        <Field label="Text" htmlFor={`${baseId}_text`}>
          <Input
            id={`${baseId}_text`}
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Heading text"
          />
        </Field>
        <Field label="Level" htmlFor={`${baseId}_level`}>
          <Select
            value={String(block.level ?? 3)}
            onValueChange={(v) =>
              onChange({
                ...block,
                level: Number(v) as 2 | 3 | 4,
              })
            }
          >
            <SelectTrigger id={`${baseId}_level`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">Heading 2</SelectItem>
              <SelectItem value="3">Heading 3</SelectItem>
              <SelectItem value="4">Heading 4</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    );
  }

  if (block.block_type === 'paragraph') {
    return (
      <Field label="Text" htmlFor={`${baseId}_para`}>
        <Textarea
          id={`${baseId}_para`}
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder="Paragraph text"
          rows={5}
        />
      </Field>
    );
  }

  if (block.block_type === 'divider') {
    return (
      <p className="text-xs text-muted-foreground">
        Dividers have no settings. They appear as a horizontal rule in the
        worksheet.
      </p>
    );
  }

  if (block.block_type === 'spacer') {
    return (
      <Field label="Height (px)" htmlFor={`${baseId}_sp`}>
        <Input
          id={`${baseId}_sp`}
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
      </Field>
    );
  }

  if (block.block_type === 'callout') {
    return (
      <div className="space-y-3">
        <Field label="Style" htmlFor={`${baseId}_tone`}>
          <Select
            value={block.tone ?? 'info'}
            onValueChange={(v) =>
              onChange({
                ...block,
                tone: v as 'info' | 'warning' | 'success',
              })
            }
          >
            <SelectTrigger id={`${baseId}_tone`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="success">Success</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Message" htmlFor={`${baseId}_co`}>
          <Textarea
            id={`${baseId}_co`}
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Callout text"
            rows={4}
          />
        </Field>
      </div>
    );
  }

  if (block.block_type === 'image') {
    return (
      <ImageBlockEditor
        block={block}
        baseId={baseId}
        variant="form"
        onChange={onChange}
      />
    );
  }

  return null;
}
