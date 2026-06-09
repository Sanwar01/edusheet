'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EditorNodeToolbar } from '@/components/worksheets/editor-node-toolbar';
import { cn } from '@/lib/utils';
import type { WorksheetTheme } from '@/types/worksheet';

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
  theme: WorksheetTheme;
  toolbarLabel?: string;
};

function shellBorderStyle(
  isSelected: boolean,
  primaryColor: string,
): CSSProperties | undefined {
  if (!isSelected) return undefined;
  return { borderColor: primaryColor };
}

export const SortableSectionShell = ({
  id,
  children,
  sortData,
  shellClassName,
  isSelected,
  onDuplicate,
  onDelete,
  theme,
  toolbarLabel,
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
    ...shellBorderStyle(isSelected ?? false, theme.primaryColor),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative rounded-md border bg-white p-3 transition-[border-color,box-shadow]',
        isSelected
          ? 'border-2 shadow-sm'
          : 'border-transparent shadow-none hover:border-dashed hover:border-slate-300',
        shellClassName,
      )}
    >
      {isSelected ? (
        <EditorNodeToolbar
          dragAttributes={attributes}
          dragListeners={listeners}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          label={toolbarLabel}
          accentColor={theme.primaryColor}
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
  theme,
  toolbarLabel,
}: SortableShellProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, data: sortData });

  const isBlock = variant === 'block';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.92 : 1,
    ...shellBorderStyle(isSelected ?? false, theme.primaryColor),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      id={editorNodeId}
      data-editor-node={editorNodeId}
      className={cn(
        'relative max-w-full rounded-md border',
        isBlock ? 'cursor-pointer bg-white p-3' : 'bg-transparent p-2',
        'transition-[border-color,box-shadow]',
        isSelected
          ? 'border-2 shadow-sm'
          : 'border-transparent shadow-none hover:border-dashed hover:border-slate-300',
        shellClassName,
      )}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        onSelect?.();
      }}
    >
      {isSelected ? (
        <EditorNodeToolbar
          dragAttributes={attributes}
          dragListeners={listeners}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          label={toolbarLabel}
          accentColor={theme.primaryColor}
        />
      ) : null}
      <div className="min-w-0">{children}</div>
    </div>
  );
};
