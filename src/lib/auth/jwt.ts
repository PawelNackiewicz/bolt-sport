import { SignJWT, jwtVerify } from "jose";

import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_TTL_SECONDS,
} from "@/src/lib/shop/constants";

export type TokenType = "access" | "refresh";

export type TokenPayload = {
  userId: string;
  type: TokenType;
  /**
   * Issued-at in milliseconds, from the custom `ims` claim.
   *
   * The standard `iat` claim only has second resolution, which is too coarse
   * here: a password reset happening in the same second as the token was
   * issued would not invalidate it. `sessionsValidFrom` is compared against
   * this value instead.
   */
  issuedAtMs: number;
};

/** Development-only fallback so the app runs without extra env setup. */
const DEV_SECRET = "bolt-sport-dev-secret-do-not-use-in-production";

let cachedKey: Uint8Array | undefined;

function getKey(): Uint8Array {
  if (cachedKey) return cachedKey;

  const secret = process.env.AUTH_JWT_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error(
      "Brak AUTH_JWT_SECRET — ustaw zmienną środowiskową przed uruchomieniem produkcyjnym.",
    );
  }

  cachedKey = new TextEncoder().encode(secret ?? DEV_SECRET);
  return cachedKey;
}

async function sign(userId: string, type: TokenType, ttlSeconds: number): Promise<string> {
  const issuedAtMs = Date.now();
  const issuedAt = Math.floor(issuedAtMs / 1000);

  return new SignJWT({ type, ims: issuedAtMs })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt(issuedAt)
    .setExpirationTime(issuedAt + ttlSeconds)
    .sign(getKey());
}

export function signAccessToken(userId: string): Promise<string> {
  return sign(userId, "access", ACCESS_TOKEN_TTL_SECONDS);
}

export function signRefreshToken(userId: string): Promise<string> {
  return sign(userId, "refresh", REFRESH_TOKEN_TTL_SECONDS);
}

/**
 * Verifies signature, expiry and token type. Returns `null` rather than
 * throwing — every caller treats a bad token as "no session".
 */
export async function verifyToken(
  token: string | undefined,
  expectedType: TokenType,
): Promise<TokenPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getKey());

    if (payload.type !== expectedType) return null;
    if (typeof payload.sub !== "string" || typeof payload.iat !== "number") return null;

    const issuedAtMs =
      typeof payload.ims === "number" ? payload.ims : payload.iat * 1000;

    return { userId: payload.sub, type: expectedType, issuedAtMs };
  } catch {
    return null;
  }
}
