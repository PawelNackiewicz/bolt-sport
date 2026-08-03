import { describe, expect, it } from "vitest";

import { loginPath, sanitizeRedirect } from "@/src/lib/shop/redirects";

describe("sanitizeRedirect", () => {
  it("keeps same-origin paths", () => {
    expect(sanitizeRedirect("/konto")).toBe("/konto");
    expect(sanitizeRedirect("/pl/konto/zamowienia/o-1")).toBe("/pl/konto/zamowienia/o-1");
    expect(sanitizeRedirect("/pl/sklep?category=rekawice&page=2")).toBe(
      "/pl/sklep?category=rekawice&page=2",
    );
    expect(sanitizeRedirect("/pl/sklep#opis")).toBe("/pl/sklep#opis");
  });

  it("rejects protocol-relative URLs that leave the origin", () => {
    // The whole point of the helper: these all pass a naive `startsWith("/")`.
    expect(sanitizeRedirect("//evil.com")).toBeNull();
    expect(sanitizeRedirect("//evil.com/pl/konto")).toBeNull();
    expect(sanitizeRedirect("/\\evil.com")).toBeNull();
    expect(sanitizeRedirect("/\\/evil.com")).toBeNull();
  });

  it("rejects absolute URLs and non-paths", () => {
    expect(sanitizeRedirect("https://evil.com")).toBeNull();
    expect(sanitizeRedirect("http://evil.com")).toBeNull();
    expect(sanitizeRedirect("javascript:alert(1)")).toBeNull();
    expect(sanitizeRedirect("konto")).toBeNull();
    expect(sanitizeRedirect("../konto")).toBeNull();
  });

  it("rejects backslashes anywhere, not just up front", () => {
    expect(sanitizeRedirect("/konto\\..\\evil.com")).toBeNull();
    expect(sanitizeRedirect("/pl\\konto")).toBeNull();
  });

  it("rejects control characters used to smuggle a second header or host", () => {
    expect(sanitizeRedirect("/konto\nSet-Cookie: a=b")).toBeNull();
    expect(sanitizeRedirect("/konto\r\nLocation: https://evil.com")).toBeNull();
    expect(sanitizeRedirect("/\tevil.com")).toBeNull();
    expect(sanitizeRedirect("/konto\u0000")).toBeNull();
    expect(sanitizeRedirect("/konto\u007f")).toBeNull();
  });

  it("treats missing and empty input as no redirect", () => {
    expect(sanitizeRedirect(null)).toBeNull();
    expect(sanitizeRedirect(undefined)).toBeNull();
    expect(sanitizeRedirect("")).toBeNull();
  });
});

describe("loginPath", () => {
  it("prefixes both the login page and the target with the locale", () => {
    expect(loginPath("pl", "/konto")).toBe("/pl/logowanie?redirect=%2Fpl%2Fkonto");
    expect(loginPath("de", "/zamowienie")).toBe("/de/logowanie?redirect=%2Fde%2Fzamowienie");
  });

  it("encodes the target so nested query strings survive", () => {
    const path = loginPath("en", "/konto/zamowienia/o-1?tab=items");
    expect(path).toBe("/en/logowanie?redirect=%2Fen%2Fkonto%2Fzamowienia%2Fo-1%3Ftab%3Ditems");

    // Round-trips back to a path the sanitiser accepts.
    const redirect = new URLSearchParams(path.split("?")[1]).get("redirect");
    expect(sanitizeRedirect(redirect)).toBe("/en/konto/zamowienia/o-1?tab=items");
  });
});
