import type { GenerateWorksheetInput } from '@/lib/validators/ai';

export function buildWorksheetPrompt(input: GenerateWorksheetInput) {
  return `You are an educational worksheet generator for teachers.

Generate a worksheet with:
- Topic: ${input.topic}
- Subject: ${input.subject}
- Grade Level: ${input.gradeLevel}
- Worksheet Type: ${input.worksheetType}
- Number of Questions: ${input.numberOfQuestions}
- Allowed Question Types: ${input.questionTypes.join(', ')}
- Difficulty: ${input.difficulty}
- Additional Instructions: ${input.additionalInstructions ?? 'None'}

Critical rules:
1) Return strict JSON only. Do not return markdown.
2) Do not include any styling, layout, or visual design instructions.
3) Content must be age-appropriate.
4) Use this exact shape:
{
  "title": "string",
  "instructions": "string",
  "sections": [
    {
      "id": "string",
      "type": "section",
      "heading": "string",
      "questions": [
        {
          "id": "string",
          "prompt": "string",
          "question_type": "short_answer|multiple_choice|true_false|fill_in_blank|matching|essay",
          "options": ["string"],
          "answer": "string",
          "points": 1
        }
      ]
    }
  ]
}
5) Use stable short ids such as sec_1 and q_1.
6) For multiple_choice questions include 3-5 options.
7) points must be a positive integer when included.`;
}
