'use client';

import { useState } from 'react';
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
import type { WorksheetContent, WorksheetTheme } from '@/types/worksheet';
import { EditorToolbar } from './editor-toolbar';
import { WorksheetSectionCard } from './worksheet-section-card';
import { newId } from '@/components/worksheets/editor-shell.helpers';
import { ThemeSettingsSidebar } from './theme-settings-sidebar';

export const EditorShell = ({
  worksheetId,
  initialContent,
  initialTheme,
}: {
  worksheetId: string;
  initialContent: WorksheetContent;
  initialTheme: WorksheetTheme;
}) => {
  const [content, setContent] = useState(initialContent);
  const [theme, setTheme] = useState(initialTheme);
  const [showThemeSidebar, setShowThemeSidebar] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

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
  };

  return (
    <>
      <EditorToolbar
        title={content.title}
        showThemeSidebar={showThemeSidebar}
        setShowThemeSidebar={setShowThemeSidebar}
      />
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-3xl rounded-lg border bg-card p-6 shadow-sm md:p-10">
            <input
              value={content.title}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full border-none bg-transparent font-display text-2xl font-bold text-card-foreground outline-none md:text-3xl"
              style={{
                fontSize: theme.headingFontSize,
                color: theme.primaryColor,
              }}
            />
            <textarea
              value={content.instructions || ''}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  instructions: e.target.value,
                }))
              }
              placeholder="Add instructions for students…"
              className="mt-3 w-full resize-none border-none bg-transparent text-sm italic text-muted-foreground outline-none"
              rows={2}
            />

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={onSectionsDragEnd}
            >
              <SortableContext
                items={content.sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {content.sections.map((section) => (
                    <WorksheetSectionCard
                      key={section.id}
                      section={section}
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
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </main>

        {showThemeSidebar && (
          <ThemeSettingsSidebar theme={theme} setTheme={setTheme} />
        )}
      </div>
    </>
  );
};
