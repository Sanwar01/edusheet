import type { WorksheetQuestion, WorksheetTheme } from '@/types/worksheet';
import { WorksheetQuestionBody } from '@/components/worksheets/worksheet-question-body';
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

  return (
    <div className="min-h-0 wrap-break-word">
      <p className={`${promptWeight}`} style={{ color: theme.textColor }}>
        <span style={{ color: theme.primaryColor }}>{index}.</span>{' '}
        {question.prompt || 'Untitled question'}
      </p>
      <WorksheetQuestionBody
        question={question}
        theme={theme}
        optionLayout={optionLayout}
      />
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
