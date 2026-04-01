import { useCallback, useEffect } from 'react';

export function useEditorLifecycle({
  undo,
  redo,
  save,
  isDirty,
  isSaving,
}: {
  undo: () => void;
  redo: () => void;
  save: () => Promise<void> | void;
  isDirty: boolean;
  isSaving: boolean;
}) {
  const focusNode = useCallback((nodeId: string, onSelect: (nodeId: string) => void) => {
    onSelect(nodeId);
    const el = document.getElementById(nodeId);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.focus();
    }
  }, []);

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
      void save();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [redo, save, undo]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || isSaving) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty, isSaving]);

  return { focusNode };
}
