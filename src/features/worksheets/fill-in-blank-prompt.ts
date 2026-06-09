/** Underscore runs of 3+ characters mark inline student blanks in the prompt. */
const BLANK_PATTERN = /_{3,}/g;

export type FillInBlankSegment =
  | { type: 'text'; text: string }
  | { type: 'blank'; underscoreCount: number };

export function parseFillInBlankPrompt(prompt: string): FillInBlankSegment[] {
  const segments: FillInBlankSegment[] = [];
  let lastIndex = 0;

  for (const match of prompt.matchAll(BLANK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: 'text', text: prompt.slice(lastIndex, index) });
    }
    segments.push({ type: 'blank', underscoreCount: match[0].length });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < prompt.length) {
    segments.push({ type: 'text', text: prompt.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', text: prompt }];
}

/** Width scales with how many underscores the teacher typed. */
export function fillInBlankWidthEm(underscoreCount: number): number {
  return Math.max(underscoreCount * 0.55, 3);
}

export function renderFillInBlankPromptHtml(
  prompt: string,
  blankColor: string,
  escapeHtml: (value: string) => string,
): string {
  return parseFillInBlankPrompt(prompt)
    .map((segment) => {
      if (segment.type === 'text') {
        return escapeHtml(segment.text);
      }
      const widthEm = fillInBlankWidthEm(segment.underscoreCount);
      return `<span class="fill-blank-inline" style="border-color:${blankColor};min-width:${widthEm}em"></span>`;
    })
    .join('');
}
