import type {
  SectionLayoutConfig,
  WorksheetContent,
  WorksheetLayout,
} from '@/types/worksheet';

export const defaultSectionLayout = (): SectionLayoutConfig => ({
  mode: 'stack',
  border: 'none',
});

export function buildWorksheetLayout(
  content: WorksheetContent,
  spacingPreset: WorksheetLayout['spacingPreset'] = 'comfortable',
  previous?: WorksheetLayout | null,
): WorksheetLayout {
  const sectionLayouts: Record<string, SectionLayoutConfig> = {};
  const prevLayouts = previous?.sectionLayouts ?? {};

  for (const section of content.sections) {
    const existing = prevLayouts[section.id];
    sectionLayouts[section.id] = existing
      ? { ...defaultSectionLayout(), ...existing }
      : defaultSectionLayout();
  }

  return {
    sectionOrder: content.sections.map((section) => section.id),
    questionOrderBySection: Object.fromEntries(
      content.sections.map((section) => [
        section.id,
        section.questions.map((question) => question.id),
      ]),
    ),
    spacingPreset,
    sectionLayouts,
  };
}
