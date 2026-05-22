import type { QuestionType } from '@/types/worksheet';

export const STRUCTURE_PALETTE_TYPES = [
  'heading',
  'paragraph',
  'divider',
  'spacer',
  'callout',
  'image',
] as const;

export type StructurePaletteType = (typeof STRUCTURE_PALETTE_TYPES)[number];

export type PaletteItemType =
  | 'section'
  | QuestionType
  | StructurePaletteType;

export const PALETTE_DRAG_MIME = 'application/x-edusheet-palette-item';

export function isStructurePaletteType(
  value: string,
): value is StructurePaletteType {
  return (STRUCTURE_PALETTE_TYPES as readonly string[]).includes(value);
}

export function isPaletteItemType(value: string): value is PaletteItemType {
  return (
    value === 'section' ||
    isStructurePaletteType(value) ||
    value === 'short_answer' ||
    value === 'multiple_choice' ||
    value === 'true_false' ||
    value === 'fill_in_blank' ||
    value === 'matching' ||
    value === 'essay'
  );
}
