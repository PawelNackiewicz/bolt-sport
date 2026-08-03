import type {
  ErrorCode,
  ErrorParams,
  FieldErrors,
  PaginationMeta,
} from "@/src/lib/api/errors";

/** `NETWORK` is client-side only — the request never reached a handler. */
export type ClientErrorCode = ErrorCode | "NETWORK";

export type ApiFailure = {
  code: ClientErrorCode;
  /** Polish fallback from the API; prefer translating `code`. */
  message: string;
  fields?: FieldErrors;
  /** Values for the localised message, e.g. `{ available: 3 }`. */
  params?: ErrorParams;
};

export type ApiResult<T> =
  | { ok: true; data: T; meta?: PaginationMeta }
  | { ok: false; error: ApiFailure };

/**
 * Thin wrapper over `fetch` that unwraps the `{ data } / { error }` envelope
 * and never throws — callers branch on `result.ok` instead of try/catch.
 */
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  let response: Response;

  try {
    response = await fetch(path, {
      ...init,
      headers: {
        ...(init?.body ? { "content-type": "application/json" } : {}),
        ...init?.headers,
      },
    });
  } catch {
    return {
      ok: false,
      error: { code: "NETWORK", message: "Brak połączenia z serwerem" },
    };
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: "Nieprawidłowa odpowiedź serwera" },
    };
  }

  if (!response.ok) {
    const error = (body as { error?: ApiFailure }).error;
    return {
      ok: false,
      error: error ?? { code: "INTERNAL_ERROR", message: "Wystąpił nieoczekiwany błąd" },
    };
  }

  const success = body as { data: T; meta?: PaginationMeta };
  return { ok: true, data: success.data, meta: success.meta };
}

export const postJson = <T>(path: string, payload: unknown) =>
  apiFetch<T>(path, { method: "POST", body: JSON.stringify(payload) });

export const patchJson = <T>(path: string, payload: unknown) =>
  apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(payload) });
