import { FileDown, GripVertical, Sparkles } from 'lucide-react';

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

export const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Generation',
    description:
      'Enter your topic, grade level, and preferences. Get a complete worksheet in seconds.',
  },
  {
    icon: GripVertical,
    title: 'Drag & Drop Editor',
    description:
      'Rearrange sections, edit questions, and customize everything with full control.',
  },
  {
    icon: FileDown,
    title: 'Export to PDF',
    description:
      'Print-ready worksheets with clean formatting. Download and distribute instantly.',
  },
];

export const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: [
      '10 AI generations/month',
      '5 PDF exports/month',
      'Basic templates',
      'Drag & drop editor',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    features: [
      'Unlimited AI generations',
      'Unlimited exports',
      'Premium templates',
      'Priority support',
      'Version history',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
];
