import { describe, expect, it } from "vitest";

import { formatPrice, parsePriceToGrosze } from "@/src/lib/shop/money";

/** Intl inserts non-breaking spaces; comparing on digits keeps this readable. */
const digits = (value: string) => value.replace(/[^\d,.]/g, "");

describe("formatPrice", () => {
  it("renders grosze as złote with two decimals", () => {
    expect(digits(formatPrice(34900, "pl"))).toBe("349,00");
    expect(digits(formatPrice(0, "pl"))).toBe("0,00");
    expect(digits(formatPrice(1, "pl"))).toBe("0,01");
    expect(digits(formatPrice(199999, "pl"))).toBe("1999,99");
  });

  it("always bills in PLN regardless of locale", () => {
    for (const locale of ["pl", "de", "en"] as const) {
      expect(formatPrice(34900, locale)).toMatch(/PLN|zł/);
    }
  });

  it("uses locale-appropriate separators", () => {
    expect(digits(formatPrice(34900, "en"))).toBe("349.00");
    expect(digits(formatPrice(34900, "de"))).toBe("349,00");
  });

  it("defaults to Polish formatting", () => {
    expect(formatPrice(34900)).toBe(formatPrice(34900, "pl"));
  });
});

describe("parsePriceToGrosze", () => {
  it("accepts both decimal separators", () => {
    expect(parsePriceToGrosze("349")).toBe(34900);
    expect(parsePriceToGrosze("349,50")).toBe(34950);
    expect(parsePriceToGrosze("349.50")).toBe(34950);
    expect(parsePriceToGrosze("  349,50  ")).toBe(34950);
  });

  it("rounds to whole grosze rather than carrying float noise", () => {
    expect(parsePriceToGrosze("0,015")).toBe(2);
    expect(parsePriceToGrosze("19,99")).toBe(1999);
    expect(parsePriceToGrosze("0")).toBe(0);
  });

  it("rejects anything that is not a non-negative number", () => {
    expect(parsePriceToGrosze("")).toBeUndefined();
    expect(parsePriceToGrosze("   ")).toBeUndefined();
    expect(parsePriceToGrosze("abc")).toBeUndefined();
    expect(parsePriceToGrosze("-10")).toBeUndefined();
    expect(parsePriceToGrosze("1,2,3")).toBeUndefined();
  });
});
