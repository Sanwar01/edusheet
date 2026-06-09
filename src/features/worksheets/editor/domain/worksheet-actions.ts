import { newId } from '@/components/worksheets/editor-shell.helpers';
import type {
  QuestionType,
  WorksheetContent,
  WorksheetSection,
  WorksheetSectionItem,
  WorksheetStructureBlock,
} from '@/types/worksheet';
import { isWorksheetQuestion } from '@/types/worksheet';
import type {
  PaletteItemType,
  StructurePaletteType,
} from '@/components/worksheets/editor-dnd-types';
import { isStructurePaletteType } from '@/components/worksheets/editor-dnd-types';

function clampIndex(index: number, length: number): number {
  return Math.max(0, Math.min(index, length));
}

export function buildQuestionTemplate(questionType: QuestionType) {
  const base = {
    id: newId('q'),
    prompt: 'New question',
    question_type: questionType,
    points: 1,
    answer: '',
  };

  if (questionType === 'multiple_choice') {
    return {
      ...base,
      options: ['Option 1', 'Option 2', 'Option 3'],
      answer: 'Option 1',
    };
  }
  if (questionType === 'true_false') {
    return {
      ...base,
      options: ['True', 'False'],
      answer: 'True',
    };
  }
  if (questionType === 'matching') {
    return {
      ...base,
      options: ['Pair 1', 'Pair 2', 'Pair 3'],
    };
  }
  if (questionType === 'fill_in_blank') {
    return {
      ...base,
      prompt: 'There are ___________________ months.',
      answer: 'twelve',
    };
  }
  return base;
}

export function buildStructureBlock(
  kind: StructurePaletteType,
): WorksheetStructureBlock {
  const id = newId('blk');
  switch (kind) {
    case 'heading':
      return { id, block_type: 'heading', text: 'Heading', level: 3 };
    case 'paragraph':
      return { id, block_type: 'paragraph', text: 'Add paragraph text…' };
    case 'divider':
      return { id, block_type: 'divider' };
    case 'spacer':
      return { id, block_type: 'spacer', heightPx: 24 };
    case 'callout':
      return {
        id,
        block_type: 'callout',
        text: 'Callout message',
        tone: 'info',
      };
    case 'image':
      return { id, block_type: 'image', src: '', alt: '' };
  }
}

export function updateSection(
  content: WorksheetContent,
  sectionId: string,
  updater: (section: WorksheetSection) => WorksheetSection,
): WorksheetContent {
  return {
    ...content,
    sections: content.sections.map((section) =>
      section.id === sectionId ? updater(section) : section,
    ),
  };
}

export function moveSections(
  content: WorksheetContent,
  oldIndex: number,
  newIndex: number,
): WorksheetContent {
  const next = [...content.sections];
  const [moved] = next.splice(oldIndex, 1);
  if (!moved) return content;
  next.splice(newIndex, 0, moved);
  return { ...content, sections: next };
}

export function addSection(content: WorksheetContent): {
  content: WorksheetContent;
  sectionId: string;
} {
  const sectionId = newId('sec');
  const insertIndex = content.sections.length;
  const section: WorksheetSection = {
    id: sectionId,
    type: 'section',
    heading: `Section ${insertIndex + 1}`,
    questions: [],
  };
  return {
    content: {
      ...content,
      sections: [...content.sections, section],
    },
    sectionId,
  };
}

export function insertSectionAt(
  content: WorksheetContent,
  insertIndex: number,
): {
  content: WorksheetContent;
  sectionId: string;
} {
  const sectionId = newId('sec');
  const clamped = clampIndex(insertIndex, content.sections.length);
  const section: WorksheetSection = {
    id: sectionId,
    type: 'section',
    heading: `Section ${clamped + 1}`,
    questions: [],
  };
  const sections = [...content.sections];
  sections.splice(clamped, 0, section);
  return { content: { ...content, sections }, sectionId };
}

export function addQuestionToSection(
  content: WorksheetContent,
  sectionId: string,
): WorksheetContent {
  return updateSection(content, sectionId, (section) => ({
    ...section,
    questions: [
      ...section.questions,
      {
        id: newId('q'),
        prompt: '',
        question_type: 'short_answer',
        points: 1,
      },
    ],
  }));
}

export function addQuestionFromPaletteToSection(
  content: WorksheetContent,
  sectionId: string,
  type: PaletteItemType,
  insertIndex?: number,
): WorksheetContent {
  if (type === 'section') return content;
  return updateSection(content, sectionId, (section) => {
    const items = [...section.questions];
    const clamped =
      typeof insertIndex === 'number'
        ? clampIndex(insertIndex, items.length)
        : items.length;
    const toInsert: WorksheetSectionItem = isStructurePaletteType(type)
      ? buildStructureBlock(type)
      : buildQuestionTemplate(type);
    items.splice(clamped, 0, toInsert);
    return { ...section, questions: items };
  });
}

export function addFromPalette(
  content: WorksheetContent,
  type: PaletteItemType,
): { content: WorksheetContent; openedSectionId?: string } {
  if (type === 'section') {
    const next = addSection(content);
    return { content: next.content, openedSectionId: next.sectionId };
  }

  const firstSection = content.sections[0];
  if (!firstSection) {
    const newSectionId = newId('sec');
    const seed: WorksheetSectionItem = isStructurePaletteType(type)
      ? buildStructureBlock(type)
      : buildQuestionTemplate(type);
    return {
      content: {
        ...content,
        sections: [
          ...content.sections,
          {
            id: newSectionId,
            type: 'section',
            heading: 'Section 1',
            questions: [seed],
          },
        ],
      },
      openedSectionId: newSectionId,
    };
  }

  return {
    content: updateSection(content, firstSection.id, (section) => ({
      ...section,
      questions: [
        ...section.questions,
        isStructurePaletteType(type)
          ? buildStructureBlock(type)
          : buildQuestionTemplate(type),
      ],
    })),
    openedSectionId: firstSection.id,
  };
}

export function duplicateSection(
  content: WorksheetContent,
  sectionId: string,
): { content: WorksheetContent; newSectionId: string | null } {
  const section = content.sections.find((s) => s.id === sectionId);
  if (!section) return { content, newSectionId: null };
  const newSectionId = newId('sec');
  return {
    content: {
      ...content,
      sections: [
        ...content.sections,
        {
          ...section,
          id: newSectionId,
          questions: section.questions.map((item) =>
            isWorksheetQuestion(item)
              ? { ...item, id: newId('q') }
              : { ...item, id: newId('blk') },
          ),
        },
      ],
    },
    newSectionId,
  };
}

export function deleteSection(
  content: WorksheetContent,
  sectionId: string,
): WorksheetContent {
  return {
    ...content,
    sections: content.sections.filter((section) => section.id !== sectionId),
  };
}
