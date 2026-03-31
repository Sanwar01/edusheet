'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { MoreHorizontal, Copy, Trash2 } from 'lucide-react';

export function WorksheetRowActions({ worksheetId }: { worksheetId: string }) {
  const router = useRouter();

  async function duplicateWorksheet() {
    await fetch(`/api/worksheets/${worksheetId}/duplicate`, { method: 'POST' });
    router.refresh();
  }

  async function deleteWorksheet() {
    await fetch(`/api/worksheets/${worksheetId}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => duplicateWorksheet()}>
          <Copy className="mr-2 h-3.5 w-3.5" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => deleteWorksheet()}
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
