import type { WorksheetTheme } from '@/types/worksheet';

export const fontFamilyClassMap: Record<WorksheetTheme['fontFamily'], string> = {
  inter: 'font-sans',
  lora: 'font-serif',
  nunito: 'font-sans',
};

export const sectionSpacingClassMap: Record<WorksheetTheme['spacingPreset'], string> =
  {
    compact: 'space-y-2',
    comfortable: 'space-y-4',
    spacious: 'space-y-6',
  };

export const questionSpacingClassMap: Record<WorksheetTheme['spacingPreset'], string> =
  {
    compact: 'space-y-1',
    comfortable: 'space-y-2',
    spacious: 'space-y-4',
  };
