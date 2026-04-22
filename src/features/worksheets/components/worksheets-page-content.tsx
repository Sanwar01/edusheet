'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Filter, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { assertApiOk } from '@/lib/api/client';
import {
  WorksheetsListCard,
  type WorksheetListItem,
} from './worksheets-list-card';

type StatusFilter = 'all' | 'draft' | 'published';

export function WorksheetsPageContent() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [worksheets, setWorksheets] = useState<WorksheetListItem[]>([]);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadWorksheets() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/worksheets', {
          method: 'GET',
          cache: 'no-store',
        });
        await assertApiOk(response, 'Failed to load worksheets.');
        const result = (await response.json()) as {
          data?: Array<{
            id: string;
            title: string;
            subject: string | null;
            grade_level: string | null;
            status: string | null;
            updated_at: string;
          }>;
        };

        if (!active) return;

        const next = (result.data ?? []).map((worksheet) => ({
          ...worksheet,
          status: worksheet.status ?? 'draft',
        }));
        setWorksheets(next);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Failed to load worksheets');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadWorksheets();
    return () => {
      active = false;
    };
  }, [refreshTick]);

  const uniqueSubjects = useMemo(() => {
    return Array.from(
      new Set(
        worksheets
          .map((worksheet) => worksheet.subject)
          .filter((subject): subject is string => Boolean(subject)),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [worksheets]);

  const filteredWorksheets = useMemo(() => {
    const query = search.trim().toLowerCase();
    return worksheets.filter((worksheet) => {
      const matchesQuery =
        query.length === 0 ||
        worksheet.title.toLowerCase().includes(query) ||
        (worksheet.subject?.toLowerCase().includes(query) ?? false) ||
        (worksheet.grade_level?.toLowerCase().includes(query) ?? false);

      const matchesStatus =
        statusFilter === 'all' || worksheet.status === statusFilter;
      const matchesSubject =
        subjectFilter === 'all' || worksheet.subject === subjectFilter;

      return matchesQuery && matchesStatus && matchesSubject;
    });
  }, [search, statusFilter, subjectFilter, worksheets]);

  const refetch = () => setRefreshTick((value) => value + 1);
  const hasFilters = Boolean(search.trim()) || statusFilter !== 'all' || subjectFilter !== 'all';

  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">
            My Worksheets
          </h1>
          <p className="mt-1 text-muted-foreground">
            Browse, search, and manage all your worksheets in one place.
          </p>
        </div>
        <Link
          href="/dashboard/worksheets/new"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
        >
          <Plus className="mr-2 h-5 w-5" /> Create New
        </Link>
      </div>

      <Card className="mb-6 border-border/50 bg-card/50 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, subject, or grade..."
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-full md:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
            </SelectContent>
          </Select>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full md:w-52">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {uniqueSubjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {error ? (
        <Card className="border-border/50 bg-card/50 p-8 text-center shadow-sm">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={refetch}>
            Retry
          </Button>
        </Card>
      ) : (
        <WorksheetsListCard
          title="All Worksheets"
          loading={loading}
          worksheets={filteredWorksheets}
          onWorksheetChanged={refetch}
          showPagination={false}
          emptyTitle={hasFilters ? 'No matches' : 'No worksheets yet'}
          emptyDescription={
            hasFilters
              ? 'No worksheets match your current search or filters.'
              : "You haven't created any worksheets. Generate your first one with AI in seconds."
          }
          emptyAction={
            hasFilters ? (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setSubjectFilter('all');
                }}
              >
                <Filter className="mr-2 h-4 w-4" />
                Clear filters
              </Button>
            ) : undefined
          }
        />
      )}
    </>
  );
}
