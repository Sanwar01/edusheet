export type QuestionType =
  | 'short_answer'
  | 'multiple_choice'
  | 'true_false'
  | 'fill_in_blank'
  | 'matching'
  | 'essay';

export interface Worksheet {
  id: string;
  user_id: string;
  title: string;
  subject: string | null;
  grade_level: string | null;
  status: string;
  content_json: WorksheetContent;
  layout_json: WorksheetLayout;
  theme_json: WorksheetTheme;
  created_at: string;
  updated_at: string;
}

export interface WorksheetQuestion {
  id: string;
  prompt: string;
  question_type: QuestionType;
  options?: string[];
  answer?: string;
  points?: number;
}

/** Rich content inside a section (shown between questions). */
export type WorksheetStructureBlock =
  | {
      id: string;
      block_type: 'heading';
      text: string;
      level?: 2 | 3 | 4;
    }
  | {
      id: string;
      block_type: 'paragraph';
      text: string;
    }
  | { id: string; block_type: 'divider' }
  | {
      id: string;
      block_type: 'spacer';
      heightPx?: number;
    }
  | {
      id: string;
      block_type: 'callout';
      text: string;
      tone?: 'info' | 'warning' | 'success';
    }
  | {
      id: string;
      block_type: 'image';
      src: string;
      alt: string;
    };

/** Rows inside a section: graded questions and optional layout blocks. */
export type WorksheetSectionItem = WorksheetQuestion | WorksheetStructureBlock;

export function isWorksheetQuestion(
  item: WorksheetSectionItem,
): item is WorksheetQuestion {
  return 'question_type' in item;
}

export function isStructureBlock(
  item: WorksheetSectionItem,
): item is WorksheetStructureBlock {
  return 'block_type' in item;
}

export interface WorksheetSection {
  id: string;
  type: 'section';
  heading: string;
  /** Questions and rich layout blocks in document order. */
  questions: WorksheetSectionItem[];
}

export interface WorksheetContent {
  title: string;
  instructions: string;
  sections: WorksheetSection[];
}

/** Per-section visual layout (questions within the section). */
export interface SectionLayoutConfig {
  mode: 'stack' | 'grid';
  /** Used when mode is grid (2–4 columns). */
  gridColumns?: 2 | 3 | 4;
  /** Border treatment for grid-style sections. */
  border?: 'none' | 'outer' | 'cells';
}

export interface WorksheetLayout {
  sectionOrder: string[];
  questionOrderBySection: Record<string, string[]>;
  spacingPreset: 'compact' | 'comfortable' | 'spacious';
  /** Per-section layout; missing keys at runtime default to stack via buildWorksheetLayout. */
  sectionLayouts: Record<string, SectionLayoutConfig>;
}

export interface WorksheetTheme {
  headingFontSize: number;
  bodyFontSize: number;
  fontFamily: 'inter' | 'lora' | 'nunito';
  primaryColor: string;
  textColor: string;
  spacingPreset: 'compact' | 'comfortable' | 'spacious';
  /** Page header: default title block vs lesson handout (title + name line). */
  headerStyle: 'default' | 'lesson';
  /** When headerStyle is lesson, show a Name: _______ line on the right. */
  showNameLine: boolean;
  /** How multiple choice / true-false options appear in preview & export. */
  optionLayout: 'vertical' | 'horizontal';
  /** Weight for question prompts in preview & export. */
  promptFontWeight: 'normal' | 'medium' | 'semibold';
  /** Muted color for options, answer lines, response boxes, instructions, and labels in preview & export. */
  answerTextColor: string;
}
