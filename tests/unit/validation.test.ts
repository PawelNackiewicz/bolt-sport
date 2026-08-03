import { describe, expect, it } from "vitest";

import { DEFAULT_PER_PAGE, MAX_PER_PAGE } from "@/src/lib/shop/constants";
import { V } from "@/src/lib/validation/messages";
import {
  addressSchema,
  emailSchema,
  passwordSchema,
  phoneSchema,
  postalCodeSchema,
  productQuerySchema,
  registerSchema,
} from "@/src/lib/validation/shop";

/** First issue message, which is what the API surfaces per field. */
const messageOf = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.success ? undefined : result.error!.issues[0].message;

describe("emailSchema", () => {
  it("normalises case and surrounding whitespace", () => {
    expect(emailSchema.parse("  Jan.Kowalski@Example.COM ")).toBe(
      "jan.kowalski@example.com",
    );
  });

  it("rejects malformed addresses", () => {
    for (const value of ["", "jan", "jan@", "@example.com", "jan @example.com"]) {
      expect(emailSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe("passwordSchema", () => {
  it("accepts 8+ characters with a letter and a digit", () => {
    expect(passwordSchema.safeParse("Test1234").success).toBe(true);
    expect(passwordSchema.safeParse("haslo123").success).toBe(true);
  });

  it("reports one message for every kind of weak password", () => {
    // A single refinement on purpose: the user should not be walked through the
    // rules one failure at a time.
    for (const value of ["short1", "bezcyfr", "12345678", "        "]) {
      expect(messageOf(passwordSchema.safeParse(value))).toBe(V.password);
    }
  });

  it("does not trim — spaces are legitimate password characters", () => {
    expect(passwordSchema.safeParse(" abc12345 ").success).toBe(true);
  });
});

describe("phoneSchema", () => {
  it("is permissive about formatting, strict about digit count", () => {
    expect(phoneSchema.safeParse("600 100 200").success).toBe(true);
    expect(phoneSchema.safeParse("+48 600-100-200").success).toBe(true);
    expect(phoneSchema.safeParse("(600) 100 200").success).toBe(true);
  });

  it("rejects too few digits", () => {
    expect(messageOf(phoneSchema.safeParse("600 100"))).toBe(V.phone);
    expect(phoneSchema.safeParse("").success).toBe(false);
  });
});

describe("postalCodeSchema", () => {
  it("requires the Polish NN-NNN shape", () => {
    expect(postalCodeSchema.safeParse("45-064").success).toBe(true);
    for (const value of ["45064", "4-064", "45-64", "ab-cde", ""]) {
      expect(postalCodeSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe("addressSchema", () => {
  it("defaults the country so guest checkout does not have to send it", () => {
    const parsed = addressSchema.parse({
      street: "Sportowa 12/3",
      postalCode: "45-064",
      city: "Opole",
    });

    expect(parsed.country).toBe("Polska");
  });

  it("requires the remaining fields", () => {
    const result = addressSchema.safeParse({ street: "", postalCode: "45-064", city: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("treats the phone as optional", () => {
    const result = registerSchema.safeParse({
      email: "nowy@example.com",
      password: "Test1234",
      firstName: "Jan",
      lastName: "Kowalski",
    });

    expect(result.success).toBe(true);
  });

  it("still validates a phone that was supplied", () => {
    const result = registerSchema.safeParse({
      email: "nowy@example.com",
      password: "Test1234",
      firstName: "Jan",
      lastName: "Kowalski",
      phone: "123",
    });

    expect(result.success).toBe(false);
  });
});

describe("productQuerySchema", () => {
  it("supplies defaults for an empty query", () => {
    const query = productQuerySchema.parse({});

    expect(query.page).toBe(1);
    expect(query.perPage).toBe(DEFAULT_PER_PAGE);
    expect(query.sort).toBe("newest");
  });

  it("accepts perPage up to the maximum", () => {
    expect(productQuerySchema.parse({ perPage: String(MAX_PER_PAGE) }).perPage).toBe(
      MAX_PER_PAGE,
    );
  });

  it("rejects out-of-range values rather than clamping them", () => {
    // Worth knowing: the schema's own doc comment promises junk "degrades to
    // the default listing". That holds on /sklep, which wraps this in
    // `safeParse` and falls back — but /api/products answers 400.
    expect(productQuerySchema.safeParse({ perPage: "1000" }).success).toBe(false);
    expect(productQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(productQuerySchema.safeParse({ minPrice: "-5" }).success).toBe(false);
  });

  it("degrades to defaults when the caller falls back on invalid input", () => {
    // The pattern /sklep uses for a user-editable URL.
    const parsed = productQuerySchema.safeParse({ sort: "cheapest", perPage: "1000" });
    const query = parsed.success ? parsed.data : productQuerySchema.parse({});

    expect(query.sort).toBe("newest");
    expect(query.perPage).toBe(DEFAULT_PER_PAGE);
  });

  it("coerces the numeric filters that arrive as strings from the URL", () => {
    const query = productQuerySchema.parse({
      page: "3",
      minPrice: "1000",
      maxPrice: "50000",
      inStock: "true",
    });

    expect(query.page).toBe(3);
    expect(query.minPrice).toBe(1000);
    expect(query.maxPrice).toBe(50000);
    expect(query.inStock).toBe(true);
  });

  it("rejects a sort value it does not know", () => {
    expect(productQuerySchema.safeParse({ sort: "cheapest" }).success).toBe(false);
  });
});
