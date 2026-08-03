import { expect } from "vitest";

import type { ErrorCode, ErrorParams, FieldErrors } from "@/src/lib/api/errors";
import { testCookies } from "./cookie-store";

const ORIGIN = "http://localhost:3000";

export type JsonRequestInit = {
  method?: string;
  body?: unknown;
  /** Rate limiting buckets by client address; tests that care set their own. */
  ip?: string;
};

/** Builds the `Request` a route handler receives. */
export function apiRequest(path: string, init: JsonRequestInit = {}): Request {
  const { method = "GET", body, ip = "198.51.100.1" } = init;

  return new Request(`${ORIGIN}${path}`, {
    method,
    headers: {
      "x-forwarded-for": ip,
      ...(body === undefined ? {} : { "content-type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

/** Route context for a dynamic segment, which Next passes as a promise. */
export function routeContext<T extends Record<string, string>>(params: T) {
  return { params: Promise.resolve(params) };
}

export type ApiEnvelope<T> = {
  status: number;
  data?: T;
  meta?: { page: number; perPage: number; total: number; totalPages: number };
  error?: {
    code: ErrorCode;
    message: string;
    fields?: FieldErrors;
    params?: ErrorParams;
  };
};

/** Unwraps the `{ data } / { error }` envelope into something assertable. */
export async function readJson<T>(response: Response): Promise<ApiEnvelope<T>> {
  const body = (await response.json()) as Record<string, unknown>;

  return {
    status: response.status,
    data: body.data as T | undefined,
    meta: body.meta as ApiEnvelope<T>["meta"],
    error: body.error as ApiEnvelope<T>["error"],
  };
}

/** Asserts a successful envelope and narrows `data` for the caller. */
export async function expectOk<T>(response: Response, status = 200): Promise<T> {
  const envelope = await readJson<T>(response);

  expect(envelope.error, `unexpected error: ${JSON.stringify(envelope.error)}`).toBeUndefined();
  expect(envelope.status).toBe(status);

  return envelope.data as T;
}

/** Asserts a failure envelope and hands back the error for further assertions. */
export async function expectError(
  response: Response,
  code: ErrorCode,
): Promise<NonNullable<ApiEnvelope<unknown>["error"]>> {
  const envelope = await readJson(response);

  expect(envelope.error?.code, `body: ${JSON.stringify(envelope)}`).toBe(code);
  return envelope.error!;
}

/** The badge cookie as a number, or `undefined` when it was never written. */
export function cartCountCookie(): number | undefined {
  const value = testCookies.get("rs_cart_count")?.value;
  return value === undefined ? undefined : Number(value);
}

export const DEMO_CREDENTIALS = {
  email: "test@bolt-sport.pl",
  password: "Test1234!",
};

export const CHECKOUT_PAYLOAD = {
  customer: {
    email: "kupujacy@example.com",
    firstName: "Anna",
    lastName: "Nowak",
    phone: "600 100 200",
  },
  shippingAddress: {
    street: "Sportowa 12/3",
    postalCode: "45-064",
    city: "Opole",
    country: "Polska",
  },
  paymentMethod: "card" as const,
};
