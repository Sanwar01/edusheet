'use client';

import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export const SortableSectionShell = ({
  id,
  children,
  sortData,
}: {
  id: string;
  children: ReactNode;
  sortData?: Record<string, unknown>;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: sortData });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-md border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="flex gap-2">
        <button
          type="button"
          className="h-9 shrink-0 cursor-grab rounded border border-slate-200 bg-slate-50 px-2 text-slate-600 active:cursor-grabbing"
          aria-label="Drag section"
          {...attributes}
          {...listeners}
        >
          ⋮⋮
        </button>
        <div className="min-w-0 flex-1 space-y-2">{children}</div>
      </div>
    </div>
  );
};

export const SortableQuestionShell = ({
  id,
  children,
  sortData,
}: {
  id: string;
  children: ReactNode;
  sortData?: Record<string, unknown>;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: sortData });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="max-w-full rounded border border-slate-100 bg-slate-50/60 p-2"
    >
      <div className="flex min-w-0 gap-2">
        <button
          type="button"
          className="mt-1 h-8 shrink-0 cursor-grab rounded border border-slate-200 bg-white px-1.5 text-xs text-slate-600 active:cursor-grabbing"
          aria-label="Drag question"
          {...attributes}
          {...listeners}
        >
          ⋮
        </button>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
};
