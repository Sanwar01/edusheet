import type {
  WorksheetContent,
  WorksheetLayout,
  WorksheetQuestion,
} from '@/types/worksheet';
import { buildWorksheetLayout } from '@/features/worksheets/layout';

export const newId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
};

export const buildLayoutPayload = (
  content: WorksheetContent,
  spacingPreset: WorksheetLayout['spacingPreset'],
): WorksheetLayout => {
  return buildWorksheetLayout(content, spacingPreset);
};

export const duplicateQuestion = (
  question: WorksheetQuestion,
): WorksheetQuestion => {
  return { ...question, id: newId('q') };
};
