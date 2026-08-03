import { cookies } from "next/headers";

import {
  ACCESS_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  CART_COOKIE,
  CART_COOKIE_MAX_AGE,
  CART_COUNT_COOKIE,
  REFRESH_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
} from "@/src/lib/shop/constants";

import { signAccessToken, signRefreshToken } from "./jwt";

const baseOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;

/**
 * Issues a fresh token pair and writes both cookies.
 *
 * Only callable from route handlers and Server Actions — Server Components get
 * a read-only cookie store.
 */
export async function setAuthCookies(userId: string): Promise<void> {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(userId),
    signRefreshToken(userId),
  ]);

  const store = await cookies();

  store.set(ACCESS_COOKIE, accessToken, {
    ...baseOptions,
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
  store.set(REFRESH_COOKIE, refreshToken, {
    ...baseOptions,
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });
}

/** Refreshes only the short-lived access cookie, leaving the session intact. */
export async function setAccessCookie(userId: string): Promise<void> {
  const accessToken = await signAccessToken(userId);
  const store = await cookies();

  store.set(ACCESS_COOKIE, accessToken, {
    ...baseOptions,
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, "", { ...baseOptions, maxAge: 0 });
  store.set(REFRESH_COOKIE, "", { ...baseOptions, maxAge: 0 });
}

export async function readAuthCookies() {
  const store = await cookies();
  return {
    accessToken: store.get(ACCESS_COOKIE)?.value,
    refreshToken: store.get(REFRESH_COOKIE)?.value,
  };
}

/* -------------------------------------------------------------------------- */
/*  Guest cart cookie                                                         */
/* -------------------------------------------------------------------------- */

export async function readCartCookie(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value;
}

export async function setCartCookie(cartId: string): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, cartId, {
    ...baseOptions,
    maxAge: CART_COOKIE_MAX_AGE,
  });
}

export async function clearCartCookie(): Promise<void> {
  const store = await cookies();
  store.set(CART_COOKIE, "", { ...baseOptions, maxAge: 0 });
}

/**
 * Mirrors the cart's item count into a JS-readable cookie for the header badge.
 * Not httpOnly on purpose — it holds a number, no identifier — which is what
 * lets the badge render without a `/api/cart` round-trip on every page.
 */
export async function setCartCountCookie(count: number): Promise<void> {
  const store = await cookies();
  store.set(CART_COUNT_COOKIE, String(count), {
    ...baseOptions,
    httpOnly: false,
    maxAge: CART_COOKIE_MAX_AGE,
  });
}
