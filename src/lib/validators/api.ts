import { z } from 'zod';
import { ThemeSchema, WorksheetContentSchema } from '@/lib/validators/worksheet';

export const GenerateWorksheetResponseSchema = z.object({
  worksheetId: z.string().min(1),
});

export const WorksheetRecordSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  content_json: WorksheetContentSchema,
  theme_json: ThemeSchema,
});

export const CreateWorksheetResponseSchema = z.object({
  data: z.object({
    id: z.string().min(1),
  }),
});
