'use client';

import type { ReactNode } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageBlockEditor } from '@/components/worksheets/image-block-editor';
import {
  structureBlockCalloutClass,
  structureBlockHeadingFontSize,
} from '@/components/worksheets/structure-block-preview';
import { cn } from '@/lib/utils';
import type { WorksheetStructureBlock, WorksheetTheme } from '@/types/worksheet';

const inlineFieldClass =
  'w-full border-0 bg-transparent p-0 shadow-none outline-none ring-0 focus-visible:ring-0 placeholder:text-slate-400/70';

function BlockSettingsRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mt-1.5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-1.5',
        className,
      )}
    >
      {children}
    </div>
  );
}

function SettingLabel({ children }: { children: ReactNode }) {
  return (
    <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
      {children}
    </span>
  );
}

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
  const baseId = `block_${block.id}`;
  const wrap = (node: ReactNode) => (
    <div className={cn(isGrid && 'col-span-full min-w-0', 'min-w-0')}>
      {node}
    </div>
  );

  if (block.block_type === 'heading') {
    const level = block.level ?? 3;
    const size = structureBlockHeadingFontSize(theme, level);
    return wrap(
      <>
        <input
          id={`${baseId}_text`}
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder="Heading"
          className={cn(inlineFieldClass, 'font-semibold')}
          style={{ fontSize: size, color: theme.textColor }}
        />
        {isSelected ? (
          <BlockSettingsRow>
            <SettingLabel>Level</SettingLabel>
            <Select
              value={String(level)}
              onValueChange={(v) =>
                onChange({
                  ...block,
                  level: Number(v) as 2 | 3 | 4,
                })
              }
            >
              <SelectTrigger className="h-7 w-[72px] border-slate-200 bg-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">H2</SelectItem>
                <SelectItem value="3">H3</SelectItem>
                <SelectItem value="4">H4</SelectItem>
              </SelectContent>
            </Select>
          </BlockSettingsRow>
        ) : null}
      </>,
    );
  }

  if (block.block_type === 'paragraph') {
    return wrap(
      <textarea
        id={`${baseId}_para`}
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
      <>
        <div
          aria-hidden
          className={cn(
            'w-full rounded-sm',
            isSelected && 'bg-slate-50/80 ring-1 ring-dashed ring-slate-200',
          )}
          style={{ height: h }}
        />
        {isSelected ? (
          <BlockSettingsRow>
            <SettingLabel>Height</SettingLabel>
            <input
              id={`${baseId}_sp`}
              type="number"
              min={8}
              max={200}
              step={4}
              value={h}
              onChange={(e) => {
                const n = Number(e.target.value);
                onChange({
                  ...block,
                  heightPx: Number.isNaN(n) ? 24 : Math.min(200, Math.max(8, n)),
                });
              }}
              className="h-7 w-16 rounded-md border border-slate-200 bg-white px-2 text-xs"
            />
            <span className="text-[10px] text-slate-400">px</span>
          </BlockSettingsRow>
        ) : null}
      </>,
    );
  }

  if (block.block_type === 'callout') {
    const tone = block.tone ?? 'info';
    return wrap(
      <>
        <div
          className={cn(
            'rounded-lg border px-3 py-2 text-sm',
            structureBlockCalloutClass[tone],
          )}
        >
          <textarea
            id={`${baseId}_co`}
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Callout"
            rows={Math.max(2, block.text.split('\n').length)}
            className={cn(
              inlineFieldClass,
              'resize-none leading-relaxed text-inherit',
            )}
          />
        </div>
        {isSelected ? (
          <BlockSettingsRow>
            <SettingLabel>Style</SettingLabel>
            <Select
              value={tone}
              onValueChange={(v) =>
                onChange({
                  ...block,
                  tone: v as 'info' | 'warning' | 'success',
                })
              }
            >
              <SelectTrigger className="h-7 w-[100px] border-slate-200 bg-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
          </BlockSettingsRow>
        ) : null}
      </>,
    );
  }

  if (block.block_type === 'image') {
    return wrap(
      <ImageBlockEditor
        block={block}
        baseId={baseId}
        theme={theme}
        variant="preview"
        showControls={isSelected}
        onChange={onChange}
      />,
    );
  }

  return null;
}
