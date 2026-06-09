'use client';

import type { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
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
      <Field label="Text" htmlFor={`${baseId}_text`}>
        <Input
          id={`${baseId}_text`}
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder="Heading text"
        />
      </Field>
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
      <p className="text-xs text-muted-foreground">
        Adjust spacer height in the Appearance tab.
      </p>
    );
  }

  if (block.block_type === 'callout') {
    return (
      <Field label="Message" htmlFor={`${baseId}_co`}>
        <Textarea
          id={`${baseId}_co`}
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder="Callout text"
          rows={4}
        />
      </Field>
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
