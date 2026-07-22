import type { Dictionary, Locale } from "./config";

/**
 * Dynamiczne importy — do bundla trafia tylko słownik dla aktualnego locale.
 * Wywołuj wyłącznie po stronie serwera (layout / page / route handler).
 */
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  pl: () => import("./dictionaries/pl.json").then((m) => m.default),
  de: () => import("./dictionaries/de.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
