'use client';

import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EditorNodeToolbar } from '@/components/worksheets/editor-node-toolbar';
import { cn } from '@/lib/utils';

type SortableShellProps = {
  id: string;
  children: ReactNode;
  sortData?: Record<string, unknown>;
  shellClassName?: string;
  editorNodeId?: string;
  isSelected?: boolean;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onSelect?: () => void;
  variant?: 'default' | 'block';
};

export const SortableSectionShell = ({
  id,
  children,
  sortData,
  shellClassName,
  editorNodeId,
  isSelected,
  onDuplicate,
  onDelete,
}: SortableShellProps) => {
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
      id={editorNodeId}
      data-editor-node={editorNodeId}
      className={cn(
        'relative rounded-md border bg-white p-3 transition-[border-color,box-shadow]',
        isSelected
          ? 'border-2 border-primary shadow-sm'
          : 'border-transparent shadow-none hover:border-slate-200 hover:shadow-sm',
        shellClassName,
      )}
    >
      {isSelected ? (
        <EditorNodeToolbar
          dragAttributes={attributes}
          dragListeners={listeners}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ) : null}
      <div className="min-w-0 space-y-2">{children}</div>
    </div>
  );
};

export const SortableQuestionShell = ({
  id,
  children,
  sortData,
  shellClassName,
  editorNodeId,
  isSelected,
  onDuplicate,
  onDelete,
  onSelect,
  variant = 'default',
}: SortableShellProps) => {
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

  const isBlock = variant === 'block';

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={editorNodeId}
      data-editor-node={editorNodeId}
      className={cn(
        'relative max-w-full rounded-md border',
        isBlock
          ? 'cursor-pointer bg-white p-3 transition-[border-color,box-shadow]'
          : 'bg-slate-50/60 p-2',
        isSelected
          ? 'border-2 border-primary shadow-sm'
          : isBlock
            ? 'border-transparent shadow-none hover:border-slate-200 hover:shadow-sm'
            : 'border-slate-100',
        shellClassName,
      )}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        onSelect?.();
      }}
    >
      {isSelected ? (
        <EditorNodeToolbar
          dragAttributes={attributes}
          dragListeners={listeners}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      ) : null}
      <div className="min-w-0">{children}</div>
    </div>
  );
};
