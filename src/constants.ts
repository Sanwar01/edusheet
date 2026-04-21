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

export const steps = [
  {
    number: '01',
    title: 'Tell us what you need',
    description:
      'Choose the topic, year group, worksheet type, and any details you want included.',
  },
  {
    number: '02',
    title: 'Get a first draft instantly',
    description:
      'A full worksheet appears in seconds, ready for you to review and adjust.',
  },
  {
    number: '03',
    title: 'Edit and download',
    description:
      'Make quick changes, preview the result, and export a worksheet ready for class.',
  },
];

export const testimonials = [
  {
    quote: 'This saves me so much time every week.',
    role: 'Maths tutor',
  },
  {
    quote: 'I used to spend hours on this. Now it takes minutes.',
    role: 'Primary teacher',
  },
  {
    quote: 'It’s simple enough that I didn’t need to learn anything.',
    role: 'Private tutor',
  },
  {
    quote: 'Finally something that feels made for teachers.',
    role: 'Department lead',
  },
];

export const faqs = [
  {
    q: 'Is this hard to use?',
    a: 'No. If you can type, you can use it.',
  },
  {
    q: 'Can I change the worksheet afterwards?',
    a: 'Yes. You can edit every part of it before downloading.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. It works in your browser.',
  },
  {
    q: 'Is this suitable for schools too?',
    a: 'Yes. It works for individual teachers, tutors, and larger teaching teams.',
  },
];
