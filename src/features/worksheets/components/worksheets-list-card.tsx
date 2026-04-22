'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Edit, FileText, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { assertApiOk } from '@/lib/api/client';

export type WorksheetListItem = {
  id: string;
  title: string;
  subject: string | null;
  grade_level: string | null;
  status: string;
  updated_at: string;
};

type WorksheetsListCardProps = {
  loading: boolean;
  worksheets: WorksheetListItem[];
  onWorksheetChanged: () => void;
  title?: string;
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
};

export function WorksheetsListCard({
  loading,
  worksheets,
  onWorksheetChanged,
  title = 'Recent Worksheets',
  showPagination = true,
  currentPage = 1,
  totalPages = 1,
  onPreviousPage,
  onNextPage,
  emptyTitle = 'No worksheets yet',
  emptyDescription = "You haven't created any worksheets. Generate your first one with AI in seconds.",
  emptyAction,
}: WorksheetsListCardProps) {
  const [worksheetToDelete, setWorksheetToDelete] =
    useState<WorksheetListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const duplicateWorksheet = async (worksheetId: string) => {
    try {
      const res = await fetch(`/api/worksheets/${worksheetId}/duplicate`, {
        method: 'POST',
      });
      await assertApiOk(res, 'Failed to duplicate worksheet.');
      toast.success('Worksheet duplicated');
      onWorksheetChanged();
    } catch (error) {
      toast.error('Duplicate failed', {
        description:
          error instanceof Error ? error.message : 'Could not duplicate worksheet.',
      });
    }
  };

  const deleteWorksheet = async () => {
    if (!worksheetToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/worksheets/${worksheetToDelete.id}`, {
        method: 'DELETE',
      });
      await assertApiOk(res, 'Failed to delete worksheet.');
      toast.success('Worksheet deleted');
      setWorksheetToDelete(null);
      onWorksheetChanged();
    } catch (error) {
      toast.error('Delete failed', {
        description:
          error instanceof Error ? error.message : 'Could not delete worksheet.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <h2 className="mb-4 text-xl font-bold font-display tracking-tight text-foreground">
        {title}
      </h2>
      <Card className="overflow-hidden border-border/50 bg-card/50 shadow-sm backdrop-blur-sm">
        {loading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : worksheets.length > 0 ? (
          <>
            <div className="divide-y">
              {worksheets.map((ws) => (
                <div
                  key={ws.id}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50 sm:p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/worksheets/${ws.id}/edit`}
                        className="line-clamp-1 text-lg font-semibold transition-colors hover:text-primary"
                      >
                        {ws.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {ws.subject && (
                          <span className="rounded-md bg-secondary px-2 py-0.5">
                            {ws.subject}
                          </span>
                        )}
                        {ws.grade_level && (
                          <span className="rounded-md bg-secondary px-2 py-0.5">
                            {ws.grade_level}
                          </span>
                        )}
                        <span>{format(new Date(ws.updated_at), 'MMM d, yyyy')}</span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${
                            ws.status === 'published'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {ws.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/worksheets/${ws.id}/edit`}
                      className="hidden h-9 items-center justify-center rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground sm:inline-flex"
                    >
                      Edit
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-lg">
                          <MoreVertical className="h-5 w-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/worksheets/${ws.id}/edit`}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" /> Edit Worksheet
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => duplicateWorksheet(ws.id)}
                        >
                          <Copy className="mr-2 h-4 w-4" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:bg-destructive/10"
                          onClick={() => setWorksheetToDelete(ws)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
            {showPagination ? (
              <div className="flex items-center justify-between border-t px-4 py-3 sm:px-6">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onPreviousPage}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onNextPage}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="mb-2 text-xl font-bold">{emptyTitle}</h3>
            <p className="mb-6 max-w-md text-muted-foreground">{emptyDescription}</p>
            {emptyAction ?? (
              <Link
                href="/dashboard/worksheets/new"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-md"
              >
                Create First Worksheet
              </Link>
            )}
          </div>
        )}
      </Card>
      <Dialog
        open={Boolean(worksheetToDelete)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setWorksheetToDelete(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete worksheet?</DialogTitle>
            <DialogDescription>
              {worksheetToDelete
                ? `This will permanently delete "${worksheetToDelete.title}". This action cannot be undone.`
                : 'This action cannot be undone.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setWorksheetToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={deleteWorksheet}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
