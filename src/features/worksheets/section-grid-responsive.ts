import type { SectionLayoutConfig } from '@/types/worksheet';

/**
 * Tailwind grid column classes for section question grids.
 * Uses stepped breakpoints so narrow viewports stay single-column until there is
 * enough width; 3- and 4-column layouts ramp up gradually instead of jumping
 * straight to many columns at `sm`.
 */
export function sectionQuestionGridColsClass(
  gridColumns: SectionLayoutConfig['gridColumns'] | undefined,
): string {
  const n = gridColumns ?? 2;
  if (n === 2) {
    return 'grid-cols-1 sm:grid-cols-2';
  }
  if (n === 3) {
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
  }
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4';
}
