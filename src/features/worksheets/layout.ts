import type { WorksheetContent, WorksheetLayout } from '@/types/worksheet';

export function buildWorksheetLayout(
  content: WorksheetContent,
  spacingPreset: WorksheetLayout['spacingPreset'] = 'comfortable',
): WorksheetLayout {
  return {
    sectionOrder: content.sections.map((section) => section.id),
    questionOrderBySection: Object.fromEntries(
      content.sections.map((section) => [
        section.id,
        section.questions.map((question) => question.id),
      ]),
    ),
    spacingPreset,
  };
}
