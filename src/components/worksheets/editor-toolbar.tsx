'use client';

import {
  ArrowLeft,
  CheckCircle2,
  FileDown,
  Loader2,
  Palette,
  Save,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

interface EditorToolbarProps {
  title: string;
  showThemeSidebar: boolean;
  setShowThemeSidebar: (show: boolean) => void;
  onSave: () => Promise<void> | void;
  onExportPdf: () => Promise<void> | void;
  isSaving: boolean;
  isExporting: boolean;
  saveState: 'idle' | 'saved' | 'error';
}

export const EditorToolbar = ({
  title,
  showThemeSidebar,
  setShowThemeSidebar,
  onSave,
  onExportPdf,
  isSaving,
  isExporting,
  saveState,
}: EditorToolbarProps) => {
  return (
    <div className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-1 hidden sm:inline">Back</span>
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {title || 'Untitled worksheet'}
            </p>
            <p className="text-xs text-slate-500">
              Simple mode: edit like a document
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 md:flex">
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving
              </>
            ) : saveState === 'saved' ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Saved
              </>
            ) : saveState === 'error' ? (
              <span className="text-rose-600">Save failed</span>
            ) : (
              <span>Not saved</span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowThemeSidebar(!showThemeSidebar)}
            className="gap-1.5 text-xs"
          >
            <Palette className="h-3.5 w-3.5" /> Theme
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExportPdf}
            disabled={isExporting}
            className="gap-1.5 text-xs"
          >
            {isExporting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileDown className="h-3.5 w-3.5" />
            )}
            Export
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="gap-1.5 text-xs"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};
