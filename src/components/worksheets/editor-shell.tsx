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
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { WorksheetContent, WorksheetQuestion, WorksheetTheme } from '@/types/worksheet';
import { SortableQuestionShell, SortableSectionShell } from '@/components/worksheets/sortable-blocks';

function newId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function SectionQuestionsDnd({
  section,
  onChangeQuestions,
}: {
  section: WorksheetContent['sections'][number];
  onChangeQuestions: (next: WorksheetQuestion[]) => void;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = section.questions.findIndex((q) => q.id === active.id);
    const newIndex = section.questions.findIndex((q) => q.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onChangeQuestions(arrayMove(section.questions, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={section.questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
        <div className='space-y-2'>
          {section.questions.map((question) => (
            <SortableQuestionShell key={question.id} id={question.id}>
              <Textarea
                value={question.prompt}
                onChange={(e) =>
                  onChangeQuestions(
                    section.questions.map((q) => (q.id === question.id ? { ...q, prompt: e.target.value } : q)),
                  )
                }
              />
              <div className='mt-2 flex flex-wrap gap-2'>
                <Button
                  variant='outline'
                  className='px-3 py-1.5 text-xs'
                  onClick={() =>
                    onChangeQuestions([
                      ...section.questions,
                      { ...question, id: newId('q') },
                    ])
                  }
                >
                  Duplicate question
                </Button>
                <Button
                  variant='ghost'
                  className='px-3 py-1.5 text-xs'
                  onClick={() => onChangeQuestions(section.questions.filter((q) => q.id !== question.id))}
                >
                  Delete question
                </Button>
              </div>
            </SortableQuestionShell>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export function EditorShell({
  worksheetId,
  initialContent,
  initialTheme,
}: {
  worksheetId: string;
  initialContent: WorksheetContent;
  initialTheme: WorksheetTheme;
}) {
  const [content, setContent] = useState(initialContent);
  const [theme, setTheme] = useState(initialTheme);
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function onSectionsDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = content.sections.findIndex((s) => s.id === active.id);
    const newIndex = content.sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    setContent((prev) => ({
      ...prev,
      sections: arrayMove(prev.sections, oldIndex, newIndex),
    }));
  }

  async function saveDraft() {
    setSaving(true);

    const layout = {
      sectionOrder: content.sections.map((s) => s.id),
      questionOrderBySection: Object.fromEntries(content.sections.map((s) => [s.id, s.questions.map((q) => q.id)])),
      spacingPreset: theme.spacingPreset,
    };

    await fetch(`/api/worksheets/${worksheetId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: content.title,
        content_json: content,
        layout_json: layout,
        theme_json: theme,
      }),
    });

    setSaving(false);
  }

  return (
    <div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
      <div className='rounded-lg border border-slate-200 bg-white p-4 shadow-sm'>
        <Input
          value={content.title}
          onChange={(e) => setContent((v) => ({ ...v, title: e.target.value }))}
          className='mb-3 text-xl font-semibold'
        />
        <Textarea
          value={content.instructions}
          onChange={(e) => setContent((v) => ({ ...v, instructions: e.target.value }))}
          className='mb-4 min-h-[88px]'
          placeholder='Instructions for students'
        />

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onSectionsDragEnd}>
          <SortableContext items={content.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <div className='space-y-4'>
              {content.sections.map((section) => (
                <SortableSectionShell key={section.id} id={section.id}>
                  <div className='flex flex-wrap items-center gap-2'>
                    <Input
                      className='min-w-[200px] flex-1 font-medium'
                      value={section.heading}
                      onChange={(e) =>
                        setContent((prev) => ({
                          ...prev,
                          sections: prev.sections.map((s) =>
                            s.id === section.id ? { ...s, heading: e.target.value } : s,
                          ),
                        }))
                      }
                    />
                    <Button
                      variant='outline'
                      className='px-3 py-1.5 text-xs'
                      onClick={() =>
                        setContent((prev) => ({
                          ...prev,
                          sections: [
                            ...prev.sections,
                            {
                              ...section,
                              id: newId('sec'),
                              questions: section.questions.map((q) => ({ ...q, id: newId('q') })),
                            },
                          ],
                        }))
                      }
                    >
                      Duplicate
                    </Button>
                    <Button
                      variant='destructive'
                      className='px-3 py-1.5 text-xs'
                      onClick={() =>
                        setContent((prev) => ({
                          ...prev,
                          sections: prev.sections.filter((s) => s.id !== section.id),
                        }))
                      }
                    >
                      Delete
                    </Button>
                  </div>

                  <SectionQuestionsDnd
                    section={section}
                    onChangeQuestions={(next) =>
                      setContent((prev) => ({
                        ...prev,
                        sections: prev.sections.map((s) => (s.id === section.id ? { ...s, questions: next } : s)),
                      }))
                    }
                  />
                </SortableSectionShell>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <aside className='space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm'>
        <h3 className='font-semibold'>Theme</h3>
        <label className='text-sm text-slate-600'>Heading size</label>
        <Input
          type='number'
          value={theme.headingFontSize}
          onChange={(e) => setTheme((t) => ({ ...t, headingFontSize: Number(e.target.value) }))}
        />
        <label className='text-sm text-slate-600'>Body size</label>
        <Input
          type='number'
          value={theme.bodyFontSize}
          onChange={(e) => setTheme((t) => ({ ...t, bodyFontSize: Number(e.target.value) }))}
        />
        <label className='text-sm text-slate-600'>Primary color</label>
        <Input type='color' value={theme.primaryColor} onChange={(e) => setTheme((t) => ({ ...t, primaryColor: e.target.value }))} />
        <label className='text-sm text-slate-600'>Text color</label>
        <Input type='color' value={theme.textColor} onChange={(e) => setTheme((t) => ({ ...t, textColor: e.target.value }))} />
        <Button className='w-full' onClick={saveDraft}>
          {saving ? 'Saving...' : 'Save draft'}
        </Button>
      </aside>
    </div>
  );
}
