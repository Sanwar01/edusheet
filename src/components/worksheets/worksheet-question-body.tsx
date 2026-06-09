'use client';

import type { WorksheetQuestion, WorksheetTheme } from '@/types/worksheet';

/** Shared answer / option chrome used by preview and editor canvas. */
export function WorksheetQuestionBody({
  question,
  theme,
  optionLayout,
}: {
  question: WorksheetQuestion;
  theme: WorksheetTheme;
  optionLayout: WorksheetTheme['optionLayout'];
}) {
  const optMuted = { color: theme.answerTextColor };
  const options = question.options ?? [];
  const horizontal = optionLayout === 'horizontal';

  if (question.question_type === 'multiple_choice' && options.length > 0) {
    if (horizontal) {
      return (
        <div className="mt-2 flex flex-wrap gap-3">
          {options.map((option, optionIndex) => (
            <div
              key={`${question.id}_opt_${optionIndex}`}
              className="flex min-w-[72px] flex-col items-center gap-0.5 text-center"
            >
              <span
                className="text-xs font-semibold"
                style={{ color: theme.primaryColor }}
              >
                {String.fromCharCode(65 + optionIndex)}
              </span>
              <span className="text-sm" style={optMuted}>
                {option || `Option ${String.fromCharCode(65 + optionIndex)}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return (
      <ul className="mt-2 list-none space-y-1 pl-0 text-sm" style={optMuted}>
        {options.map((option, optionIndex) => (
          <li key={`${question.id}_opt_${optionIndex}`}>
            <span
              className="font-medium"
              style={{ color: theme.primaryColor }}
            >
              {String.fromCharCode(65 + optionIndex)})
            </span>{' '}
            {option || `Option ${String.fromCharCode(65 + optionIndex)}`}
          </li>
        ))}
      </ul>
    );
  }

  if (question.question_type === 'true_false') {
    if (horizontal) {
      return (
        <div className="mt-3 flex flex-wrap gap-6">
          {['True', 'False'].map((label) => (
            <div
              key={label}
              className="flex items-center gap-2 text-sm"
              style={optMuted}
            >
              <span
                className="inline-flex h-4 w-4 shrink-0 rounded border bg-linear-to-b from-white to-slate-100"
                style={{ borderColor: theme.answerTextColor }}
                aria-hidden
              />
              {label}
            </div>
          ))}
        </div>
      );
    }
    return (
      <div className="mt-2 flex flex-col gap-1 text-sm" style={optMuted}>
        {['True', 'False'].map((label) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className="inline-flex h-3.5 w-3.5 rounded border"
              style={{ borderColor: theme.answerTextColor }}
            />
            {label}
          </div>
        ))}
      </div>
    );
  }

  if (question.question_type === 'matching' && options.length > 0) {
    return (
      <ul className="mt-2 list-disc pl-5 text-sm" style={optMuted}>
        {options.map((option, optionIndex) => (
          <li key={`${question.id}_m_${optionIndex}`}>
            {option || `Item ${optionIndex + 1}`}
          </li>
        ))}
      </ul>
    );
  }

  if (question.question_type === 'fill_in_blank') {
    return (
      <div
        className="mt-2 h-6 w-52 border-b"
        style={{ borderColor: theme.answerTextColor }}
      />
    );
  }

  if (
    question.question_type === 'short_answer' ||
    question.question_type === 'essay'
  ) {
    return (
      <div
        className={`mt-3 w-full rounded border bg-white ${
          question.question_type === 'essay' ? 'min-h-[80px]' : 'min-h-[36px]'
        }`}
        style={{ borderColor: theme.answerTextColor }}
      />
    );
  }

  return null;
}
