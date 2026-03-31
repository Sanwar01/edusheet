export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

export async function getApiErrorMessage(
  res: Response,
  fallback: string,
): Promise<string> {
  try {
    const data = (await res.json()) as { error?: string; message?: string };
    if (data?.error) return data.error;
    if (data?.message) return data.message;
  } catch {
    // Ignore parse errors and fallback below.
  }

  if (res.status === 400) return 'Invalid request. Please check your input.';
  if (res.status === 401) return 'Your session expired. Please sign in again.';
  if (res.status === 402) return 'Your plan limit has been reached.';
  if (res.status === 403) return 'You do not have permission for this action.';
  if (res.status === 404) return 'Requested resource was not found.';
  if (res.status === 409) return 'Conflict detected. Please refresh and try again.';
  if (res.status === 429) return 'Too many requests. Please try again shortly.';
  if (res.status >= 500) return 'Server error. Please try again shortly.';

  return fallback;
}

export async function assertApiOk(
  res: Response,
  fallback = 'Request failed.',
): Promise<void> {
  if (res.ok) return;
  throw new ApiClientError(await getApiErrorMessage(res, fallback), res.status);
}

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  fallback = 'Request failed.',
): Promise<T> {
  const res = await fetch(input, init);
  await assertApiOk(res, fallback);
  return (await res.json()) as T;
}
