'use client';

import {
  fillInBlankWidthEm,
  parseFillInBlankPrompt,
} from '@/features/worksheets/fill-in-blank-prompt';
import type { WorksheetTheme } from '@/types/worksheet';

export function FillInBlankPromptContent({
  prompt,
  theme,
  fallback = 'Untitled question',
}: {
  prompt: string;
  theme: WorksheetTheme;
  fallback?: string;
}) {
  const displayPrompt = prompt.trim() || fallback;
  const segments = parseFillInBlankPrompt(displayPrompt);

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return <span key={`text_${index}`}>{segment.text}</span>;
        }
        return (
          <span
            key={`blank_${index}`}
            className="mx-0.5 inline-block align-baseline border-b"
            style={{
              borderColor: theme.answerTextColor,
              minWidth: `${fillInBlankWidthEm(segment.underscoreCount)}em`,
              height: '1.2em',
            }}
            aria-hidden
          />
        );
      })}
    </>
  );
}
