import { NextResponse } from 'next/server';

const isDev = process.env.NODE_ENV === 'development';

/**
 * Consistent JSON error body for API routes: `{ error: string }` plus optional `details` in development.
 */
export function apiJsonError(message: string, status: number, details?: unknown): NextResponse {
  const body: Record<string, unknown> = { error: message };
  if (details !== undefined && isDev) {
    body.details = details;
  }
  return NextResponse.json(body, { status });
}

export function logApiError(route: string, error: unknown): void {
  const err = error instanceof Error ? error : new Error(String(error));
  console.error(`[api] ${route}`, err);
}

/**
 * Map unknown errors to a 500 JSON response. Logs server-side; message is generic in production.
 */
export function handleUnknownError(route: string, error: unknown): NextResponse {
  logApiError(route, error);
  const message =
    error instanceof Error && isDev ? error.message : 'Internal server error';
  return apiJsonError(message, 500);
}

/**
 * Wrap a route handler: catches thrown errors and invalid JSON (SyntaxError from `req.json()`).
 */
export async function withApiErrorHandling(
  route: string,
  handler: () => Promise<Response>,
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiJsonError('Invalid JSON body', 400);
    }
    return handleUnknownError(route, error);
  }
}
