import { z } from 'zod';

const QUESTION_TYPE_ALIASES: Record<string, string> = {
  'multiple choice': 'multiple_choice',
  multiple_choice: 'multiple_choice',
  mcq: 'multiple_choice',
  'short answer': 'short_answer',
  short_answer: 'short_answer',
  short: 'short_answer',
  'true false': 'true_false',
  'true/false': 'true_false',
  true_false: 'true_false',
  'fill in blank': 'fill_in_blank',
  'fill in the blank': 'fill_in_blank',
  fill_in_blank: 'fill_in_blank',
  matching: 'matching',
  essay: 'essay',
};

const RawQuestionTypeSchema = z.union([
  z.string(),
  z.object({
    id: z.string().optional(),
    value: z.string().optional(),
    label: z.string().optional(),
    type: z.string().optional(),
  }),
]);

export const GenerateWorksheetInputSchema = z
  .object({
    topic: z.string().min(2),
    subject: z.string().min(2),
    gradeLevel: z.string().min(1),
    numberOfQuestions: z.number().int().min(1).max(50).optional(),
    numQuestions: z.number().int().min(1).max(50).optional(),
    questionTypes: z.array(RawQuestionTypeSchema).min(1),
    difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),
    additionalInstructions: z.string().max(1000).optional(),
  })
  .refine((input) => Boolean(input.numberOfQuestions ?? input.numQuestions), {
    message: 'numberOfQuestions (or numQuestions) is required',
    path: ['numberOfQuestions'],
  })
  .transform((input) => {
    const numberOfQuestions = (input.numberOfQuestions ?? input.numQuestions)!;

    const normalizedQuestionTypes = input.questionTypes
      .map((raw) => {
        const source =
          typeof raw === 'string'
            ? raw
            : raw.id ?? raw.value ?? raw.type ?? raw.label ?? '';
        const normalized = QUESTION_TYPE_ALIASES[source.trim().toLowerCase()];
        return normalized ?? source.trim().toLowerCase().replace(/\s+/g, '_');
      })
      .filter((value) => value.length > 0);

    return {
      topic: input.topic,
      subject: input.subject,
      gradeLevel: input.gradeLevel,
      numberOfQuestions,
      questionTypes: Array.from(new Set(normalizedQuestionTypes)),
      difficulty: input.difficulty,
      additionalInstructions: input.additionalInstructions,
    };
  });

export type GenerateWorksheetInput = z.infer<typeof GenerateWorksheetInputSchema>;
