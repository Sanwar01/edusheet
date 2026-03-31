'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>(
    'idle',
  );

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

  const updateSectionById = (
    sectionId: string,
    updater: (
      section: WorksheetContent['sections'][number],
    ) => WorksheetContent['sections'][number],
  ) => {
    setContent((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? updater(section) : section,
      ),
    }));
    setSaveState('idle');
  };

  const onSectionsDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = content.sections.findIndex((s) => s.id === active.id);
    const newIndex = content.sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    setContent((prev) => ({
      ...prev,
      sections: arrayMove(prev.sections, oldIndex, newIndex),
    }));
    setSaveState('idle');
  };

  const addSection = () => {
    setContent((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          id: newId('sec'),
          type: 'section',
          heading: `Section ${prev.sections.length + 1}`,
          questions: [],
        },
      ],
    }));
    setSaveState('idle');
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

  const saveDraft = async () => {
    if (isSaving) return;
    if (!content.title.trim()) {
      toast.error('Please add a worksheet title before saving.');
      setSaveState('error');
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
        toast.success('Worksheet created');
        return;
      }

      if (!res.ok) {
        throw new Error(
          await getApiErrorMessage(res, 'Failed to save worksheet.'),
        );
      }

      setSaveState('saved');
      toast.success('Worksheet saved');
    } catch (error) {
      setSaveState('error');
      toast.error('Save failed', {
        description:
          error instanceof Error
            ? error.message
            : 'Could not save your worksheet.',
      });
    } finally {
      setIsSaving(false);
    }
  };

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

    try {
      setIsExporting(true);
      const res = await fetch('/api/exports/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worksheetId: resolvedWorksheetId }),
      });
      if (!res.ok) {
        throw new Error(await getApiErrorMessage(res, 'Failed to export PDF.'));
      }
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
      const isSaveShortcut =
        (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's';
      if (!isSaveShortcut) return;
      event.preventDefault();
      void saveDraft();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <>
      <EditorToolbar
        title={content.title}
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
                  setContent((prev) => ({ ...prev, title: e.target.value }));
                  setSaveState('idle');
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
                  setContent((prev) => ({
                    ...prev,
                    instructions: e.target.value,
                  }));
                  setSaveState('idle');
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
                            onChangeSection={(nextSection) =>
                              updateSectionById(section.id, () => nextSection)
                            }
                            onDuplicateSection={() =>
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
                              }))
                            }
                            onDeleteSection={() =>
                              setContent((prev) => ({
                                ...prev,
                                sections: prev.sections.filter(
                                  (s) => s.id !== section.id,
                                ),
                              }))
                            }
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
          </div>
        </main>

        {showThemeSidebar && (
          <div className="fixed top-16 right-0 bottom-0 z-40 w-72 border-l border-slate-200 h-full">
            <ThemeSettingsSidebar theme={theme} setTheme={setTheme} />
          </div>
        )}
      </div>
    </>
  );
};
