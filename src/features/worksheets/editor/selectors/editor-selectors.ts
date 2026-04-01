import type { WorksheetContent } from '@/types/worksheet';

export function getCompletion(content: WorksheetContent) {
  const hasTitle = content.title.trim().length > 0;
  const hasInstructions = (content.instructions || '').trim().length > 0;
  const hasSection = content.sections.length > 0;
  const questionCount = content.sections.reduce(
    (sum, section) => sum + section.questions.length,
    0,
  );
  const hasQuestions = questionCount > 0;

  const doneCount = [hasTitle, hasInstructions, hasSection, hasQuestions].filter(
    Boolean,
  ).length;

  return {
    hasTitle,
    hasInstructions,
    hasSection,
    hasQuestions,
    questionCount,
    doneCount,
  };
}

export function isWorksheetBlank(content: WorksheetContent): boolean {
  return content.sections.length === 0;
}

export function getPointsBySection(content: WorksheetContent): Record<string, number> {
  return Object.fromEntries(
    content.sections.map((section) => [
      section.id,
      section.questions.reduce((sum, q) => sum + (q.points ?? 0), 0),
    ]),
  );
}

export function getPointsTotal(pointsBySection: Record<string, number>): number {
  return Object.values(pointsBySection).reduce((sum, points) => sum + points, 0);
}
