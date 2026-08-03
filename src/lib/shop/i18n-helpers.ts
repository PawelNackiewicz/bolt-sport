import type { Dictionary } from "@/src/i18n/config";
import { isValidationMessageKey } from "@/src/lib/validation/messages";

import type { ApiFailure, ClientErrorCode } from "./api-client";

/** Fills `{placeholder}` slots in a dictionary string. */
export function format(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * Codes whose message gets sharper when the API sends parameters — "3 pieces
 * left" instead of "not enough stock". Falls back to the plain variant when the
 * failure carries no params.
 */
const PARAMETERISED_MESSAGES = {
  INSUFFICIENT_STOCK: "INSUFFICIENT_STOCK_AVAILABLE",
  RATE_LIMITED: "RATE_LIMITED_RETRY",
} as const satisfies Partial<
  Record<ClientErrorCode, keyof Dictionary["shop"]["errors"]>
>;

/** Maps an API failure onto a sentence in the active language. */
export function translateError(dictionary: Dictionary, failure: ApiFailure): string {
  const messages = dictionary.shop.errors;
  const { code, params } = failure;

  if (params && code in PARAMETERISED_MESSAGES) {
    const key = PARAMETERISED_MESSAGES[code as keyof typeof PARAMETERISED_MESSAGES];
    return format(messages[key], params);
  }

  if (code in messages) return messages[code as keyof typeof messages];

  // Unknown code — the API's own (Polish) sentence still beats a generic one.
  return failure.message || messages.INTERNAL_ERROR;
}

/**
 * Validation schemas emit message *keys* rather than sentences, so a
 * react-hook-form error is translated the same way on every locale. Anything
 * that is not a known key is passed through — that covers the per-field
 * messages the API sends back (already localised to Polish).
 */
export function translateValidation(
  dictionary: Dictionary,
  message: string | undefined,
): string | undefined {
  if (!message) return undefined;

  return isValidationMessageKey(message)
    ? dictionary.shop.validation[message]
    : message;
}

/** Category labels live in the dictionary; the seed name is the fallback. */
export function translateCategory(
  dictionary: Dictionary,
  slug: string,
  fallback: string,
): string {
  const categories = dictionary.shop.categories;
  return slug in categories ? categories[slug as keyof typeof categories] : fallback;
}

/** Unknown tags render as their raw slug rather than disappearing. */
export function translateTag(dictionary: Dictionary, tag: string): string {
  const tags = dictionary.shop.tags;
  return tag in tags ? tags[tag as keyof typeof tags] : tag;
}
