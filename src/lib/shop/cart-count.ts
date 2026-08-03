import { CART_COUNT_COOKIE } from "./constants";

/**
 * Reads the badge cookie written by every cart route. Client-side only — it
 * exists so the header counter is correct on the first frame of any page,
 * including the ones that never fetch the cart.
 */
export function readCartCountCookie(): number {
  if (typeof document === "undefined") return 0;

  const entry = document.cookie
    .split(/;\s*/)
    .find((candidate) => candidate.startsWith(`${CART_COUNT_COOKIE}=`));
  if (!entry) return 0;

  const value = Number(entry.slice(CART_COUNT_COOKIE.length + 1));
  return Number.isInteger(value) && value >= 0 ? value : 0;
}
