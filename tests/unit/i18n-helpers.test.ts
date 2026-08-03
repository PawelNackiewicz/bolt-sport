import { describe, expect, it } from "vitest";

import type { Dictionary } from "@/src/i18n/config";
import de from "@/src/i18n/dictionaries/de.json";
import en from "@/src/i18n/dictionaries/en.json";
import pl from "@/src/i18n/dictionaries/pl.json";
import type { ApiFailure } from "@/src/lib/shop/api-client";
import {
  format,
  translateCategory,
  translateError,
  translateTag,
  translateValidation,
} from "@/src/lib/shop/i18n-helpers";

const dictionaries = { pl, de, en } as unknown as Record<string, Dictionary>;
const plDictionary = pl as Dictionary;

const failure = (overrides: Partial<ApiFailure>): ApiFailure => ({
  code: "INTERNAL_ERROR",
  message: "",
  ...overrides,
});

describe("format", () => {
  it("substitutes placeholders", () => {
    expect(format("Dostępne: {count} szt.", { count: 3 })).toBe("Dostępne: 3 szt.");
    expect(format("{a} i {b}", { a: "x", b: "y" })).toBe("x i y");
  });

  it("leaves unknown placeholders untouched rather than printing undefined", () => {
    expect(format("Brakuje {missing}", { other: 1 })).toBe("Brakuje {missing}");
  });

  it("substitutes a repeated placeholder everywhere", () => {
    expect(format("{n} z {n}", { n: 2 })).toBe("2 z 2");
  });
});

describe("translateError", () => {
  it("maps a known code onto the active language", () => {
    expect(translateError(plDictionary, failure({ code: "CART_EMPTY" }))).toBe(
      pl.shop.errors.CART_EMPTY,
    );
    expect(translateError(dictionaries.de, failure({ code: "CART_EMPTY" }))).toBe(
      de.shop.errors.CART_EMPTY,
    );
  });

  it("prefers the parameterised message when the API sends params", () => {
    const stock = failure({ code: "INSUFFICIENT_STOCK", params: { available: 3 } });

    expect(translateError(plDictionary, stock)).toBe("Dostępna ilość to 3 szt.");
    expect(translateError(dictionaries.en, stock)).toBe("Only 3 in stock");
    expect(translateError(dictionaries.de, stock)).toBe("Verfügbar sind 3 Stück");
  });

  it("renders the retry countdown for a rate limited request", () => {
    const limited = failure({ code: "RATE_LIMITED", params: { retryAfter: 45 } });

    expect(translateError(plDictionary, limited)).toContain("45");
    expect(translateError(dictionaries.en, limited)).toContain("45");
  });

  it("falls back to the plain variant when the same code carries no params", () => {
    expect(translateError(plDictionary, failure({ code: "INSUFFICIENT_STOCK" }))).toBe(
      pl.shop.errors.INSUFFICIENT_STOCK,
    );
  });

  it("ignores params for codes that have no parameterised variant", () => {
    const notFound = failure({ code: "NOT_FOUND", params: { available: 3 } });
    expect(translateError(plDictionary, notFound)).toBe(pl.shop.errors.NOT_FOUND);
  });

  it("keeps the API sentence when the code is unknown to the dictionary", () => {
    const unknown = {
      code: "SOMETHING_NEW",
      message: "Serwer zwrócił nowy kod",
    } as unknown as ApiFailure;

    expect(translateError(plDictionary, unknown)).toBe("Serwer zwrócił nowy kod");
  });

  it("falls back to the generic message when there is nothing else", () => {
    const unknown = { code: "SOMETHING_NEW", message: "" } as unknown as ApiFailure;
    expect(translateError(plDictionary, unknown)).toBe(pl.shop.errors.INTERNAL_ERROR);
  });

  it("covers the client-only NETWORK code", () => {
    expect(translateError(plDictionary, failure({ code: "NETWORK" }))).toBe(
      pl.shop.errors.NETWORK,
    );
  });
});

describe("translateValidation", () => {
  it("resolves schema message keys", () => {
    expect(translateValidation(plDictionary, "required")).toBe(pl.shop.validation.required);
    expect(translateValidation(dictionaries.en, "email")).toBe(en.shop.validation.email);
  });

  it("passes through anything that is not a known key", () => {
    expect(translateValidation(plDictionary, "Konto z tym adresem już istnieje")).toBe(
      "Konto z tym adresem już istnieje",
    );
  });

  it("returns undefined for a valid field", () => {
    expect(translateValidation(plDictionary, undefined)).toBeUndefined();
  });
});

describe("translateCategory / translateTag", () => {
  it("uses the dictionary label when the slug is known", () => {
    const slug = Object.keys(pl.shop.categories)[0];
    expect(translateCategory(plDictionary, slug, "seed name")).toBe(
      pl.shop.categories[slug as keyof typeof pl.shop.categories],
    );
  });

  it("falls back to the seed name for an unknown category", () => {
    expect(translateCategory(plDictionary, "nieistniejaca", "Seed name")).toBe("Seed name");
  });

  it("renders an unknown tag as its raw slug instead of dropping it", () => {
    expect(translateTag(plDictionary, "brand-new-tag")).toBe("brand-new-tag");
  });
});
