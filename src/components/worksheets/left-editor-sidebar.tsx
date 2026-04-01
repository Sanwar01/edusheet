'use client';

import { ListTree, PanelLeftClose, Shapes } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WorksheetContent } from '@/types/worksheet';
import type { PaletteItemType } from '@/components/worksheets/editor-dnd-types';
import { ComponentPalette } from '@/components/worksheets/component-palette';

type SidebarTab = 'structure' | 'components';

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
    <aside className="hidden h-full w-72 shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="border-b border-slate-200 p-3">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <div className="flex items-center justify-between gap-2">
            <span>Worksheet panel</span>
            <Button
              type="button"
              variant="ghost"
              className="h-7 px-2 text-xs text-slate-600"
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
            variant={tab === 'components' ? 'default' : 'outline'}
            className="h-8 flex-1 text-xs"
            onClick={() => setTab('components')}
          >
            <Shapes className="h-3.5 w-3.5" />
            Components
          </Button>
        </div>
      </div>

      <div className="h-[calc(100%-84px)] overflow-auto p-3">
        {tab === 'structure' ? (
          <div className="space-y-3">
            <button
              type="button"
              className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${selectedNodeId === 'worksheet_title' ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
              onClick={() => onSelectNode('worksheet_title')}
            >
              Worksheet title
            </button>
            <button
              type="button"
              className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${selectedNodeId === 'worksheet_instructions' ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
              onClick={() => onSelectNode('worksheet_instructions')}
            >
              Instructions
            </button>
            <div className="border-t border-slate-200 pt-2">
              <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Sections
              </p>
              <div className="mt-2 space-y-2">
                {content.sections.map((section, index) => (
                  <div key={section.id} className="space-y-1">
                    <button
                      type="button"
                      className={`w-full rounded-md px-2 py-1.5 text-left text-sm ${selectedNodeId === `section_${section.id}` ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-700 hover:bg-slate-50'}`}
                      onClick={() => onSelectNode(`section_${section.id}`)}
                    >
                      {index + 1}. {section.heading || 'Untitled section'}
                    </button>
                    <div className="space-y-1 pl-3">
                      {section.questions.map((question, qIndex) => (
                        <button
                          key={question.id}
                          type="button"
                          className={`w-full rounded-md px-2 py-1.5 text-left text-xs ${selectedNodeId === `question_${question.id}` ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
                          onClick={() =>
                            onSelectNode(`question_${question.id}`)
                          }
                        >
                          {qIndex + 1}. {question.prompt || 'Untitled question'}
                        </button>
                      ))}
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
