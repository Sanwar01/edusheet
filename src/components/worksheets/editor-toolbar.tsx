'use client';
import { ArrowLeft, FileDown, Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

interface EditorToolbarProps {
  title: string;
  showThemeSidebar: boolean;
  setShowThemeSidebar: (show: boolean) => void;
}
export const EditorToolbar = ({
  title,
  showThemeSidebar,
  setShowThemeSidebar,
}: EditorToolbarProps) => {
  return (
    <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowThemeSidebar(!showThemeSidebar)}
            className="text-xs"
          >
            Theme
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log('Export PDF')}
            className="gap-1.5 text-xs"
          >
            <FileDown className="h-3.5 w-3.5" /> Export PDF
          </Button>
          <Button
            size="sm"
            onClick={() => console.log('Save')}
            disabled={false}
            className="gap-1.5 text-xs"
          >
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        </div>
      </div>
    </div>
  );
};
