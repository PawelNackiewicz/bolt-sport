import { localePath, type Locale } from "@/src/i18n/config";

/**
 * Narrows a user-supplied `?redirect=` down to a path on this origin, or
 * `null` when it cannot be trusted.
 *
 * A bare `startsWith("/")` check is not enough: `//evil.com` and `/\evil.com`
 * are protocol-relative URLs that the browser resolves against a *different*
 * origin, which turns the login redirect into an open redirect. Backslashes and
 * control characters are rejected outright because browsers normalise them
 * inconsistently before resolving.
 */
export function sanitizeRedirect(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/")) return null;
  if (raw[1] === "/" || raw[1] === "\\") return null;
  if (raw.includes("\\")) return null;

  for (const character of raw) {
    const code = character.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) return null;
  }

  return raw;
}

/**
 * Login URL that returns to `target` once the user signs in. Both the login
 * page and the target carry the locale prefix, so honouring the redirect costs
 * no extra hop through the proxy.
 */
export function loginPath(locale: Locale, target: string): string {
  const redirect = encodeURIComponent(localePath(locale, target));
  return `${localePath(locale, "/logowanie")}?redirect=${redirect}`;
}
