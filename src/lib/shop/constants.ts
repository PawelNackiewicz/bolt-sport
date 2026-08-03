/** Shop-wide tunables shared by the API and the UI. */

/** Flat shipping fee in grosze (mock rule — no carrier or lead time implied). */
export const SHIPPING_FLAT_RATE = 2500;

/** Order value in grosze from which shipping is free. */
export const FREE_SHIPPING_THRESHOLD = 50000;

export const DEFAULT_PER_PAGE = 12;
export const MAX_PER_PAGE = 48;

/** Guest carts are keyed by this cookie and live for 30 days. */
export const CART_COOKIE = "rs_cart";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * Item count mirrored for the header badge. Deliberately readable from JS: it
 * carries no identifier, and it is what lets pages that never render the cart
 * show a correct counter without calling `/api/cart`.
 */
export const CART_COUNT_COOKIE = "rs_cart_count";

export const ACCESS_COOKIE = "rs_access";
export const REFRESH_COOKIE = "rs_refresh";

/** Access tokens are short lived; the refresh token carries the real session. */
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

/** Password reset tokens expire after 30 minutes. */
export const PASSWORD_RESET_TTL_SECONDS = 30 * 60;

export const MAX_CART_ITEM_QUANTITY = 99;
