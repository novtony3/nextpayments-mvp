import { API_BASE_URL, type ApiRoute } from '@/constants/api';

/**
 * Minimal typed client fetch helper. Calls are same-origin (`/api/...`) and
 * proxied to the backend by the Next rewrite, so no base host is needed here.
 * Use only in Client Components / browser code.
 */

/** Thrown for any non-2xx response so callers can branch on `status`. */
export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

export async function apiFetch<T>(route: ApiRoute, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${route}`, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });

  if (!res.ok) {
    throw new ApiRequestError(res.status, `Request to ${route} failed (${res.status})`);
  }

  return (await res.json()) as T;
}
