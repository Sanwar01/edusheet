'use client';

import Link from 'next/link';
import { Copy, Edit, FileText, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { format } from 'date-fns';
import type { DashboardData } from '@/features/dashboard/server/get-dashboard-data';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

type Worksheet = DashboardData['worksheets'][number];

type RecentWorksheetsCardProps = {
  loading: boolean;
  worksheets: Worksheet[];
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

export function RecentWorksheetsCard({
  loading,
  worksheets,
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
}: RecentWorksheetsCardProps) {
  return (
    <>
      <h2 className="text-xl font-bold font-display tracking-tight text-foreground mb-4">
        Recent Worksheets
      </h2>
      <Card className="border-border/50 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
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
                  className="p-4 sm:p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:flex w-12 h-12 rounded-xl bg-primary/10 text-primary items-center justify-center shrink-0">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <Link
                        href={`/dashboard/worksheets/${ws.id}/edit`}
                        className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1"
                      >
                        {ws.title}
                      </Link>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1 flex-wrap">
                        {ws.subject && (
                          <span className="bg-secondary px-2 py-0.5 rounded-md">
                            {ws.subject}
                          </span>
                        )}
                        {ws.grade_level && (
                          <span className="bg-secondary px-2 py-0.5 rounded-md">
                            {ws.grade_level}
                          </span>
                        )}
                        <span>
                          {format(new Date(ws.updated_at), 'MMM d, yyyy')}
                        </span>
                        <span
                          className={`capitalize text-xs font-semibold px-2 py-0.5 rounded-md ${
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
                      className="hidden sm:inline-flex h-9 px-4 items-center justify-center rounded-lg border bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      Edit
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-lg"
                        >
                          <MoreVertical className="w-5 h-5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/dashboard/worksheets/${ws.id}/edit`}
                            className="cursor-pointer"
                          >
                            <Edit className="w-4 h-4 mr-2" /> Edit Worksheet
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => {
                            // TODO: wire up duplicate action.
                            console.log('duplicate', ws.id);
                          }}
                        >
                          <Copy className="w-4 h-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive/10 cursor-pointer"
                          onClick={() => {
                            if (
                              confirm(
                                'Are you sure you want to delete this worksheet?',
                              )
                            ) {
                              // TODO: wire up delete action.
                              console.log('delete', ws.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
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
          </>
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">No worksheets yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              You haven&apos;t created any worksheets. Generate your first one
              with AI in seconds.
            </p>
            <Link
              href="/dashboard/worksheets/new"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-md"
            >
              Create First Worksheet
            </Link>
          </div>
        )}
      </Card>
    </>
  );
}
