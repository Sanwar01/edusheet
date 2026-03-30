import { z } from 'zod';

export const GenerateWorksheetInputSchema = z.object({
  topic: z.string().min(2),
  subject: z.string().min(2),
  gradeLevel: z.string().min(1),
  numberOfQuestions: z.number().int().min(1).max(50),
  questionTypes: z.array(z.string()).min(1),
  difficulty: z.enum(['easy', 'medium', 'hard', 'mixed']),
  additionalInstructions: z.string().max(1000).optional(),
});

export type GenerateWorksheetInput = z.infer<typeof GenerateWorksheetInputSchema>;
