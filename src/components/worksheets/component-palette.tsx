'use client';

import { CirclePlus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  PALETTE_DRAG_MIME,
  type PaletteItemType,
} from '@/components/worksheets/editor-dnd-types';

type PaletteItem = {
  type: PaletteItemType;
  label: string;
  description: string;
};

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'section',
    label: 'Section',
    description: 'Add a new section block',
  },
  {
    type: 'multiple_choice',
    label: 'Multiple Choice',
    description: 'Question with answer options',
  },
  {
    type: 'short_answer',
    label: 'Short Answer',
    description: 'Question with line response',
  },
  {
    type: 'true_false',
    label: 'True / False',
    description: 'Question with fixed choices',
  },
  {
    type: 'fill_in_blank',
    label: 'Fill in the Blank',
    description: 'Question with blank response',
  },
  {
    type: 'essay',
    label: 'Essay',
    description: 'Question with long response',
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
    <div className="space-y-2">
      <p className="text-xs text-slate-500">
        Drag a component onto the worksheet, or click add.
      </p>
      {PALETTE_ITEMS.map((item) => (
        <div
          key={item.type}
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData(PALETTE_DRAG_MIME, item.type);
            event.dataTransfer.effectAllowed = 'copy';
            onDragStateChange?.(true);
          }}
          onDragEnd={() => onDragStateChange?.(false)}
          className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2 py-2"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">{item.label}</p>
            <p className="truncate text-xs text-slate-500">{item.description}</p>
          </div>
          <div className="flex items-center gap-1">
            <GripVertical className="h-4 w-4 text-slate-400" />
            <Button
              type="button"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={() => onAdd(item.type)}
            >
              <CirclePlus className="h-3.5 w-3.5" />
              Add
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
