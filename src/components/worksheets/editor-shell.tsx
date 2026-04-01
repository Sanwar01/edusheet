'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { PanelLeftOpen, PanelRightOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  SectionLayoutConfig,
  WorksheetContent,
  WorksheetLayout,
  WorksheetTheme,
} from '@/types/worksheet';
import { buildWorksheetLayout, defaultSectionLayout } from '@/features/worksheets/layout';
import { EditorToolbar } from './editor-toolbar';
import { ThemeSettingsSidebar } from './theme-settings-sidebar';
import { WorksheetContentSchema } from '@/lib/validators/worksheet';
import { LeftEditorSidebar } from '@/components/worksheets/left-editor-sidebar';
import type { PaletteItemType } from '@/components/worksheets/editor-dnd-types';
import {
  fontFamilyClassMap,
  questionSpacingClassMap,
  sectionSpacingClassMap,
} from '@/features/worksheets/editor/theme/class-maps';
import {
  getCompletion,
  getPointsBySection,
  getPointsTotal,
  isWorksheetBlank,
} from '@/features/worksheets/editor/selectors/editor-selectors';
import { useEditorLifecycle } from '@/features/worksheets/editor/hooks/use-editor-lifecycle';
import { useWorksheetPersistence } from '@/features/worksheets/editor/hooks/use-worksheet-persistence';
import {
  addFromPalette as addFromPaletteAction,
  addQuestionFromPaletteToSection as addQuestionFromPaletteToSectionAction,
  addQuestionToSection as addQuestionToSectionAction,
  addSection as addSectionAction,
  deleteSection as deleteSectionAction,
  duplicateSection as duplicateSectionAction,
  insertSectionAt as insertSectionAtAction,
  moveSections,
  updateSection,
} from '@/features/worksheets/editor/domain/worksheet-actions';
import { EditorPreviewPane } from '@/components/worksheets/editor-preview-pane';
import { EditorEditPane } from '@/components/worksheets/editor-edit-pane';

type EditorSnapshot = {
  content: WorksheetContent;
  theme: WorksheetTheme;
  sectionLayoutOverrides: Record<string, SectionLayoutConfig>;
  sectionCollapsed: Record<string, boolean>;
  showAnswerKey: boolean;
};

type EditorHistory = {
  past: EditorSnapshot[];
  future: EditorSnapshot[];
};

export const EditorShell = ({
  worksheetId,
  initialContent,
  initialTheme,
  initialLayout,
}: {
  worksheetId?: string;
  initialContent: WorksheetContent;
  initialTheme: WorksheetTheme;
  initialLayout: WorksheetLayout;
}) => {
  const [resolvedWorksheetId, setResolvedWorksheetId] = useState<string | null>(
    worksheetId ?? null,
  );
  const [content, setContent] = useState(initialContent);
  const [theme, setTheme] = useState(initialTheme);
  const [sectionLayoutOverrides, setSectionLayoutOverrides] = useState<
    Record<string, SectionLayoutConfig>
  >(() => ({ ...initialLayout.sectionLayouts }));
  const [showThemeSidebar, setShowThemeSidebar] = useState(true);
  const [showWorksheetSidebar, setShowWorksheetSidebar] = useState(true);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [leftTab, setLeftTab] = useState<'structure' | 'components'>(
    'structure',
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isPaletteDragging, setIsPaletteDragging] = useState(false);
  const [sectionCollapsed, setSectionCollapsed] = useState<
    Record<string, boolean>
  >({});
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [isDirty, setIsDirty] = useState(false);
  const restoringHistoryRef = useRef(false);
  const [history, setHistory] = useState<EditorHistory>({
    past: [],
    future: [],
  });
  const contentRef = useRef(content);
  const themeRef = useRef(theme);
  const sectionLayoutOverridesRef = useRef(sectionLayoutOverrides);
  const sectionCollapsedRef = useRef(sectionCollapsed);
  const showAnswerKeyRef = useRef(showAnswerKey);

  const completion = useMemo(() => getCompletion(content), [content]);
  const isBlankWorksheet = useMemo(
    () => isWorksheetBlank(content) && completion.questionCount === 0,
    [completion.questionCount, content],
  );
  const contentFontClass = fontFamilyClassMap[theme.fontFamily];
  const sectionSpacingClass = sectionSpacingClassMap[theme.spacingPreset];
  const questionSpacingClass = questionSpacingClassMap[theme.spacingPreset];
  const pointsBySection = useMemo(() => getPointsBySection(content), [content]);
  const pointsTotal = useMemo(
    () => getPointsTotal(pointsBySection),
    [pointsBySection],
  );

  const layout = useMemo(
    () =>
      buildWorksheetLayout(content, theme.spacingPreset, {
        sectionOrder: [],
        questionOrderBySection: {},
        spacingPreset: theme.spacingPreset,
        sectionLayouts: sectionLayoutOverrides,
      }),
    [content, theme.spacingPreset, sectionLayoutOverrides],
  );

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    sectionLayoutOverridesRef.current = sectionLayoutOverrides;
  }, [sectionLayoutOverrides]);

  useEffect(() => {
    sectionCollapsedRef.current = sectionCollapsed;
  }, [sectionCollapsed]);

  useEffect(() => {
    showAnswerKeyRef.current = showAnswerKey;
  }, [showAnswerKey]);

  const toSnapshot = useCallback((): EditorSnapshot => {
    return {
      content: JSON.parse(
        JSON.stringify(contentRef.current),
      ) as WorksheetContent,
      theme: { ...themeRef.current },
      sectionLayoutOverrides: JSON.parse(
        JSON.stringify(sectionLayoutOverridesRef.current),
      ) as Record<string, SectionLayoutConfig>,
      sectionCollapsed: { ...sectionCollapsedRef.current },
      showAnswerKey: showAnswerKeyRef.current,
    };
  }, []);

  const recordHistory = useCallback(() => {
    if (restoringHistoryRef.current) return;
    const snapshot = toSnapshot();
    setHistory((prev) => ({
      past: [...prev.past, snapshot].slice(-40),
      future: [],
    }));
  }, [toSnapshot]);

  const restoreSnapshot = useCallback((snapshot: EditorSnapshot) => {
    restoringHistoryRef.current = true;
    setContent(snapshot.content);
    setTheme(snapshot.theme);
    setSectionLayoutOverrides(snapshot.sectionLayoutOverrides);
    setSectionCollapsed(snapshot.sectionCollapsed);
    setShowAnswerKey(snapshot.showAnswerKey);
    setIsDirty(true);
    setTimeout(() => {
      restoringHistoryRef.current = false;
    }, 0);
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      const previous = prev.past[prev.past.length - 1];
      const current = toSnapshot();
      restoreSnapshot(previous);
      return {
        past: prev.past.slice(0, -1),
        future: [current, ...prev.future].slice(0, 40),
      };
    });
  }, [restoreSnapshot, toSnapshot]);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      const [next, ...restFuture] = prev.future;
      const current = toSnapshot();
      restoreSnapshot(next);
      return {
        past: [...prev.past, current].slice(-40),
        future: restFuture,
      };
    });
  }, [restoreSnapshot, toSnapshot]);

  const markDirty = () => {
    setIsDirty(true);
  };

  const setContentWithHistory = useCallback(
    (
      updater:
        | WorksheetContent
        | ((prev: WorksheetContent) => WorksheetContent),
    ) => {
      recordHistory();
      setContent((prev) =>
        typeof updater === 'function'
          ? (updater as (prev: WorksheetContent) => WorksheetContent)(prev)
          : updater,
      );
      markDirty();
    },
    [recordHistory],
  );

  const setThemeWithHistory = useCallback(
    (next: WorksheetTheme | ((prev: WorksheetTheme) => WorksheetTheme)) => {
      recordHistory();
      setTheme((prev) =>
        typeof next === 'function'
          ? (next as (prev: WorksheetTheme) => WorksheetTheme)(prev)
          : next,
      );
      markDirty();
    },
    [recordHistory],
  );

  const updateSectionLayout = useCallback(
    (sectionId: string, partial: Partial<SectionLayoutConfig>) => {
      recordHistory();
      setSectionLayoutOverrides((prev) => {
        const cur = prev[sectionId] ?? defaultSectionLayout();
        return { ...prev, [sectionId]: { ...cur, ...partial } };
      });
      markDirty();
    },
    [recordHistory],
  );

  const validateContentForSave = useCallback(() => {
    const result = WorksheetContentSchema.safeParse(content);
    if (result.success) return null;
    const flattened = result.error.flatten();
    const fieldMessage =
      flattened.fieldErrors.title?.[0] ??
      flattened.fieldErrors.sections?.[0] ??
      flattened.formErrors[0] ??
      'Please fix worksheet validation errors before saving.';
    return fieldMessage;
  }, [content]);

  const updateSectionById = useCallback(
    (
      sectionId: string,
      updater: (
        section: WorksheetContent['sections'][number],
      ) => WorksheetContent['sections'][number],
    ) => {
      setContentWithHistory((prev) => updateSection(prev, sectionId, updater));
    },
    [setContentWithHistory],
  );

  const onSectionsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = content.sections.findIndex((s) => s.id === active.id);
    const newIndex = content.sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    setContentWithHistory((prev) => moveSections(prev, oldIndex, newIndex));
  };

  const addSection = () => {
    setContentWithHistory((prev) => {
      const next = addSectionAction(prev);
      setSectionCollapsed((collapsed) => ({ ...collapsed, [next.sectionId]: false }));
      return next.content;
    });
  };

  const insertSectionAt = (insertIndex: number) => {
    setContentWithHistory((prev) => {
      const next = insertSectionAtAction(prev, insertIndex);
      setSectionCollapsed((collapsed) => ({ ...collapsed, [next.sectionId]: false }));
      return next.content;
    });
  };

  const addQuestionToSection = (sectionId: string) => {
    setContentWithHistory((prev) => addQuestionToSectionAction(prev, sectionId));
  };

  const addFromPalette = (type: PaletteItemType) => {
    setContentWithHistory((prev) => {
      const next = addFromPaletteAction(prev, type);
      if (next.openedSectionId) {
        setSectionCollapsed((collapsed) => ({
          ...collapsed,
          [next.openedSectionId as string]: false,
        }));
      }
      return next.content;
    });
  };

  const addQuestionFromPaletteToSection = (
    sectionId: string,
    type: PaletteItemType,
    insertIndex?: number,
  ) => {
    setContentWithHistory((prev) =>
      addQuestionFromPaletteToSectionAction(prev, sectionId, type, insertIndex),
    );
    setSectionCollapsed((prev) => ({ ...prev, [sectionId]: false }));
  };

  const { isSaving, isExporting, saveState, saveDraft, exportPdf } =
    useWorksheetPersistence({
      content,
      theme,
      layout,
      resolvedWorksheetId,
      setResolvedWorksheetId: (id) => setResolvedWorksheetId(id),
      isDirty,
      setIsDirty: (next) => setIsDirty(next),
      validateContentForSave,
      showAnswerKey,
    });

  const { focusNode } = useEditorLifecycle({
    undo,
    redo,
    save: () => saveDraft(),
    isDirty,
    isSaving,
  });

  const duplicateSection = useCallback(
    (sectionId: string) => {
      recordHistory();
      setContent((prev) => {
        const r = duplicateSectionAction(prev, sectionId);
        if (r.newSectionId) {
          setSectionLayoutOverrides((prevLayouts) => {
            const next = { ...prevLayouts };
            const src = prevLayouts[sectionId];
            if (src && r.newSectionId) next[r.newSectionId] = { ...src };
            return next;
          });
        }
        return r.content;
      });
      setSectionCollapsed((prev) => ({ ...prev, [sectionId]: prev[sectionId] ?? false }));
      markDirty();
    },
    [recordHistory],
  );

  const deleteSection = useCallback(
    (sectionId: string) => {
      const confirmed = window.confirm(
        'Delete this section and all of its questions? This cannot be undone.',
      );
      if (!confirmed) return;
      recordHistory();
      setContent((prev) => deleteSectionAction(prev, sectionId));
      setSectionCollapsed((prev) => {
        const next = { ...prev };
        delete next[sectionId];
        return next;
      });
      markDirty();
    },
    [recordHistory],
  );

  const editPaneModel = {
    content,
    theme,
    layout,
    contentFontClass,
    sectionSpacingClass,
    pointsBySection,
    sectionCollapsed,
    isPaletteDragging,
    isBlankWorksheet,
    completion,
  };

  const editPaneCommands = {
    setContentWithHistory,
    setSectionCollapsed: (
      updater: (prev: Record<string, boolean>) => Record<string, boolean>,
    ) => setSectionCollapsed(updater),
    addFromPalette,
    addSection,
    onSectionsDragEnd,
    addQuestionFromPaletteToSection,
    updateSectionById,
    duplicateSection,
    deleteSection,
    addQuestionToSection,
    insertSectionAt,
    setIsPaletteDragging,
    updateSectionLayout,
  };

  return (
    <>
      <EditorToolbar
        title={content.title}
        pointsTotal={pointsTotal}
        mode={mode}
        setMode={setMode}
        showAnswerKey={showAnswerKey}
        setShowAnswerKey={setShowAnswerKey}
        canUndo={history.past.length > 0}
        canRedo={history.future.length > 0}
        onUndo={undo}
        onRedo={redo}
        onSave={saveDraft}
        onExportPdf={exportPdf}
        isSaving={isSaving}
        isExporting={isExporting}
        saveState={saveState}
      />

      <div className="flex flex-1 bg-slate-50">
        {showWorksheetSidebar ? (
          <div className="fixed top-16 left-0 bottom-0 z-40 hidden w-72 flex-col overflow-hidden border-r border-slate-200 bg-white lg:flex">
            <LeftEditorSidebar
              tab={leftTab}
              setTab={setLeftTab}
              content={content}
              selectedNodeId={selectedNodeId}
              onSelectNode={(nodeId) => {
                if (nodeId.startsWith('section_')) {
                  const sectionId = nodeId.replace('section_', '');
                  setSectionCollapsed((prev) => ({
                    ...prev,
                    [sectionId]: false,
                  }));
                }
                focusNode(nodeId, setSelectedNodeId);
              }}
              onAddFromPalette={addFromPalette}
              onPaletteDragStateChange={setIsPaletteDragging}
              onClose={() => setShowWorksheetSidebar(false)}
            />
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="fixed top-24 left-3 z-40 hidden lg:flex"
            onClick={() => setShowWorksheetSidebar(true)}
          >
            <PanelLeftOpen className="h-3.5 w-3.5" />
            Open worksheet panel
          </Button>
        )}
        <main
          className={`flex-1 overflow-auto p-4 transition-[padding] duration-200 md:p-8 ${
            showWorksheetSidebar ? 'lg:pl-76' : ''
          } ${showThemeSidebar ? 'lg:pr-76' : ''}`}
        >
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 lg:flex-row lg:items-start">
            {mode === 'preview' ? (
              <EditorPreviewPane
                content={content}
                theme={theme}
                layout={layout}
                contentFontClass={contentFontClass}
                sectionSpacingClass={sectionSpacingClass}
                questionSpacingClass={questionSpacingClass}
                pointsBySection={pointsBySection}
                pointsTotal={pointsTotal}
                showAnswerKey={showAnswerKey}
              />
            ) : (
              <EditorEditPane model={editPaneModel} commands={editPaneCommands} />
            )}
          </div>
        </main>

        {showThemeSidebar ? (
          <div className="fixed top-16 right-0 bottom-0 z-40 hidden w-72 flex-col overflow-hidden border-l border-slate-200 bg-white lg:flex">
            <ThemeSettingsSidebar
              theme={theme}
              setTheme={setThemeWithHistory}
              onClose={() => setShowThemeSidebar(false)}
            />
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="fixed top-24 right-3 z-40 hidden lg:flex"
            onClick={() => setShowThemeSidebar(true)}
          >
            <PanelRightOpen className="h-3.5 w-3.5" />
            Open theme panel
          </Button>
        )}
      </div>
    </>
  );
};
