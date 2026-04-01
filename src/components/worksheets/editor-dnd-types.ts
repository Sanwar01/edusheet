import type { QuestionType } from '@/types/worksheet';

export type PaletteItemType = 'section' | QuestionType;

export const PALETTE_DRAG_MIME = 'application/x-edusheet-palette-item';

export function isPaletteItemType(value: string): value is PaletteItemType {
  return (
    value === 'section' ||
    value === 'short_answer' ||
    value === 'multiple_choice' ||
    value === 'true_false' ||
    value === 'fill_in_blank' ||
    value === 'matching' ||
    value === 'essay'
  );
}
