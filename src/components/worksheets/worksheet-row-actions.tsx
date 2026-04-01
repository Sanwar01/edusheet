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
import { toast } from 'sonner';
import { assertApiOk } from '@/lib/api/client';

export const WorksheetRowActions = ({
  worksheetId,
}: {
  worksheetId: string;
}) => {
  const router = useRouter();

  const duplicateWorksheet = async () => {
    try {
      const res = await fetch(`/api/worksheets/${worksheetId}/duplicate`, {
        method: 'POST',
      });
      await assertApiOk(res, 'Failed to duplicate worksheet.');
      toast.success('Worksheet duplicated');
      router.refresh();
    } catch (error) {
      toast.error('Duplicate failed', {
        description:
          error instanceof Error ? error.message : 'Could not duplicate worksheet.',
      });
    }
  };

  const deleteWorksheet = async () => {
    const confirmed = window.confirm(
      'Delete this worksheet? This action cannot be undone.',
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/worksheets/${worksheetId}`, {
        method: 'DELETE',
      });
      await assertApiOk(res, 'Failed to delete worksheet.');
      toast.success('Worksheet deleted');
      router.refresh();
    } catch (error) {
      toast.error('Delete failed', {
        description:
          error instanceof Error ? error.message : 'Could not delete worksheet.',
      });
    }
  };

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
};
