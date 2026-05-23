import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { WorksheetStructureBlock, WorksheetTheme } from '@/types/worksheet';

export const structureBlockCalloutClass: Record<
  NonNullable<Extract<WorksheetStructureBlock, { block_type: 'callout' }>['tone']>,
  string
> = {
  info: 'border-blue-200 bg-blue-50 text-slate-800',
  warning: 'border-amber-200 bg-amber-50 text-slate-900',
  success: 'border-emerald-200 bg-emerald-50 text-slate-900',
};

export function structureBlockHeadingFontSize(
  theme: WorksheetTheme,
  level: 2 | 3 | 4,
): number {
  return level === 2
    ? Math.max(theme.headingFontSize - 4, 18)
    : level === 3
      ? Math.max(theme.headingFontSize - 8, 16)
      : Math.max(theme.headingFontSize - 10, 14);
}

export function StructureBlockPreview({
  block,
  theme,
  isGrid,
}: {
  block: WorksheetStructureBlock;
  theme: WorksheetTheme;
  isGrid?: boolean;
}) {
  const wrap = (node: ReactNode) => (
    <div className={cn(isGrid && 'col-span-full min-w-0')}>{node}</div>
  );

  if (block.block_type === 'heading') {
    const level = block.level ?? 3;
    const size = structureBlockHeadingFontSize(theme, level);
    const Tag = level === 2 ? 'h3' : level === 3 ? 'h4' : 'h5';
    return wrap(
      <Tag
        className="font-semibold"
        style={{
          fontSize: size,
          color: theme.textColor,
        }}
      >
        {block.text.trim() || 'Heading'}
      </Tag>,
    );
  }

  if (block.block_type === 'paragraph') {
    return wrap(
      <p
        className="whitespace-pre-wrap leading-relaxed"
        style={{ color: theme.textColor, fontSize: theme.bodyFontSize }}
      >
        {block.text.trim() || 'Paragraph'}
      </p>,
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
    return wrap(<div aria-hidden className="w-full" style={{ height: h }} />);
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
        {block.text.trim() || 'Callout'}
      </div>,
    );
  }

  if (block.block_type === 'image') {
    const src = block.src.trim();
    return wrap(
      <figure className="space-y-1">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={block.alt || 'Worksheet image'}
            className="max-h-64 w-full rounded-md border border-slate-200 object-contain"
          />
        ) : (
          <div
            className="flex min-h-[120px] items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-sm"
            style={{ color: theme.answerTextColor }}
          >
            Image (add URL in the editor)
          </div>
        )}
        {block.alt.trim() ? (
          <figcaption
            className="text-center text-xs"
            style={{ color: theme.answerTextColor }}
          >
            {block.alt}
          </figcaption>
        ) : null}
      </figure>,
    );
  }

  return null;
}
