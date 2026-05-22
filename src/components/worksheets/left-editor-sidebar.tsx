'use client';

import type { ReactNode } from 'react';
import { LayoutGrid, ListTree, PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WorksheetContent } from '@/types/worksheet';
import { isWorksheetQuestion } from '@/types/worksheet';
import type { PaletteItemType } from '@/components/worksheets/editor-dnd-types';
import { ComponentPalette } from '@/components/worksheets/component-palette';

type SidebarTab = 'structure' | 'blocks';

function SidebarNavButton({
  isSelected,
  textSize = 'sm',
  onClick,
  children,
}: {
  isSelected: boolean;
  textSize?: 'sm' | 'xs';
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant={isSelected ? 'secondary' : 'ghost'}
      className={cn(
        'h-auto w-full justify-start px-2 py-1.5 text-left font-normal',
        textSize === 'xs' ? 'text-xs' : 'text-sm',
        isSelected
          ? 'font-medium text-foreground'
          : 'text-muted-foreground hover:bg-secondary/60',
      )}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function LeftEditorSidebar({
  tab,
  setTab,
  content,
  selectedNodeId,
  onSelectNode,
  onAddFromPalette,
  onPaletteDragStateChange,
  onClose,
}: {
  tab: SidebarTab;
  setTab: (tab: SidebarTab) => void;
  content: WorksheetContent;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  onAddFromPalette: (type: PaletteItemType) => void;
  onPaletteDragStateChange?: (isDragging: boolean) => void;
  onClose?: () => void;
}) {
  return (
    <aside className="hidden min-h-0 flex-1 flex-col border-r border-border bg-background lg:flex">
      <div className="shrink-0 border-b border-border p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <div className="flex items-center justify-between gap-2">
            <span>Worksheet panel</span>
            <Button
              type="button"
              variant="ghost"
              className="h-7 px-2 text-xs text-muted-foreground"
              onClick={onClose}
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
              Close
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={tab === 'structure' ? 'default' : 'outline'}
            className="h-8 flex-1 text-xs"
            onClick={() => setTab('structure')}
          >
            <ListTree className="h-3.5 w-3.5" />
            Structure
          </Button>
          <Button
            type="button"
            variant={tab === 'blocks' ? 'default' : 'outline'}
            className="h-8 flex-1 text-xs"
            onClick={() => setTab('blocks')}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Blocks
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-3">
        {tab === 'structure' ? (
          <div className="space-y-3">
            <SidebarNavButton
              isSelected={selectedNodeId === 'worksheet_title'}
              onClick={() => onSelectNode('worksheet_title')}
            >
              Worksheet title
            </SidebarNavButton>
            <SidebarNavButton
              isSelected={selectedNodeId === 'worksheet_instructions'}
              onClick={() => onSelectNode('worksheet_instructions')}
            >
              Instructions
            </SidebarNavButton>
            <div className="border-t border-border pt-2">
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sections
              </p>
              <div className="mt-2 space-y-2">
                {content.sections.map((section, index) => (
                  <div key={section.id} className="space-y-1">
                    <SidebarNavButton
                      isSelected={selectedNodeId === `section_${section.id}`}
                      onClick={() => onSelectNode(`section_${section.id}`)}
                    >
                      {index + 1}. {section.heading || 'Untitled section'}
                    </SidebarNavButton>
                    <div className="space-y-1 pl-3">
                      {section.questions.map((row, qIndex) => {
                        const label = isWorksheetQuestion(row)
                          ? row.prompt || 'Untitled question'
                          : row.block_type === 'heading'
                            ? row.text.trim() || 'Heading'
                            : row.block_type === 'paragraph'
                              ? (() => {
                                  const t = row.text.trim();
                                  if (!t) return 'Paragraph';
                                  return t.length > 48
                                    ? `${t.slice(0, 48)}…`
                                    : t;
                                })()
                              : row.block_type === 'callout'
                                ? (() => {
                                    const t = row.text.trim();
                                    if (!t) return 'Callout';
                                    return t.length > 48
                                      ? `${t.slice(0, 48)}…`
                                      : t;
                                  })()
                                : row.block_type === 'image'
                                  ? row.src.trim()
                                    ? 'Image'
                                    : 'Image (no URL)'
                                  : row.block_type === 'divider'
                                    ? 'Divider'
                                    : `Spacer (${row.heightPx ?? 24}px)`;
                        const nodeId = isWorksheetQuestion(row)
                          ? `question_${row.id}`
                          : `block_${row.id}`;
                        return (
                          <SidebarNavButton
                            key={row.id}
                            isSelected={selectedNodeId === nodeId}
                            textSize="xs"
                            onClick={() => onSelectNode(nodeId)}
                          >
                            {!isWorksheetQuestion(row) ? '◆ ' : ''}
                            {qIndex + 1}. {label}
                          </SidebarNavButton>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ComponentPalette
            onAdd={onAddFromPalette}
            onDragStateChange={onPaletteDragStateChange}
          />
        )}
      </div>
    </aside>
  );
}
