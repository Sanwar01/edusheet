import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { WorksheetContent, WorksheetLayout, WorksheetTheme } from '@/types/worksheet';
import { buildLayoutPayload } from '@/components/worksheets/editor-shell.helpers';
import { fetchJson, getApiErrorMessage } from '@/lib/api/client';
import { CreateWorksheetResponseSchema } from '@/lib/validators/api';

export function useWorksheetPersistence({
  content,
  theme,
  layout,
  resolvedWorksheetId,
  setResolvedWorksheetId,
  isDirty,
  setIsDirty,
  validateContentForSave,
  showAnswerKey,
}: {
  content: WorksheetContent;
  theme: WorksheetTheme;
  layout: WorksheetLayout;
  resolvedWorksheetId: string | null;
  setResolvedWorksheetId: (id: string) => void;
  isDirty: boolean;
  setIsDirty: (isDirty: boolean) => void;
  validateContentForSave: () => string | null;
  showAnswerKey: boolean;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle');
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autosaveRetryRef = useRef(0);

  const saveDraft = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
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

        const layoutPayload = buildLayoutPayload(
          content,
          theme.spacingPreset,
          layout,
        );
        let res: Response;
        if (resolvedWorksheetId) {
          res = await fetch(`/api/worksheets/${resolvedWorksheetId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: content.title,
              content_json: content,
              layout_json: layoutPayload,
              theme_json: theme,
            }),
          });
        } else {
          const createdPayload = await fetchJson<unknown>(
            '/api/worksheets',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: content.title,
                subject: 'General',
                grade_level: '5',
                content_json: content,
                layout_json: layoutPayload,
                theme_json: theme,
              }),
            },
            'Failed to create worksheet.',
          );
          const created = CreateWorksheetResponseSchema.parse(createdPayload);
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
          throw new Error(await getApiErrorMessage(res, 'Failed to save worksheet.'));
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
    },
    [
      content,
      isSaving,
      resolvedWorksheetId,
      router,
      setIsDirty,
      setResolvedWorksheetId,
      theme,
      layout,
      validateContentForSave,
    ],
  );

  const exportPdf = useCallback(async () => {
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
  }, [
    content.sections.length,
    isExporting,
    resolvedWorksheetId,
    showAnswerKey,
    validateContentForSave,
  ]);

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
  }, [content, isDirty, saveDraft, theme, layout]);

  return {
    isSaving,
    isExporting,
    saveState,
    setSaveState,
    saveDraft,
    exportPdf,
  };
}
