import type { Dictionary, Locale } from "./config";

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  pl: () => import("./dictionaries/pl.json").then((m) => m.default),
  de: () => import("./dictionaries/de.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
};

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
