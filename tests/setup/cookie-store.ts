export type TestCookie = { name: string; value: string };

export type TestCookieOptions = {
  maxAge?: number;
  httpOnly?: boolean;
  [key: string]: unknown;
};

/**
 * Stand-in for the request-scoped cookie jar Next hands to route handlers.
 * Implements only the surface the app actually touches, plus a couple of
 * assertions helpers for the tests.
 */
export class TestCookieStore {
  private entries = new Map<string, { value: string; options: TestCookieOptions }>();

  get(name: string): TestCookie | undefined {
    const entry = this.entries.get(name);
    return entry === undefined ? undefined : { name, value: entry.value };
  }

  set(name: string, value: string, options: TestCookieOptions = {}): void {
    // Mirrors the browser: `maxAge: 0` deletes instead of storing an empty value.
    if (options.maxAge === 0) this.entries.delete(name);
    else this.entries.set(name, { value, options });
  }

  delete(name: string): void {
    this.entries.delete(name);
  }

  has(name: string): boolean {
    return this.entries.has(name);
  }

  clear(): void {
    this.entries.clear();
  }

  /** Options the cookie was last written with — used to assert `httpOnly`. */
  optionsFor(name: string): TestCookieOptions | undefined {
    return this.entries.get(name)?.options;
  }
}

/** Shared jar: the `next/headers` mock and the tests both reach for this one. */
export const testCookies = new TestCookieStore();
