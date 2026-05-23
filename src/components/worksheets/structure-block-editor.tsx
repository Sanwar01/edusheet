'use client';

import type { ReactNode } from 'react';
import { ImageBlockEditor } from '@/components/worksheets/image-block-editor';
import {
  structureBlockCalloutClass,
  structureBlockHeadingFontSize,
} from '@/components/worksheets/structure-block-preview';
import { cn } from '@/lib/utils';
import type { WorksheetStructureBlock, WorksheetTheme } from '@/types/worksheet';

const inlineFieldClass =
  'w-full border-0 bg-transparent p-0 shadow-none outline-none ring-0 focus-visible:ring-0 placeholder:text-slate-400/70';

export function StructureBlockEditor({
  block,
  onChange,
  theme,
  isSelected = false,
  isGrid = false,
}: {
  block: WorksheetStructureBlock;
  onChange: (next: WorksheetStructureBlock) => void;
  theme: WorksheetTheme;
  isSelected?: boolean;
  isGrid?: boolean;
}) {
  const wrap = (node: ReactNode) => (
    <div className={cn(isGrid && 'col-span-full min-w-0', 'min-w-0')}>
      {node}
    </div>
  );

  if (block.block_type === 'heading') {
    const level = block.level ?? 3;
    const size = structureBlockHeadingFontSize(theme, level);
    return wrap(
      <input
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Heading"
        className={cn(inlineFieldClass, 'font-semibold')}
        style={{ fontSize: size, color: theme.textColor }}
      />,
    );
  }

  if (block.block_type === 'paragraph') {
    return wrap(
      <textarea
        value={block.text}
        onChange={(e) => onChange({ ...block, text: e.target.value })}
        placeholder="Paragraph"
        rows={Math.max(2, block.text.split('\n').length)}
        className={cn(inlineFieldClass, 'resize-none leading-relaxed')}
        style={{ color: theme.textColor, fontSize: theme.bodyFontSize }}
      />,
    );
  }

  if (block.block_type === 'divider') {
    return wrap(
      <hr
        className="my-2 border-0 border-t-2"
        style={{ borderColor: theme.primaryColor }}
      />,
    );
  }

  if (block.block_type === 'spacer') {
    const h = block.heightPx ?? 24;
    return wrap(
      <div
        aria-hidden
        className={cn(
          'w-full rounded-sm',
          isSelected && 'bg-slate-50/80 ring-1 ring-dashed ring-slate-200',
        )}
        style={{ height: h }}
      />,
    );
  }

  if (block.block_type === 'callout') {
    const tone = block.tone ?? 'info';
    return wrap(
      <div
        className={cn(
          'rounded-lg border px-3 py-2 text-sm',
          structureBlockCalloutClass[tone],
        )}
      >
        <textarea
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder="Callout"
          rows={Math.max(2, block.text.split('\n').length)}
          className={cn(
            inlineFieldClass,
            'resize-none leading-relaxed text-inherit',
          )}
        />
      </div>,
    );
  }

  if (block.block_type === 'image') {
    return wrap(
      <ImageBlockEditor
        block={block}
        baseId={`block_${block.id}`}
        theme={theme}
        variant="preview"
        showControls={false}
        onChange={onChange}
      />,
    );
  }

  return null;
}
