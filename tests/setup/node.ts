import { beforeEach, vi } from "vitest";

import { resetDb } from "@/src/lib/db/store";

import { testCookies } from "./cookie-store";

/**
 * Route handlers reach for the request-scoped cookie jar. The factory imports
 * the shared store lazily because `vi.mock` is hoisted above the imports above.
 */
vi.mock("next/headers", async () => {
  const { testCookies: store } = await import("./cookie-store");
  return {
    cookies: async () => store,
    headers: async () => new Headers(),
  };
});

beforeEach(() => {
  // Every test starts from the seeded catalog, the demo account and no session.
  resetDb();
  testCookies.clear();
  resetRateLimiter();
});

/** The limiter keeps its buckets on `globalThis`, so they outlive a test. */
function resetRateLimiter(): void {
  const global = globalThis as { __boltSportRateLimit?: Map<string, unknown> };
  global.__boltSportRateLimit?.clear();
}
