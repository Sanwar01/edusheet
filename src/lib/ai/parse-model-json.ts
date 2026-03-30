/**
 * Parse strict JSON from model output; tolerate optional ```json fences.
 */
export function parseModelJsonOutput(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) {
      return JSON.parse(fence[1].trim());
    }
    throw new Error('Model output is not valid JSON');
  }
}
