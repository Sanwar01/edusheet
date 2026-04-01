'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  CirclePlus,
  PanelLeftOpen,
  PanelRightOpen,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  QuestionType,
  WorksheetContent,
  WorksheetTheme,
} from '@/types/worksheet';
import { EditorToolbar } from './editor-toolbar';
import { WorksheetSectionCard } from './worksheet-section-card';
import { newId } from '@/components/worksheets/editor-shell.helpers';
import { ThemeSettingsSidebar } from './theme-settings-sidebar';
import { WorksheetContentSchema } from '@/lib/validators/worksheet';
import { LeftEditorSidebar } from '@/components/worksheets/left-editor-sidebar';
import {
  isPaletteItemType,
  PALETTE_DRAG_MIME,
  type PaletteItemType,
} from '@/components/worksheets/editor-dnd-types';
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

type EditorSnapshot = {
  content: WorksheetContent;
  theme: WorksheetTheme;
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
}: {
  worksheetId?: string;
  initialContent: WorksheetContent;
  initialTheme: WorksheetTheme;
}) => {
  const [resolvedWorksheetId, setResolvedWorksheetId] = useState<string | null>(
    worksheetId ?? null,
  );
  const [content, setContent] = useState(initialContent);
  const [theme, setTheme] = useState(initialTheme);
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
  const sectionCollapsedRef = useRef(sectionCollapsed);
  const showAnswerKeyRef = useRef(showAnswerKey);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

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

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

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

  const updateSectionById = (
    sectionId: string,
    updater: (
      section: WorksheetContent['sections'][number],
    ) => WorksheetContent['sections'][number],
  ) => {
    setContentWithHistory((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? updater(section) : section,
      ),
    }));
  };

  const onSectionsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = content.sections.findIndex((s) => s.id === active.id);
    const newIndex = content.sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    setContentWithHistory((prev) => ({
      ...prev,
      sections: arrayMove(prev.sections, oldIndex, newIndex),
    }));
  };

  const addSection = () => {
    const id = newId('sec');
    setContentWithHistory((prev) => {
      const insertIndex = prev.sections.length;
      const section = {
        id,
        type: 'section' as const,
        heading: `Section ${insertIndex + 1}`,
        questions: [],
      };
      return {
        ...prev,
        sections: [...prev.sections, section],
      };
    });
    setSectionCollapsed((prev) => ({ ...prev, [id]: false }));
  };

  const insertSectionAt = (insertIndex: number) => {
    const id = newId('sec');
    setContentWithHistory((prev) => {
      const clamped = Math.max(0, Math.min(insertIndex, prev.sections.length));
      const section = {
        id,
        type: 'section' as const,
        heading: `Section ${clamped + 1}`,
        questions: [],
      };
      const nextSections = [...prev.sections];
      nextSections.splice(clamped, 0, section);
      return { ...prev, sections: nextSections };
    });
    setSectionCollapsed((prev) => ({ ...prev, [id]: false }));
  };

  const addQuestionToSection = (sectionId: string) => {
    updateSectionById(sectionId, (section) => ({
      ...section,
      questions: [
        ...section.questions,
        {
          id: newId('q'),
          prompt: '',
          question_type: 'short_answer',
          points: 1,
        },
      ],
    }));
  };

  const buildQuestionTemplate = (questionType: QuestionType) => {
    const base = {
      id: newId('q'),
      prompt: 'New question prompt',
      question_type: questionType,
      points: 1,
      answer: '',
    };

    if (questionType === 'multiple_choice') {
      return {
        ...base,
        options: ['Option 1', 'Option 2', 'Option 3'],
        answer: 'Option 1',
      };
    }
    if (questionType === 'true_false') {
      return {
        ...base,
        options: ['True', 'False'],
        answer: 'True',
      };
    }
    if (questionType === 'matching') {
      return {
        ...base,
        options: ['Pair 1', 'Pair 2', 'Pair 3'],
      };
    }
    return base;
  };

  const addFromPalette = (type: PaletteItemType) => {
    if (type === 'section') {
      addSection();
      return;
    }
    const firstSection = content.sections[0];
    if (!firstSection) {
      const newSectionId = newId('sec');
      const newQuestion = buildQuestionTemplate(type);
      setContentWithHistory((prev) => ({
        ...prev,
        sections: [
          ...prev.sections,
          {
            id: newSectionId,
            type: 'section',
            heading: 'Section 1',
            questions: [newQuestion],
          },
        ],
      }));
      setSectionCollapsed((prev) => ({ ...prev, [newSectionId]: false }));
      return;
    }
    updateSectionById(firstSection.id, (section) => ({
      ...section,
      questions: [...section.questions, buildQuestionTemplate(type)],
    }));
    setSectionCollapsed((prev) => ({ ...prev, [firstSection.id]: false }));
  };

  const addQuestionFromPaletteToSection = (
    sectionId: string,
    type: PaletteItemType,
    insertIndex?: number,
  ) => {
    if (type === 'section') return;
    updateSectionById(sectionId, (section) => ({
      ...section,
      questions: (() => {
        const next = [...section.questions];
        const clamped =
          typeof insertIndex === 'number'
            ? Math.max(0, Math.min(insertIndex, next.length))
            : next.length;
        next.splice(clamped, 0, buildQuestionTemplate(type));
        return next;
      })(),
    }));
    setSectionCollapsed((prev) => ({ ...prev, [sectionId]: false }));
  };

  const { isSaving, isExporting, saveState, saveDraft, exportPdf } =
    useWorksheetPersistence({
      content,
      theme,
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
          <div className="fixed top-16 left-0 bottom-0 z-40 hidden h-full w-72 border-r border-slate-200 lg:block">
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
              <div
                className={`w-full rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-sm md:px-10 ${contentFontClass}`}
                style={{ color: theme.textColor, fontSize: theme.bodyFontSize }}
              >
                <h1
                  className="mb-2 font-bold"
                  style={{
                    fontSize: theme.headingFontSize,
                    color: theme.primaryColor,
                  }}
                >
                  {content.title || 'Untitled worksheet'}
                </h1>
                {content.instructions ? (
                  <p className="mb-6 italic text-slate-700">
                    {content.instructions}
                  </p>
                ) : null}
                <div className="mb-4 flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span>Preview is read-only and mirrors export layout.</span>
                  <span className="font-medium">
                    Total points: {pointsTotal}
                  </span>
                </div>
                <div className={sectionSpacingClass}>
                  {content.sections.map((section, sectionIndex) => (
                    <section key={section.id} className={questionSpacingClass}>
                      <h2 className="font-semibold">
                        Section {sectionIndex + 1}:{' '}
                        {section.heading || 'Untitled section'} (
                        {pointsBySection[section.id] ?? 0} pts)
                      </h2>
                      <ol
                        className={`list-decimal pl-5 ${questionSpacingClass}`}
                      >
                        {section.questions.map((question) => (
                          <li key={question.id} className="space-y-1">
                            <p>{question.prompt || 'Untitled question'}</p>
                            {question.question_type === 'multiple_choice' &&
                              (question.options ?? []).length > 0 && (
                                <ul className="list-disc pl-5 text-sm text-slate-700">
                                  {(question.options ?? []).map(
                                    (option, idx) => (
                                      <li key={`${question.id}_${idx}`}>
                                        {option}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              )}
                            {(question.question_type === 'short_answer' ||
                              question.question_type === 'essay') && (
                              <div
                                className={`rounded border border-slate-200 ${question.question_type === 'essay' ? 'h-20' : 'h-8'}`}
                              />
                            )}
                            {question.question_type === 'fill_in_blank' && (
                              <div className="h-6 w-52 border-b border-slate-400" />
                            )}
                            {showAnswerKey && question.answer ? (
                              <p className="text-xs text-slate-600">
                                Answer:{' '}
                                <span className="font-medium">
                                  {question.answer}
                                </span>
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ol>
                    </section>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {isBlankWorksheet && (
                  <aside className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:w-72">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      <h2 className="text-sm font-semibold text-slate-900">
                        Guided checklist
                      </h2>
                    </div>

                    <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                      Complete {completion.doneCount}/4 basics
                    </div>

                    <ul className="space-y-2 text-sm">
                      <li
                        className={
                          completion.hasTitle
                            ? 'text-emerald-700'
                            : 'text-slate-600'
                        }
                      >
                        {completion.hasTitle ? '✓' : '•'} Add worksheet title
                      </li>
                      <li
                        className={
                          completion.hasInstructions
                            ? 'text-emerald-700'
                            : 'text-slate-600'
                        }
                      >
                        {completion.hasInstructions ? '✓' : '•'} Add student
                        instructions
                      </li>
                      <li
                        className={
                          completion.hasSection
                            ? 'text-emerald-700'
                            : 'text-slate-600'
                        }
                      >
                        {completion.hasSection ? '✓' : '•'} Create at least one
                        section
                      </li>
                      <li
                        className={
                          completion.hasQuestions
                            ? 'text-emerald-700'
                            : 'text-slate-600'
                        }
                      >
                        {completion.hasQuestions ? '✓' : '•'} Add at least one
                        question
                      </li>
                    </ul>

                    <p className="mt-4 text-xs leading-5 text-slate-500">
                      Tip: drag sections and questions by the handle dots to
                      reorder.
                    </p>
                  </aside>
                )}

                <div
                  className={`w-full rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-sm md:px-10 ${contentFontClass}`}
                  style={{
                    color: theme.textColor,
                    fontSize: theme.bodyFontSize,
                  }}
                >
                  <input
                    id="worksheet_title"
                    value={content.title}
                    onChange={(e) => {
                      setContentWithHistory((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }));
                    }}
                    className="w-full border-none bg-transparent text-2xl font-bold text-slate-900 outline-none md:text-3xl"
                    style={{
                      fontSize: theme.headingFontSize,
                      color: theme.primaryColor,
                    }}
                    placeholder="Worksheet title"
                  />

                  <textarea
                    id="worksheet_instructions"
                    value={content.instructions || ''}
                    onChange={(e) => {
                      setContentWithHistory((prev) => ({
                        ...prev,
                        instructions: e.target.value,
                      }));
                    }}
                    placeholder="Short instructions for students"
                    className={`mt-2 mb-6 w-full resize-none rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm italic text-slate-700 outline-none ${contentFontClass}`}
                    rows={3}
                    style={{
                      fontSize: theme.bodyFontSize,
                      color: theme.textColor,
                    }}
                  />

                  {content.sections.length === 0 ? (
                    <div
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        const rawType =
                          event.dataTransfer.getData(PALETTE_DRAG_MIME);
                        if (!rawType || !isPaletteItemType(rawType)) return;
                        addFromPalette(rawType);
                      }}
                      className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center"
                    >
                      <p className="text-sm font-medium text-slate-800">
                        Start by adding your first section
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Example: Vocabulary, Reading, or Math Practice
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        You can also drag a component from the left panel.
                      </p>
                      <Button className="mt-4" onClick={addSection}>
                        <CirclePlus className="h-4 w-4" /> Add first section
                      </Button>
                    </div>
                  ) : (
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={onSectionsDragEnd}
                    >
                      <SortableContext
                        items={content.sections.map((s) => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className={sectionSpacingClass}>
                          {content.sections.map((section, index) => {
                            const questionStartNumber =
                              content.sections
                                .slice(0, index)
                                .reduce(
                                  (sum, s) => sum + s.questions.length,
                                  0,
                                ) + 1;
                            return (
                              <div key={section.id} className="space-y-2">
                                {isPaletteDragging ? (
                                  <div
                                    onDragOver={(event) =>
                                      event.preventDefault()
                                    }
                                    onDrop={(event) => {
                                      const rawType =
                                        event.dataTransfer.getData(
                                          PALETTE_DRAG_MIME,
                                        );
                                      if (
                                        !rawType ||
                                        !isPaletteItemType(rawType)
                                      )
                                        return;
                                      setIsPaletteDragging(false);
                                      if (rawType === 'section') {
                                        insertSectionAt(index);
                                        return;
                                      }
                                      addQuestionFromPaletteToSection(
                                        section.id,
                                        rawType,
                                        0,
                                      );
                                    }}
                                    className="rounded border border-dashed border-indigo-300 bg-indigo-50/60 px-2 py-1 text-[11px] text-slate-600 transition-colors hover:border-indigo-500 hover:bg-indigo-100/70"
                                  >
                                    Drop component here (before section{' '}
                                    {index + 1})
                                  </div>
                                ) : null}
                                <WorksheetSectionCard
                                  section={section}
                                  sectionNumber={index + 1}
                                  questionStartNumber={questionStartNumber}
                                  sectionPoints={
                                    pointsBySection[section.id] ?? 0
                                  }
                                  isCollapsed={Boolean(
                                    sectionCollapsed[section.id],
                                  )}
                                  onToggleCollapsed={() =>
                                    setSectionCollapsed((prev) => ({
                                      ...prev,
                                      [section.id]: !prev[section.id],
                                    }))
                                  }
                                  onChangeSection={(nextSection) =>
                                    updateSectionById(
                                      section.id,
                                      () => nextSection,
                                    )
                                  }
                                  onDropPaletteItem={(type, insertIndex) =>
                                    addQuestionFromPaletteToSection(
                                      section.id,
                                      type,
                                      insertIndex,
                                    )
                                  }
                                  showDropTargets={isPaletteDragging}
                                  onDuplicateSection={() => {
                                    recordHistory();
                                    setContent((prev) => ({
                                      ...prev,
                                      sections: [
                                        ...prev.sections,
                                        {
                                          ...section,
                                          id: newId('sec'),
                                          questions: section.questions.map(
                                            (q) => ({
                                              ...q,
                                              id: newId('q'),
                                            }),
                                          ),
                                        },
                                      ],
                                    }));
                                    setSectionCollapsed((prev) => ({
                                      ...prev,
                                      [section.id]: prev[section.id] ?? false,
                                    }));
                                    markDirty();
                                  }}
                                  onDeleteSection={() => {
                                    const confirmed = window.confirm(
                                      'Delete this section and all of its questions? This cannot be undone.',
                                    );
                                    if (!confirmed) return;
                                    recordHistory();
                                    setContent((prev) => ({
                                      ...prev,
                                      sections: prev.sections.filter(
                                        (s) => s.id !== section.id,
                                      ),
                                    }));
                                    setSectionCollapsed((prev) => {
                                      const next = { ...prev };
                                      delete next[section.id];
                                      return next;
                                    });
                                    markDirty();
                                  }}
                                  onAddQuestion={() =>
                                    addQuestionToSection(section.id)
                                  }
                                />
                              </div>
                            );
                          })}
                          {isPaletteDragging ? (
                            <div
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) => {
                                const rawType =
                                  event.dataTransfer.getData(PALETTE_DRAG_MIME);
                                if (!rawType || !isPaletteItemType(rawType))
                                  return;
                                setIsPaletteDragging(false);
                                if (rawType === 'section') {
                                  insertSectionAt(content.sections.length);
                                  return;
                                }
                                const lastSectionId =
                                  content.sections[content.sections.length - 1]
                                    ?.id;
                                if (!lastSectionId) return;
                                addQuestionFromPaletteToSection(
                                  lastSectionId,
                                  rawType,
                                );
                              }}
                              className="rounded border border-dashed border-indigo-300 bg-indigo-50/60 px-2 py-1 text-[11px] text-slate-600 transition-colors hover:border-indigo-500 hover:bg-indigo-100/70"
                            >
                              Drop component here (end of worksheet)
                            </div>
                          ) : null}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}

                  <Button
                    variant="outline"
                    className="mt-4 w-full border-dashed"
                    onClick={addSection}
                  >
                    <CirclePlus className="h-4 w-4" /> Add section
                  </Button>
                </div>
              </>
            )}
          </div>
        </main>

        {showThemeSidebar ? (
          <div className="fixed top-16 right-0 bottom-0 z-40 hidden h-full w-72 border-l border-slate-200 lg:block">
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
