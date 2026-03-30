import type { WorksheetContent, WorksheetLayout, WorksheetTheme } from '@/types/worksheet';

export const defaultTheme: WorksheetTheme = {
  headingFontSize: 28,
  bodyFontSize: 16,
  fontFamily: 'inter',
  primaryColor: '#2563eb',
  textColor: '#111827',
  spacingPreset: 'comfortable',
};

export function defaultContent(topic = 'New Topic'): WorksheetContent {
  return {
    title: `Worksheet: ${topic}`,
    instructions: 'Read each question carefully and answer clearly.',
    sections: [
      {
        id: 'sec_1',
        type: 'section',
        heading: 'Section 1',
        questions: [
          {
            id: 'q_1',
            prompt: 'Write your answer here.',
            question_type: 'short_answer',
            points: 1,
          },
        ],
      },
    ],
  };
}

export function buildLayout(content: WorksheetContent): WorksheetLayout {
  return {
    sectionOrder: content.sections.map((section) => section.id),
    questionOrderBySection: Object.fromEntries(
      content.sections.map((section) => [section.id, section.questions.map((q) => q.id)]),
    ),
    spacingPreset: 'comfortable',
  };
}
