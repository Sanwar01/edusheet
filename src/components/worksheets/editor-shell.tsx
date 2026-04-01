'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { CirclePlus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WorksheetContent, WorksheetTheme } from '@/types/worksheet';
import { EditorToolbar } from './editor-toolbar';
import { WorksheetSectionCard } from './worksheet-section-card';
import {
  buildLayoutPayload,
  newId,
} from '@/components/worksheets/editor-shell.helpers';
import { ThemeSettingsSidebar } from './theme-settings-sidebar';
import { toast } from 'sonner';
import { fetchJson, getApiErrorMessage } from '@/lib/api/client';
import { WorksheetContentSchema } from '@/lib/validators/worksheet';

const fontFamilyClassMap: Record<WorksheetTheme['fontFamily'], string> = {
  inter: 'font-sans',
  lora: 'font-serif',
  nunito: 'font-sans',
};

const sectionSpacingClassMap: Record<WorksheetTheme['spacingPreset'], string> =
  {
    compact: 'space-y-2',
    comfortable: 'space-y-4',
    spacious: 'space-y-6',
  };

const questionSpacingClassMap: Record<WorksheetTheme['spacingPreset'], string> = {
  compact: 'space-y-1',
  comfortable: 'space-y-2',
  spacious: 'space-y-4',
};

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
  const router = useRouter();
  const [resolvedWorksheetId, setResolvedWorksheetId] = useState<string | null>(
    worksheetId ?? null,
  );
  const [content, setContent] = useState(initialContent);
  const [theme, setTheme] = useState(initialTheme);
  const [showThemeSidebar, setShowThemeSidebar] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [sectionCollapsed, setSectionCollapsed] = useState<Record<string, boolean>>({});
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>(
    'idle',
  );
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveRetryRef = useRef(0);
  const restoringHistoryRef = useRef(false);
  const [history, setHistory] = useState<EditorHistory>({ past: [], future: [] });
  const contentRef = useRef(content);
  const themeRef = useRef(theme);
  const sectionCollapsedRef = useRef(sectionCollapsed);
  const showAnswerKeyRef = useRef(showAnswerKey);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const completion = useMemo(() => {
    const hasTitle = content.title.trim().length > 0;
    const hasInstructions = (content.instructions || '').trim().length > 0;
    const hasSection = content.sections.length > 0;
    const questionCount = content.sections.reduce(
      (sum, s) => sum + s.questions.length,
      0,
    );
    const hasQuestions = questionCount > 0;

    const doneCount = [
      hasTitle,
      hasInstructions,
      hasSection,
      hasQuestions,
    ].filter(Boolean).length;

    return {
      hasTitle,
      hasInstructions,
      hasSection,
      hasQuestions,
      questionCount,
      doneCount,
    };
  }, [content]);

  const isBlankWorksheet = useMemo(
    () => content.sections.length === 0 && completion.questionCount === 0,
    [content.sections.length, completion.questionCount],
  );
  const contentFontClass = fontFamilyClassMap[theme.fontFamily];
  const sectionSpacingClass = sectionSpacingClassMap[theme.spacingPreset];
  const questionSpacingClass = questionSpacingClassMap[theme.spacingPreset];
  const pointsBySection = useMemo(
    () =>
      Object.fromEntries(
        content.sections.map((section) => [
          section.id,
          section.questions.reduce((sum, q) => sum + (q.points ?? 0), 0),
        ]),
      ),
    [content.sections],
  );
  const pointsTotal = useMemo(
    () => Object.values(pointsBySection).reduce((sum, points) => sum + points, 0),
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
      content: JSON.parse(JSON.stringify(contentRef.current)) as WorksheetContent,
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
    setSaveState('idle');
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
    setSaveState('idle');
  };

  const setContentWithHistory = useCallback(
    (updater: WorksheetContent | ((prev: WorksheetContent) => WorksheetContent)) => {
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
    setContentWithHistory((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id,
          type: 'section',
          heading: `Section ${prev.sections.length + 1}`,
          questions: [],
        },
      ],
    }));
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

  const saveDraft = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (isSaving) return;
    if (!content.title.trim()) {
      if (!silent) {
        toast.error('Please add a worksheet title before saving.');
        setSaveState('error');
      }
      return;
    }
    const validationError = validateContentForSave();
    if (validationError) {
      if (!silent) {
        toast.error(validationError);
        setSaveState('error');
      }
      return;
    }

    try {
      setIsSaving(true);
      setSaveState('idle');

      const layout = buildLayoutPayload(content, theme.spacingPreset);
      let res: Response;
      if (resolvedWorksheetId) {
        res = await fetch(`/api/worksheets/${resolvedWorksheetId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: content.title,
            content_json: content,
            layout_json: layout,
            theme_json: theme,
          }),
        });
      } else {
        const created = await fetchJson<{ data: { id: string } }>(
          '/api/worksheets',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: content.title,
              subject: 'General',
              grade_level: '5',
              content_json: content,
              layout_json: layout,
              theme_json: theme,
            }),
          },
          'Failed to create worksheet.',
        );
        setResolvedWorksheetId(created.data.id);
        router.replace(`/dashboard/worksheets/${created.data.id}/edit`);
        setSaveState('saved');
        setIsDirty(false);
        if (!silent) {
          toast.success('Worksheet created');
        }
        return;
      }

      if (!res.ok) {
        throw new Error(
          await getApiErrorMessage(res, 'Failed to save worksheet.'),
        );
      }

      setSaveState('saved');
      setIsDirty(false);
      autosaveRetryRef.current = 0;
      if (!silent) {
        toast.success('Worksheet saved');
      }
    } catch (error) {
      setSaveState('error');
      if (silent && autosaveRetryRef.current < 2) {
        autosaveRetryRef.current += 1;
        setTimeout(() => {
          void saveDraft({ silent: true });
        }, autosaveRetryRef.current * 1500);
      }
      if (!silent) {
        toast.error('Save failed', {
          description:
            error instanceof Error
              ? error.message
              : 'Could not save your worksheet.',
        });
      }
    } finally {
      setIsSaving(false);
    }
  }, [content, isSaving, resolvedWorksheetId, router, theme, validateContentForSave]);

  const exportPdf = async () => {
    if (isExporting) return;
    if (!resolvedWorksheetId) {
      toast.error('Save your worksheet first before exporting.');
      return;
    }
    if (!content.sections.length) {
      toast.error('Add at least one section before exporting.');
      return;
    }
    const validationError = validateContentForSave();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setIsExporting(true);
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Please allow popups to export.');
      }

      const res = await fetch('/api/exports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          worksheetId: resolvedWorksheetId,
          includeAnswerKey: showAnswerKey,
        }),
      });
      if (!res.ok) {
        printWindow.close();
        throw new Error(await getApiErrorMessage(res, 'Failed to export PDF.'));
      }

      const payload = (await res.json()) as { html?: string };
      if (!payload.html) {
        printWindow.close();
        throw new Error('Export HTML is missing.');
      }

      printWindow.document.open();
      printWindow.document.write(payload.html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();

      toast.success('PDF exported');
    } catch (error) {
      toast.error('Failed to export PDF', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isUndoShortcut =
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        event.key.toLowerCase() === 'z';
      if (isUndoShortcut) {
        event.preventDefault();
        undo();
        return;
      }
      const isRedoShortcut =
        (event.metaKey || event.ctrlKey) &&
        ((event.shiftKey && event.key.toLowerCase() === 'z') ||
          event.key.toLowerCase() === 'y');
      if (isRedoShortcut) {
        event.preventDefault();
        redo();
        return;
      }
      const isSaveShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's';
      if (!isSaveShortcut) return;
      event.preventDefault();
      void saveDraft();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [redo, saveDraft, undo]);

  useEffect(() => {
    if (!isDirty) return;
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    autosaveTimerRef.current = setTimeout(() => {
      void saveDraft({ silent: true });
    }, 1500);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [content, theme, isDirty, resolvedWorksheetId, saveDraft]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || isSaving) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty, isSaving]);

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
        showThemeSidebar={showThemeSidebar}
        setShowThemeSidebar={setShowThemeSidebar}
        onSave={saveDraft}
        onExportPdf={exportPdf}
        isSaving={isSaving}
        isExporting={isExporting}
        saveState={saveState}
      />

      <div className="flex flex-1 bg-slate-50">
        <main className="flex-1 overflow-auto p-4 md:p-8">
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
                  <p className="mb-6 italic text-slate-700">{content.instructions}</p>
                ) : null}
                <div className="mb-4 flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span>Preview is read-only and mirrors export layout.</span>
                  <span className="font-medium">Total points: {pointsTotal}</span>
                </div>
                <div className={sectionSpacingClass}>
                  {content.sections.map((section, sectionIndex) => (
                    <section key={section.id} className={questionSpacingClass}>
                      <h2 className="font-semibold">
                        Section {sectionIndex + 1}: {section.heading || 'Untitled section'} ({pointsBySection[section.id] ?? 0} pts)
                      </h2>
                      <ol className={`list-decimal pl-5 ${questionSpacingClass}`}>
                        {section.questions.map((question) => (
                          <li key={question.id} className="space-y-1">
                            <p>{question.prompt || 'Untitled question'}</p>
                            {question.question_type === 'multiple_choice' &&
                              (question.options ?? []).length > 0 && (
                                <ul className="list-disc pl-5 text-sm text-slate-700">
                                  {(question.options ?? []).map((option, idx) => (
                                    <li key={`${question.id}_${idx}`}>{option}</li>
                                  ))}
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
                                Answer: <span className="font-medium">{question.answer}</span>
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
              style={{ color: theme.textColor, fontSize: theme.bodyFontSize }}
            >
              <input
                value={content.title}
                onChange={(e) => {
                  setContentWithHistory((prev) => ({ ...prev, title: e.target.value }));
                }}
                className="w-full border-none bg-transparent text-2xl font-bold text-slate-900 outline-none md:text-3xl"
                style={{
                  fontSize: theme.headingFontSize,
                  color: theme.primaryColor,
                }}
                placeholder="Worksheet title"
              />

              <textarea
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
                style={{ fontSize: theme.bodyFontSize, color: theme.textColor }}
              />

              {content.sections.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-slate-800">
                    Start by adding your first section
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Example: Vocabulary, Reading, or Math Practice
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
                            .reduce((sum, s) => sum + s.questions.length, 0) +
                          1;
                        return (
                          <WorksheetSectionCard
                            key={section.id}
                            section={section}
                            sectionNumber={index + 1}
                            questionStartNumber={questionStartNumber}
                            sectionPoints={pointsBySection[section.id] ?? 0}
                            isCollapsed={Boolean(sectionCollapsed[section.id])}
                            onToggleCollapsed={() =>
                              setSectionCollapsed((prev) => ({
                                ...prev,
                                [section.id]: !prev[section.id],
                              }))
                            }
                            onChangeSection={(nextSection) =>
                              updateSectionById(section.id, () => nextSection)
                            }
                            onDuplicateSection={() => {
                              recordHistory();
                              setContent((prev) => ({
                                ...prev,
                                sections: [
                                  ...prev.sections,
                                  {
                                    ...section,
                                    id: newId('sec'),
                                    questions: section.questions.map((q) => ({
                                      ...q,
                                      id: newId('q'),
                                    })),
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
                        );
                      })}
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

        {showThemeSidebar && (
          <div className="fixed top-16 right-0 bottom-0 z-40 w-72 border-l border-slate-200 h-full">
            <ThemeSettingsSidebar theme={theme} setTheme={setThemeWithHistory} />
          </div>
        )}
      </div>
    </>
  );
};
