export const GRADE_LEVELS = [
  'Kindergarten',
  '1st Grade',
  '2nd Grade',
  '3rd Grade',
  '4th Grade',
  '5th Grade',
  'Middle School',
  'High School',
];

export const SUBJECTS = [
  'Biology',
  'Math',
  'English',
  'Science',
  'History',
  'Social Studies',
  'Art',
  'Music',
  'Physical Education',
  'Computer Science',
];

export const QUESTION_TYPES = [
  { id: 'multiple_choice', label: 'Multiple Choice' },
  { id: 'short_answer', label: 'Short Answer' },
  { id: 'true_false', label: 'True / False' },
  { id: 'fill_in_blank', label: 'Fill in the Blank' },
  { id: 'essay', label: 'Essay' },
];

export const WORKSHEET_TYPES = [
  { id: 'practice', label: 'Practice' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'exam', label: 'Exam' },
  { id: 'homework', label: 'Homework' },
  { id: 'review_sheet', label: 'Review sheet' },
] as const;

export type WorksheetType = (typeof WORKSHEET_TYPES)[number]['id'];
