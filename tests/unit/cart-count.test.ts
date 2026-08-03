import { afterEach, describe, expect, it, vi } from "vitest";

import { readCartCountCookie } from "@/src/lib/shop/cart-count";
import { CART_COUNT_COOKIE } from "@/src/lib/shop/constants";

/** The helper reads `document.cookie`; this suite runs on plain Node. */
function withCookies(value: string | undefined): void {
  if (value === undefined) {
    vi.stubGlobal("document", undefined);
    return;
  }
  vi.stubGlobal("document", { cookie: value });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("readCartCountCookie", () => {
  it("reads the count written by the cart routes", () => {
    withCookies(`${CART_COUNT_COOKIE}=7`);
    expect(readCartCountCookie()).toBe(7);
  });

  it("finds the cookie among others, whatever the spacing", () => {
    withCookies(`lang=pl; ${CART_COUNT_COOKIE}=3; rs_cart=abc`);
    expect(readCartCountCookie()).toBe(3);

    withCookies(`lang=pl;${CART_COUNT_COOKIE}=4`);
    expect(readCartCountCookie()).toBe(4);
  });

  it("does not match a cookie that merely ends with the same name", () => {
    withCookies(`other_${CART_COUNT_COOKIE}=99`);
    expect(readCartCountCookie()).toBe(0);
  });

  it("treats a missing cookie as an empty cart", () => {
    withCookies("lang=pl");
    expect(readCartCountCookie()).toBe(0);
    withCookies("");
    expect(readCartCountCookie()).toBe(0);
  });

  it("refuses to trust a malformed or negative value", () => {
    for (const value of ["abc", "-1", "1.5", ""]) {
      withCookies(`${CART_COUNT_COOKIE}=${value}`);
      expect(readCartCountCookie()).toBe(0);
    }
  });

  it("returns 0 during server rendering, where there is no document", () => {
    withCookies(undefined);
    expect(readCartCountCookie()).toBe(0);
  });
});
