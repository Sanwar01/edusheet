'use client';

import { WorksheetQuestionBody } from '@/components/worksheets/worksheet-question-body';
import { promptFontWeightClassMap } from '@/features/worksheets/editor/theme/class-maps';
import { cn } from '@/lib/utils';
import type { WorksheetQuestion, WorksheetTheme } from '@/types/worksheet';

const inlinePromptClass =
  'min-w-0 flex-1 border-0 bg-transparent p-0 shadow-none outline-none ring-0 focus-visible:ring-0 placeholder:text-slate-400/60';

export function WorksheetQuestionEditorView({
  question,
  index,
  theme,
  optionLayout,
  onPromptChange,
}: {
  question: WorksheetQuestion;
  index: number;
  theme: WorksheetTheme;
  optionLayout: WorksheetTheme['optionLayout'];
  onPromptChange: (prompt: string) => void;
}) {
  const promptWeight = promptFontWeightClassMap[theme.promptFontWeight];

  return (
    <div className="min-h-0 wrap-break-word py-0.5">
      <div
        className={cn('flex items-start gap-1', promptWeight)}
        style={{ color: theme.textColor }}
      >
        <span className="shrink-0 pt-0.5" style={{ color: theme.primaryColor }}>
          {index}.
        </span>
        <textarea
          value={question.prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={
            question.question_type === 'fill_in_blank'
              ? 'There are ___________________ months.'
              : 'New question'
          }
          rows={Math.max(1, Math.min(4, question.prompt.split('\n').length))}
          className={cn(inlinePromptClass, 'resize-none leading-snug')}
          style={{
            color: theme.textColor,
            fontSize: theme.bodyFontSize,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
      <WorksheetQuestionBody
        question={question}
        theme={theme}
        optionLayout={optionLayout}
      />
    </div>
  );
}
