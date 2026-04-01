import { z } from 'zod';

export const QuestionSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().trim().min(1, 'Question prompt is required'),
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
  points: z.number().int().min(1, 'Points must be at least 1').optional(),
}).superRefine((question, ctx) => {
  if (question.question_type === 'multiple_choice') {
    const options = question.options ?? [];
    if (options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['options'],
        message: 'Multiple choice requires at least 2 options',
      });
    }
    if (!question.answer || !options.includes(question.answer)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['answer'],
        message: 'Multiple choice requires selecting a correct answer',
      });
    }
  }

  if (
    question.question_type === 'true_false' &&
    question.answer &&
    question.answer !== 'True' &&
    question.answer !== 'False'
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['answer'],
      message: 'True/False answer must be True or False',
    });
  }
});

export const SectionSchema = z.object({
  id: z.string().min(1),
  type: z.literal('section'),
  heading: z.string().default(''),
  questions: z.array(QuestionSchema).default([]),
});

export const WorksheetContentSchema = z.object({
  title: z.string().trim().min(1, 'Worksheet title is required'),
  instructions: z.string().default(''),
  sections: z.array(SectionSchema).default([]),
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
