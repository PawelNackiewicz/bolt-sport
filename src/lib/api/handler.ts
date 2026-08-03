import { ZodError, type ZodType } from "zod";

import { ApiError } from "./errors";
import { fail, fieldErrorsFromZod } from "./response";

/**
 * Wraps a route handler so every thrown `ApiError` or `ZodError` becomes the
 * standard `{ error }` envelope, and anything else becomes a logged 500. Route
 * handlers can then read as straight-line code.
 */
export async function handleRoute(run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (reason) {
    if (reason instanceof ApiError) {
      return fail(reason.code, {
        message: reason.message,
        fields: reason.fields,
        params: reason.params,
      });
    }

    if (reason instanceof ZodError) {
      return fail("VALIDATION_ERROR", { fields: fieldErrorsFromZod(reason) });
    }

    console.error("[api] Unhandled route error:", reason);
    return fail("INTERNAL_ERROR");
  }
}

/**
 * Parses and validates a JSON body. A malformed body is reported as a
 * validation error rather than a 500.
 */
export async function parseJsonBody<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    throw new ApiError("VALIDATION_ERROR", {
      message: "Treść żądania nie jest poprawnym JSON-em",
    });
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ApiError("VALIDATION_ERROR", { fields: fieldErrorsFromZod(result.error) });
  }

  return result.data;
}

/**
 * Validates `searchParams`. Filters are forgiving by design: schemas here use
 * defaults so a junk value falls back instead of failing the request.
 */
export function parseSearchParams<T>(url: URL, schema: ZodType<T>): T {
  const raw: Record<string, string | string[]> = {};

  for (const key of new Set(url.searchParams.keys())) {
    const values = url.searchParams.getAll(key);
    raw[key] = values.length > 1 ? values : values[0];
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new ApiError("VALIDATION_ERROR", { fields: fieldErrorsFromZod(result.error) });
  }

  return result.data;
}
