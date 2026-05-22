'use client';

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

export function StructureBlockEditor({
  block,
  onChange,
}: {
  block: WorksheetStructureBlock;
  onChange: (next: WorksheetStructureBlock) => void;
}) {
  const baseId = `block_${block.id}`;

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {block.block_type === 'heading'
          ? 'Heading'
          : block.block_type === 'paragraph'
            ? 'Paragraph'
            : block.block_type === 'divider'
              ? 'Divider'
              : block.block_type === 'spacer'
                ? 'Spacer'
                : block.block_type === 'callout'
                  ? 'Callout'
                  : 'Image'}
      </span>

      {block.block_type === 'heading' ? (
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[100px] flex-1">
            <label htmlFor={`${baseId}_text`} className="mb-1 block text-[11px] text-slate-500">
              Text
            </label>
            <Input
              id={`${baseId}_text`}
              value={block.text}
              onChange={(e) => onChange({ ...block, text: e.target.value })}
              placeholder="Heading text"
              className="border-slate-200"
            />
          </div>
          <div className="w-[88px]">
            <label htmlFor={`${baseId}_level`} className="mb-1 block text-[11px] text-slate-500">
              Level
            </label>
            <Select
              value={String(block.level ?? 3)}
              onValueChange={(v) =>
                onChange({
                  ...block,
                  level: Number(v) as 2 | 3 | 4,
                })
              }
            >
              <SelectTrigger id={`${baseId}_level`} className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">H2</SelectItem>
                <SelectItem value="3">H3</SelectItem>
                <SelectItem value="4">H4</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}

      {block.block_type === 'paragraph' ? (
        <div>
          <label htmlFor={`${baseId}_para`} className="mb-1 block text-[11px] text-slate-500">
            Text
          </label>
          <Textarea
            id={`${baseId}_para`}
            value={block.text}
            onChange={(e) => onChange({ ...block, text: e.target.value })}
            placeholder="Paragraph text"
            rows={4}
            className="border-slate-200 text-sm"
          />
        </div>
      ) : null}

      {block.block_type === 'divider' ? (
        <p className="text-xs text-slate-500">
          A horizontal rule is shown between questions. No extra settings.
        </p>
      ) : null}

      {block.block_type === 'spacer' ? (
        <div>
          <label htmlFor={`${baseId}_sp`} className="mb-1 block text-[11px] text-slate-500">
            Height (px)
          </label>
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
            className="max-w-[120px] border-slate-200"
          />
        </div>
      ) : null}

      {block.block_type === 'callout' ? (
        <div className="space-y-2">
          <div>
            <label htmlFor={`${baseId}_tone`} className="mb-1 block text-[11px] text-slate-500">
              Style
            </label>
            <Select
              value={block.tone ?? 'info'}
              onValueChange={(v) =>
                onChange({
                  ...block,
                  tone: v as 'info' | 'warning' | 'success',
                })
              }
            >
              <SelectTrigger id={`${baseId}_tone`} className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor={`${baseId}_co`} className="mb-1 block text-[11px] text-slate-500">
              Message
            </label>
            <Textarea
              id={`${baseId}_co`}
              value={block.text}
              onChange={(e) => onChange({ ...block, text: e.target.value })}
              placeholder="Callout text"
              rows={3}
              className="border-slate-200 text-sm"
            />
          </div>
        </div>
      ) : null}

      {block.block_type === 'image' ? (
        <ImageBlockEditor
          block={block}
          baseId={baseId}
          onChange={onChange}
        />
      ) : null}
    </div>
  );
}
