'use client';

import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  FileEdit,
  FileDown,
  Loader2,
  Redo2,
  Save,
  Undo2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

interface EditorToolbarProps {
  title: string;
  pointsTotal: number;
  mode: 'edit' | 'preview';
  setMode: (mode: 'edit' | 'preview') => void;
  showAnswerKey: boolean;
  setShowAnswerKey: (next: boolean) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => Promise<void> | void;
  onExportPdf: () => Promise<void> | void;
  isSaving: boolean;
  isExporting: boolean;
  saveState: 'idle' | 'saved' | 'error';
}

export const EditorToolbar = ({
  title,
  pointsTotal,
  mode,
  setMode,
  showAnswerKey,
  setShowAnswerKey,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onExportPdf,
  isSaving,
  isExporting,
  saveState,
}: EditorToolbarProps) => {
  return (
    <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Back</span>
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {title || 'Untitled worksheet'}
            </p>
            <p className="text-xs text-muted-foreground">
              Teacher mode: fast editing with auto-save
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-md border border-border bg-secondary/50 px-2 py-1 md:flex">
            <div className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
              Total points:{' '}
              <span className="font-semibold text-foreground">
                {pointsTotal}
              </span>
            </div>
            <div className="flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving
                </>
              ) : saveState === 'saved' ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />{' '}
                  Saved
                </>
              ) : saveState === 'error' ? (
                <span className="text-rose-600">Save failed</span>
              ) : (
                <span>Not saved</span>
              )}
            </div>
          </div>

          {mode === 'preview' ? (
            <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className="h-7 gap-1.5 px-2 text-xs"
              >
                {showAnswerKey ? 'Hide answers' : 'Show answers'}
              </Button>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-md border border-border bg-background p-1 md:flex">
            <Button
              variant={mode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('edit')}
              className="h-7 gap-1 px-2 text-xs"
            >
              <FileEdit className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant={mode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setMode('preview')}
              className="h-7 gap-1 px-2 text-xs"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
          </div>

          <div className="hidden items-center gap-1 rounded-md border border-border bg-background p-1 md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="h-7 gap-1 px-2 text-xs"
            >
              <Undo2 className="h-3.5 w-3.5" />
              Undo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="h-7 gap-1 px-2 text-xs"
            >
              <Redo2 className="h-3.5 w-3.5" />
              Redo
            </Button>
          </div>

          <div className="flex items-center gap-1 rounded-md border border-border bg-background p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onExportPdf}
              disabled={isExporting}
              className="h-7 gap-1.5 px-2 text-xs"
            >
              {isExporting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <FileDown className="h-3.5 w-3.5" />
              )}
              Export
            </Button>
          </div>
          {saveState !== 'saved' || isSaving ? (
            <Button
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="gap-1.5 px-2 text-xs"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {saveState === 'error' ? 'Retry save' : 'Save now'}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
