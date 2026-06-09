import type { AnswerLineWidth, WorksheetQuestion } from '@/types/worksheet';

export const DEFAULT_ANSWER_LINE_WIDTH: AnswerLineWidth = 'full';

export function resolveAnswerLineWidth(
  question: WorksheetQuestion,
): AnswerLineWidth {
  return question.answerLineWidth ?? DEFAULT_ANSWER_LINE_WIDTH;
}

export function answerLineWidthClass(width: AnswerLineWidth): string {
  switch (width) {
    case 'short':
      return 'w-40';
    case 'medium':
      return 'w-64';
    case 'long':
      return 'w-[85%]';
    case 'full':
      return 'w-full';
  }
}

export function answerLineWidthCss(width: AnswerLineWidth): string {
  switch (width) {
    case 'short':
      return '160px';
    case 'medium':
      return '256px';
    case 'long':
      return '85%';
    case 'full':
      return '100%';
  }
}
