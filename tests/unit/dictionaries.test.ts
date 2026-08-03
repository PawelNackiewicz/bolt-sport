import { describe, expect, it } from "vitest";

import { ERROR_CODES } from "@/src/lib/api/errors";
import de from "@/src/i18n/dictionaries/de.json";
import en from "@/src/i18n/dictionaries/en.json";
import pl from "@/src/i18n/dictionaries/pl.json";

type Json = Record<string, unknown>;

/** Flattens to dotted paths so a missing key names itself in the failure. */
function paths(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value as Json).flatMap(([key, child]) =>
    paths(child, prefix ? `${prefix}.${key}` : key),
  );
}

describe("dictionary parity", () => {
  // `Dictionary` is typed off pl.json, so TypeScript cannot catch a key that
  // exists in Polish but was forgotten in the other two files.
  const plPaths = paths(pl);

  it.each([
    ["de", de],
    ["en", en],
  ])("%s has every key pl.json has", (_name, dictionary) => {
    const missing = plPaths.filter((path) => !paths(dictionary).includes(path));
    expect(missing).toEqual([]);
  });

  it.each([
    ["de", de],
    ["en", en],
  ])("%s has no keys pl.json is missing", (_name, dictionary) => {
    const extra = paths(dictionary).filter((path) => !plPaths.includes(path));
    expect(extra).toEqual([]);
  });

  it.each([
    ["pl", pl],
    ["de", de],
    ["en", en],
  ])("%s translates every error code the API can emit", (_name, dictionary) => {
    const messages = dictionary.shop.errors as Record<string, string>;
    const missing = ERROR_CODES.filter((code) => !(code in messages));

    expect(missing).toEqual([]);
    // Client-only code, never produced by a route handler.
    expect(messages.NETWORK).toBeTruthy();
  });

  it.each([
    ["pl", pl],
    ["de", de],
    ["en", en],
  ])("%s keeps the placeholders the parameterised messages rely on", (_name, dictionary) => {
    const messages = dictionary.shop.errors as Record<string, string>;

    expect(messages.INSUFFICIENT_STOCK_AVAILABLE).toContain("{available}");
    expect(messages.RATE_LIMITED_RETRY).toContain("{retryAfter}");
  });
});
