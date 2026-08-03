import type { z } from "zod";

import { toPolishMessage } from "@/src/lib/validation/messages";

import {
  ApiError,
  ERROR_MESSAGES_PL,
  ERROR_STATUS,
  type ApiSuccessBody,
  type ErrorCode,
  type ErrorParams,
  type FieldErrors,
  type PaginationMeta,
} from "./errors";

/** `{ data, meta? }` — the only success envelope the API emits. */
export function ok<T>(data: T, meta?: PaginationMeta, init?: ResponseInit): Response {
  const body: ApiSuccessBody<T> = meta ? { data, meta } : { data };
  return Response.json(body, { status: 200, ...init });
}

export function created<T>(data: T, init?: ResponseInit): Response {
  return ok(data, undefined, { status: 201, ...init });
}

export type FailOptions = {
  message?: string;
  fields?: FieldErrors;
  params?: ErrorParams;
  init?: ResponseInit;
};

/** `{ error: { code, message, fields?, params? } }` — the only error envelope. */
export function fail(code: ErrorCode, options: FailOptions = {}): Response {
  const { message, fields, params, init } = options;

  return Response.json(
    {
      error: {
        code,
        message: message ?? ERROR_MESSAGES_PL[code],
        ...(fields ? { fields } : {}),
        ...(params ? { params } : {}),
      },
    },
    { status: ERROR_STATUS[code], ...init },
  );
}

/**
 * Flattens zod issues into `{ field: message }`, resolving the schema's message
 * keys to Polish. Only the first issue per field is kept — forms show one
 * message at a time anyway.
 */
export function fieldErrorsFromZod(error: z.ZodError): FieldErrors {
  const fields: FieldErrors = {};

  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_";
    if (fields[path] === undefined) {
      fields[path] = toPolishMessage(issue.message);
    }
  }

  return fields;
}

export function validationError(error: z.ZodError): ApiError {
  return new ApiError("VALIDATION_ERROR", { fields: fieldErrorsFromZod(error) });
}
