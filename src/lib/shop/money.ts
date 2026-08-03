import type { Locale } from "@/src/i18n/config";

/**
 * Formats an integer amount of grosze as currency. Locale only affects
 * separators and symbol placement — the currency itself is always PLN.
 */
export function formatPrice(grosze: number, locale: Locale = "pl"): string {
  const tag = locale === "pl" ? "pl-PL" : locale === "de" ? "de-DE" : "en-GB";

  return new Intl.NumberFormat(tag, {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(grosze / 100);
}

/** Parses user-entered złote ("349", "349,50") into grosze. */
export function parsePriceToGrosze(input: string): number | undefined {
  const normalised = input.trim().replace(",", ".");
  if (normalised === "") return undefined;

  const value = Number(normalised);
  if (!Number.isFinite(value) || value < 0) return undefined;

  return Math.round(value * 100);
}
