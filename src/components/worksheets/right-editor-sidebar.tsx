'use client';

import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { PanelRightClose, SlidersHorizontal, SquareMousePointer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorInspectorPanel } from '@/components/worksheets/editor-inspector-panel';
import { ThemeSettingsSidebar } from '@/components/worksheets/theme-settings-sidebar';
import { cn } from '@/lib/utils';
import type {
  SectionLayoutConfig,
  WorksheetContent,
  WorksheetLayout,
  WorksheetSection,
  WorksheetTheme,
} from '@/types/worksheet';

export type RightSidebarTab = 'inspector' | 'appearance';

export function RightEditorSidebar({
  tab,
  setTab,
  theme,
  setTheme,
  content,
  layout,
  selectedNodeId,
  showScoring,
  onContentChange,
  onUpdateSection,
  onUpdateSectionLayout,
  onClose,
}: {
  tab: RightSidebarTab;
  setTab: (tab: RightSidebarTab) => void;
  theme: WorksheetTheme;
  setTheme: Dispatch<SetStateAction<WorksheetTheme>>;
  content: WorksheetContent;
  layout: WorksheetLayout;
  selectedNodeId: string | null;
  showScoring: boolean;
  onContentChange: (
    updater: WorksheetContent | ((prev: WorksheetContent) => WorksheetContent),
  ) => void;
  onUpdateSection: (
    sectionId: string,
    updater: (section: WorksheetSection) => WorksheetSection,
  ) => void;
  onUpdateSectionLayout: (
    sectionId: string,
    partial: Partial<SectionLayoutConfig>,
  ) => void;
  onClose?: () => void;
}) {
  useEffect(() => {
    if (selectedNodeId) setTab('inspector');
  }, [selectedNodeId, setTab]);

  return (
    <aside className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 space-y-3 border-b border-border p-4 pb-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-foreground">Right panel</p>
          <Button
            type="button"
            variant="ghost"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={onClose}
          >
            <PanelRightClose className="h-3.5 w-3.5" />
            Close
          </Button>
        </div>

        <div className="flex gap-1 rounded-md border border-border bg-muted/50 p-1">
          <Button
            type="button"
            variant={tab === 'inspector' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'h-8 flex-1 gap-1.5 text-xs font-medium',
              tab !== 'inspector' && 'text-muted-foreground',
            )}
            onClick={() => setTab('inspector')}
          >
            <SquareMousePointer className="h-3.5 w-3.5 shrink-0" />
            Inspector
          </Button>
          <Button
            type="button"
            variant={tab === 'appearance' ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'h-8 flex-1 gap-1.5 text-xs font-medium',
              tab !== 'appearance' && 'text-muted-foreground',
            )}
            onClick={() => setTab('appearance')}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" />
            Appearance
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        {tab === 'inspector' ? (
          <EditorInspectorPanel
            content={content}
            layout={layout}
            selectedNodeId={selectedNodeId}
            showScoring={showScoring}
            onContentChange={onContentChange}
            onUpdateSection={onUpdateSection}
            onUpdateSectionLayout={onUpdateSectionLayout}
          />
        ) : (
          <ThemeSettingsSidebar
            theme={theme}
            setTheme={setTheme}
            embedded
          />
        )}
      </div>
    </aside>
  );
}
