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
        'relative rounded-md border bg-white p-3 shadow-sm',
        isSelected ? 'border-2 border-primary' : 'border-slate-200',
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
        'relative max-w-full rounded-md border bg-slate-50/60 p-2',
        isSelected ? 'border-2 border-primary' : 'border-slate-100',
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
      <div className="min-w-0">{children}</div>
    </div>
  );
};
