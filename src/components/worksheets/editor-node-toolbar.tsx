'use client';

import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import { Copy, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function EditorNodeToolbar({
  dragAttributes,
  dragListeners,
  onDuplicate,
  onDelete,
  className,
}: {
  dragAttributes?: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
  onDuplicate?: () => void;
  onDelete?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'absolute -top-3.5 right-3 z-10 flex items-center rounded-md border border-slate-200 bg-slate-50 p-0.5 shadow-sm',
        className,
      )}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 cursor-grab text-slate-600 active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...dragAttributes}
        {...dragListeners}
      >
        <GripVertical className="h-4 w-4" />
      </Button>
      {onDuplicate ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-600"
          aria-label="Duplicate"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-600 hover:text-rose-600"
          aria-label="Delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
