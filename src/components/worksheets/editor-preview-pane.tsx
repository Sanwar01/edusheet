import { WorksheetQuestionPreview } from '@/components/worksheets/worksheet-question-preview';
import { defaultSectionLayout } from '@/features/worksheets/layout';
import { sectionQuestionGridColsClass } from '@/features/worksheets/section-grid-responsive';
import { cn } from '@/lib/utils';
import type {
  WorksheetContent,
  WorksheetLayout,
  WorksheetTheme,
} from '@/types/worksheet';

export function EditorPreviewPane({
  content,
  theme,
  layout,
  contentFontClass,
  sectionSpacingClass,
  questionSpacingClass,
  pointsBySection,
  pointsTotal,
  showAnswerKey,
}: {
  content: WorksheetContent;
  theme: WorksheetTheme;
  layout: WorksheetLayout;
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
      {theme.headerStyle === 'lesson' ? (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <h1
            className="min-w-0 flex-1 font-bold"
            style={{
              fontSize: theme.headingFontSize,
              color: theme.primaryColor,
            }}
          >
            {content.title || 'Untitled worksheet'}
          </h1>
          {theme.showNameLine ? (
            <div
              className="shrink-0 text-sm"
              style={{ color: theme.answerTextColor }}
            >
              Name:{' '}
              <span
                className="inline-block min-w-48 border-b pb-0.5"
                style={{ borderColor: theme.answerTextColor }}
              />
            </div>
          ) : null}
        </div>
      ) : (
        <h1
          className="mb-2 font-bold"
          style={{
            fontSize: theme.headingFontSize,
            color: theme.primaryColor,
          }}
        >
          {content.title || 'Untitled worksheet'}
        </h1>
      )}
      {content.instructions ? (
        <p className="mb-6 italic" style={{ color: theme.answerTextColor }}>
          {content.instructions}
        </p>
      ) : null}
      <div className="mb-4 flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <span>Preview is read-only and mirrors export layout.</span>
        <span className="font-medium">Total points: {pointsTotal}</span>
      </div>
      <div className={sectionSpacingClass}>
        {content.sections.map((section, sectionIndex) => {
          const sectionLayout =
            layout.sectionLayouts[section.id] ?? defaultSectionLayout();
          const isGrid = sectionLayout.mode === 'grid';
          const gridColsClass = sectionQuestionGridColsClass(
            sectionLayout.gridColumns,
          );
          let globalQ = 0;
          for (let i = 0; i < sectionIndex; i += 1) {
            globalQ += content.sections[i].questions.length;
          }

          return (
            <section key={section.id} className={questionSpacingClass}>
              <h2 className="font-semibold" style={{ color: theme.textColor }}>
                Section {sectionIndex + 1}:{' '}
                {section.heading || 'Untitled section'}{' '}
                <span style={{ color: theme.answerTextColor }}>
                  ({pointsBySection[section.id] ?? 0} pts)
                </span>
              </h2>
              <div
                className={cn(
                  isGrid &&
                    sectionLayout.border === 'outer' &&
                    'rounded-lg border-2 border-slate-300 p-3',
                )}
              >
                <div
                  className={cn(
                    isGrid
                      ? `grid auto-rows-min gap-3 ${gridColsClass}`
                      : 'space-y-4',
                  )}
                >
                  {section.questions.map((question, qIndex) => {
                    const qNum = globalQ + qIndex + 1;
                    return (
                      <div
                        key={question.id}
                        className={cn(
                          isGrid && 'min-w-0',
                          isGrid &&
                            sectionLayout.border === 'cells' &&
                            'rounded-md border border-slate-200 bg-white p-3',
                        )}
                      >
                        <WorksheetQuestionPreview
                          question={question}
                          index={qNum}
                          theme={theme}
                          optionLayout={theme.optionLayout}
                          showAnswerKey={showAnswerKey}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
