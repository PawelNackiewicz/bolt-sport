/**
 * Absolute origin of the deployed site. Metadata, the sitemap and JSON-LD all
 * need fully-qualified URLs, so they read it from here instead of each
 * re-deriving it from env.
 */
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
);

/** Turns an internal path into an absolute URL: `/pl/blog` -> `https://…/pl/blog`. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
