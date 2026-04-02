import type { WorksheetQuestion, WorksheetTheme } from '@/types/worksheet';
import { promptFontWeightClassMap } from '@/features/worksheets/editor/theme/class-maps';

export function WorksheetQuestionPreview({
  question,
  index,
  theme,
  optionLayout,
  showAnswerKey,
}: {
  question: WorksheetQuestion;
  index: number;
  theme: WorksheetTheme;
  optionLayout: WorksheetTheme['optionLayout'];
  showAnswerKey: boolean;
}) {
  const promptWeight = promptFontWeightClassMap[theme.promptFontWeight];
  const optMuted = { color: theme.answerTextColor };

  const options = question.options ?? [];
  const horizontal = optionLayout === 'horizontal';

  const mcBlock =
    question.question_type === 'multiple_choice' && options.length > 0 ? (
      horizontal ? (
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
                {option}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <ul className="mt-2 list-none space-y-1 pl-0 text-sm" style={optMuted}>
          {options.map((option, optionIndex) => (
            <li key={`${question.id}_opt_${optionIndex}`}>
              <span
                className="font-medium"
                style={{ color: theme.primaryColor }}
              >
                {String.fromCharCode(65 + optionIndex)}.
              </span>{' '}
              {option}
            </li>
          ))}
        </ul>
      )
    ) : null;

  const tfBlock =
    question.question_type === 'true_false' ? (
      horizontal ? (
        <div className="mt-3 flex flex-wrap gap-6">
          {['True', 'False'].map((label) => (
            <label
              key={label}
              className="flex cursor-default items-center gap-2 text-sm"
              style={optMuted}
            >
              <span
                className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border bg-linear-to-b from-white to-slate-100"
                style={{ borderColor: theme.answerTextColor }}
                aria-hidden
              />
              {label}
            </label>
          ))}
        </div>
      ) : (
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
      )
    ) : null;

  const matchingBlock =
    question.question_type === 'matching' && options.length > 0 ? (
      <ul className="mt-2 list-disc pl-5 text-sm" style={optMuted}>
        {options.map((option, optionIndex) => (
          <li key={`${question.id}_m_${optionIndex}`}>{option}</li>
        ))}
      </ul>
    ) : null;

  const fillBlock =
    question.question_type === 'fill_in_blank' ? (
      <div
        className="mt-2 h-6 w-52 border-b"
        style={{ borderColor: theme.answerTextColor }}
      />
    ) : null;

  const textBlock =
    question.question_type === 'short_answer' ||
    question.question_type === 'essay' ? (
      <div
        className={`mt-3 w-full rounded border bg-white ${
          question.question_type === 'essay' ? 'min-h-[80px]' : 'min-h-[36px]'
        }`}
        style={{ borderColor: theme.answerTextColor }}
      />
    ) : null;

  return (
    <div className="min-h-0 wrap-break-word">
      <p className={`${promptWeight}`} style={{ color: theme.textColor }}>
        <span style={{ color: theme.primaryColor }}>{index}.</span>{' '}
        {question.prompt || 'Untitled question'}
      </p>
      {mcBlock}
      {tfBlock}
      {matchingBlock}
      {fillBlock}
      {textBlock}
      {showAnswerKey && question.answer ? (
        <p
          className="mt-2 rounded bg-secondary px-2 py-1 text-xs"
          style={{ color: theme.textColor }}
        >
          Answer: <span className="font-medium">{question.answer}</span>
        </p>
      ) : null}
    </div>
  );
}
