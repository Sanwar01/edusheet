export type QuestionType =
  | 'short_answer'
  | 'multiple_choice'
  | 'true_false'
  | 'fill_in_blank'
  | 'matching';

export interface WorksheetQuestion {
  id: string;
  prompt: string;
  question_type: QuestionType;
  options?: string[];
  answer?: string;
  points?: number;
}

export interface WorksheetSection {
  id: string;
  type: 'section';
  heading: string;
  questions: WorksheetQuestion[];
}

export interface WorksheetContent {
  title: string;
  instructions: string;
  sections: WorksheetSection[];
}

export interface WorksheetLayout {
  sectionOrder: string[];
  questionOrderBySection: Record<string, string[]>;
  spacingPreset: 'compact' | 'comfortable' | 'spacious';
}

export interface WorksheetTheme {
  headingFontSize: number;
  bodyFontSize: number;
  fontFamily: 'inter' | 'lora' | 'nunito';
  primaryColor: string;
  textColor: string;
  spacingPreset: 'compact' | 'comfortable' | 'spacious';
}
