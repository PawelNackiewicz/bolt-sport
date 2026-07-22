import type plDictionary from "./dictionaries/pl.json";

export const locales = ["pl", "de", "en"] as const;
export const defaultLocale: Locale = "pl";

export type Locale = (typeof locales)[number];

/** Ciasteczko z zapamiętanym wyborem języka — czytane w `proxy.ts`. */
export const LOCALE_COOKIE = "lang";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Kształt słownika bierzemy z `pl.json` — to jest źródło prawdy dla kluczy. */
export type Dictionary = typeof plDictionary;

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value);
}

/**
 * Dokleja locale do ścieżki wewnętrznej: `/sklep` → `/de/sklep`.
 * Linki zewnętrzne, `mailto:`, `tel:` i gołe kotwice zostawia bez zmian.
 */
export function localePath(locale: Locale, href: string): string {
  if (!href.startsWith("/")) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

/** Podmienia (lub dokleja) segment locale w istniejącej ścieżce. */
export function switchLocaleInPath(pathname: string, target: Locale): string {
  const segments = pathname.split("/");
  if (isLocale(segments[1])) {
    segments[1] = target;
  } else {
    segments.splice(1, 0, target);
  }
  return segments.join("/") || `/${target}`;
}
