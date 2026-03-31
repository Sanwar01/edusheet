'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { WorksheetRowActions } from '@/components/worksheets/worksheet-row-actions';

type WorksheetCardData = {
  id: string;
  title: string;
  subject: string | null;
  grade_level: string | null;
  status: string;
  updated_at: string;
};

export function WorksheetCard({ worksheet }: { worksheet: WorksheetCardData }) {
  const router = useRouter();

  return (
    <Card
      className="group cursor-pointer transition-shadow hover:shadow-md"
      onClick={() => router.push(`/dashboard/worksheets/${worksheet.id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display font-semibold text-card-foreground">
              {worksheet.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {[worksheet.subject, worksheet.grade_level]
                .filter(Boolean)
                .join(' · ') || 'No subject'}
            </p>
          </div>
          <WorksheetRowActions worksheetId={worksheet.id} />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${worksheet.status === 'published' ? 'bg-accent/20 text-accent' : 'bg-secondary text-secondary-foreground'}`}
          >
            {worksheet.status}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(worksheet.updated_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
