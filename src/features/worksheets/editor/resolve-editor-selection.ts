import type {
  WorksheetContent,
  WorksheetQuestion,
  WorksheetSection,
  WorksheetStructureBlock,
} from '@/types/worksheet';
import { isStructureBlock, isWorksheetQuestion } from '@/types/worksheet';

export type EditorSelection =
  | { type: 'none' }
  | { type: 'worksheet_title' }
  | { type: 'worksheet_instructions' }
  | {
      type: 'section';
      sectionId: string;
      section: WorksheetSection;
      sectionIndex: number;
    }
  | {
      type: 'question';
      sectionId: string;
      question: WorksheetQuestion;
    }
  | {
      type: 'block';
      sectionId: string;
      block: WorksheetStructureBlock;
    };

function findSectionItem(
  content: WorksheetContent,
  itemId: string,
): { sectionId: string; section: WorksheetSection } | null {
  for (const section of content.sections) {
    if (section.questions.some((row) => row.id === itemId)) {
      return { sectionId: section.id, section };
    }
  }
  return null;
}

export function resolveEditorSelection(
  content: WorksheetContent,
  selectedNodeId: string | null,
): EditorSelection {
  if (!selectedNodeId) return { type: 'none' };
  if (selectedNodeId === 'worksheet_title') return { type: 'worksheet_title' };
  if (selectedNodeId === 'worksheet_instructions') {
    return { type: 'worksheet_instructions' };
  }

  if (selectedNodeId.startsWith('section_')) {
    const sectionId = selectedNodeId.replace('section_', '');
    const sectionIndex = content.sections.findIndex((s) => s.id === sectionId);
    const section = content.sections[sectionIndex];
    if (!section) return { type: 'none' };
    return { type: 'section', sectionId, section, sectionIndex };
  }

  if (selectedNodeId.startsWith('question_')) {
    const questionId = selectedNodeId.replace('question_', '');
    const found = findSectionItem(content, questionId);
    if (!found) return { type: 'none' };
    const question = found.section.questions.find(
      (row): row is WorksheetQuestion =>
        row.id === questionId && isWorksheetQuestion(row),
    );
    if (!question) return { type: 'none' };
    return {
      type: 'question',
      sectionId: found.sectionId,
      question,
    };
  }

  if (selectedNodeId.startsWith('block_')) {
    const blockId = selectedNodeId.replace('block_', '');
    const found = findSectionItem(content, blockId);
    if (!found) return { type: 'none' };
    const block = found.section.questions.find(
      (row): row is WorksheetStructureBlock =>
        row.id === blockId && isStructureBlock(row),
    );
    if (!block) return { type: 'none' };
    return { type: 'block', sectionId: found.sectionId, block };
  }

  return { type: 'none' };
}

export function selectionLabel(selection: EditorSelection): string {
  switch (selection.type) {
    case 'none':
      return 'Nothing selected';
    case 'worksheet_title':
      return 'Worksheet title';
    case 'worksheet_instructions':
      return 'Instructions';
    case 'section':
      return `Section ${selection.sectionIndex + 1}`;
    case 'question':
      return 'Question';
    case 'block': {
      const labels: Record<WorksheetStructureBlock['block_type'], string> = {
        heading: 'Heading',
        paragraph: 'Paragraph',
        divider: 'Divider',
        spacer: 'Spacer',
        callout: 'Callout',
        image: 'Image',
      };
      return labels[selection.block.block_type];
    }
    default:
      return 'Selection';
  }
}
