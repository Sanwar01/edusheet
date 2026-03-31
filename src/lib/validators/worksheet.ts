import { z } from 'zod';

export const QuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  question_type: z.enum([
    'short_answer',
    'multiple_choice',
    'true_false',
    'fill_in_blank',
    'matching',
    'essay',
  ]),
  options: z.array(z.string()).optional().default([]),
  answer: z.string().optional(),
  points: z.number().int().positive().optional(),
});

export const SectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal('section'),
  heading: z.string().min(1),
  questions: z.array(QuestionSchema).min(1),
});

export const WorksheetContentSchema = z.object({
  title: z.string().min(1),
  instructions: z.string().min(1),
  sections: z.array(SectionSchema).min(1),
});

export const LayoutSchema = z.object({
  sectionOrder: z.array(z.string()).default([]),
  questionOrderBySection: z.record(z.string(), z.array(z.string())).default({}),
  spacingPreset: z.enum(['compact', 'comfortable', 'spacious']).default('comfortable'),
});

export const ThemeSchema = z.object({
  headingFontSize: z.number().min(16).max(56).default(28),
  bodyFontSize: z.number().min(12).max(24).default(16),
  fontFamily: z.enum(['inter', 'lora', 'nunito']).default('inter'),
  primaryColor: z.string().default('#2563eb'),
  textColor: z.string().default('#111827'),
  spacingPreset: z.enum(['compact', 'comfortable', 'spacious']).default('comfortable'),
});

export const CreateWorksheetSchema = z.object({
  title: z.string().min(1),
  subject: z.string().min(1),
  grade_level: z.string().min(1),
  content_json: WorksheetContentSchema,
  layout_json: LayoutSchema,
  theme_json: ThemeSchema,
});

export const UpdateWorksheetSchema = CreateWorksheetSchema.partial();
