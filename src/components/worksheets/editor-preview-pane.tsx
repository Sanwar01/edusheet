import type { WorksheetContent, WorksheetTheme } from '@/types/worksheet';

export function EditorPreviewPane({
  content,
  theme,
  contentFontClass,
  sectionSpacingClass,
  questionSpacingClass,
  pointsBySection,
  pointsTotal,
  showAnswerKey,
}: {
  content: WorksheetContent;
  theme: WorksheetTheme;
  contentFontClass: string;
  sectionSpacingClass: string;
  questionSpacingClass: string;
  pointsBySection: Record<string, number>;
  pointsTotal: number;
  showAnswerKey: boolean;
}) {
  return (
    <div
      className={`w-full rounded-lg border border-slate-200 bg-white px-6 py-8 shadow-sm md:px-10 ${contentFontClass}`}
      style={{ color: theme.textColor, fontSize: theme.bodyFontSize }}
    >
      <h1
        className="mb-2 font-bold"
        style={{
          fontSize: theme.headingFontSize,
          color: theme.primaryColor,
        }}
      >
        {content.title || 'Untitled worksheet'}
      </h1>
      {content.instructions ? (
        <p className="mb-6 italic text-slate-700">{content.instructions}</p>
      ) : null}
      <div className="mb-4 flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <span>Preview is read-only and mirrors export layout.</span>
        <span className="font-medium">Total points: {pointsTotal}</span>
      </div>
      <div className={sectionSpacingClass}>
        {content.sections.map((section, sectionIndex) => (
          <section key={section.id} className={questionSpacingClass}>
            <h2 className="font-semibold">
              Section {sectionIndex + 1}: {section.heading || 'Untitled section'} (
              {pointsBySection[section.id] ?? 0} pts)
            </h2>
            <ol className={`list-decimal pl-5 ${questionSpacingClass}`}>
              {section.questions.map((question) => (
                <li key={question.id} className="space-y-1">
                  <p>{question.prompt || 'Untitled question'}</p>
                  {question.question_type === 'multiple_choice' &&
                    (question.options ?? []).length > 0 && (
                      <ul className="list-disc pl-5 text-sm text-slate-700">
                        {(question.options ?? []).map((option, idx) => (
                          <li key={`${question.id}_${idx}`}>{option}</li>
                        ))}
                      </ul>
                    )}
                  {(question.question_type === 'short_answer' ||
                    question.question_type === 'essay') && (
                    <div
                      className={`rounded border border-slate-200 ${question.question_type === 'essay' ? 'h-20' : 'h-8'}`}
                    />
                  )}
                  {question.question_type === 'fill_in_blank' && (
                    <div className="h-6 w-52 border-b border-slate-400" />
                  )}
                  {showAnswerKey && question.answer ? (
                    <p className="text-xs text-slate-600">
                      Answer: <span className="font-medium">{question.answer}</span>
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
