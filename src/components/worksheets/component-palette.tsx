'use client';

import type { LucideIcon } from 'lucide-react';
import {
  AlignLeft,
  FileText,
  Heading,
  Image as ImageIcon,
  LayoutTemplate,
  Link2,
  ListChecks,
  Megaphone,
  Minus,
  MoveVertical,
  Parentheses,
  SplitSquareHorizontal,
  Type,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PALETTE_DRAG_MIME,
  type PaletteItemType,
} from '@/components/worksheets/editor-dnd-types';

type PaletteItem = {
  type: PaletteItemType;
  label: string;
  description: string;
  Icon: LucideIcon;
};

const BLOCK_GROUPS: { id: string; title: string; items: PaletteItem[] }[] = [
  {
    id: 'structure',
    title: 'Structure',
    items: [
      {
        type: 'section',
        label: 'Section',
        description: 'Group questions into a titled block',
        Icon: LayoutTemplate,
      },
      {
        type: 'heading',
        label: 'Heading',
        description: 'Section title or subheading',
        Icon: Heading,
      },
      {
        type: 'paragraph',
        label: 'Paragraph',
        description: 'Body text or directions',
        Icon: AlignLeft,
      },
      {
        type: 'divider',
        label: 'Divider',
        description: 'Horizontal rule between content',
        Icon: Minus,
      },
      {
        type: 'spacer',
        label: 'Spacer',
        description: 'Vertical whitespace',
        Icon: MoveVertical,
      },
      {
        type: 'callout',
        label: 'Callout',
        description: 'Highlighted note or tip',
        Icon: Megaphone,
      },
      {
        type: 'image',
        label: 'Image',
        description: 'Picture from a URL',
        Icon: ImageIcon,
      },
    ],
  },
  {
    id: 'questions',
    title: 'Questions',
    items: [
      {
        type: 'multiple_choice',
        label: 'Multiple choice',
        description: 'Pick one correct answer',
        Icon: ListChecks,
      },
      {
        type: 'short_answer',
        label: 'Short answer',
        description: 'Brief written response',
        Icon: Type,
      },
      {
        type: 'true_false',
        label: 'True / false',
        description: 'Two fixed options',
        Icon: SplitSquareHorizontal,
      },
      {
        type: 'fill_in_blank',
        label: 'Fill in the blank',
        description: 'Complete a sentence or phrase',
        Icon: Parentheses,
      },
      {
        type: 'matching',
        label: 'Matching',
        description: 'Match items in two lists',
        Icon: Link2,
      },
      {
        type: 'essay',
        label: 'Essay',
        description: 'Longer written response',
        Icon: FileText,
      },
    ],
  },
];

export function ComponentPalette({
  onAdd,
  onDragStateChange,
}: {
  onAdd: (type: PaletteItemType) => void;
  onDragStateChange?: (isDragging: boolean) => void;
}) {
  return (
    <div className="space-y-5">
      <p className="text-xs leading-relaxed text-muted-foreground">
        Drag blocks onto a drop target on the canvas, or use{' '}
        <span className="font-medium text-foreground">Add</span> to append to
        the first section (a section is created automatically if needed).
      </p>

      {BLOCK_GROUPS.map((group) => (
        <div key={group.id}>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {group.title}
          </p>
          <div
            className="grid grid-cols-2 gap-2"
            onClick={() => onAdd(group.items[0].type)}
          >
            {group.items.map((item) => {
              const Icon = item.Icon;
              return (
                <div
                  key={item.type}
                  draggable
                  title={item.description}
                  onDragStart={(event) => {
                    event.dataTransfer.setData(PALETTE_DRAG_MIME, item.type);
                    event.dataTransfer.effectAllowed = 'copy';
                    onDragStateChange?.(true);
                  }}
                  onDragEnd={() => onDragStateChange?.(false)}
                  className={cn(
                    'group relative flex flex-col items-center gap-2 rounded-lg border border-border bg-card px-2 py-3 shadow-sm',
                    'cursor-grab active:cursor-grabbing',
                    'transition-colors hover:border-primary',
                  )}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground group-hover:text-foreground"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5 group-hover:text-primary" />
                  </div>
                  <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight text-foreground group-hover:text-primary">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
