import { ApiError } from "@/src/lib/api/errors";
import { toPublicUser, usersRepo } from "@/src/lib/db/repositories/users";
import type { PublicUser, User } from "@/src/lib/shop/types";

import { readAuthCookies } from "./cookies";
import { verifyToken } from "./jwt";

/**
 * Resolves the current session from cookies.
 *
 * The access token is the fast path; when it has expired we fall back to the
 * refresh token, which is the session of record. Either way the token's
 * issued-at is compared against the user's `sessionsValidFrom`, so changing or
 * resetting a password invalidates every outstanding token immediately — not
 * only once the access token happens to expire.
 */
export async function getSessionUser(): Promise<User | null> {
  const { accessToken, refreshToken } = await readAuthCookies();

  const payload =
    (await verifyToken(accessToken, "access")) ??
    (await verifyToken(refreshToken, "refresh"));

  if (!payload) return null;

  const user = await usersRepo.findById(payload.userId);
  if (!user) return null;

  // Millisecond comparison — see `TokenPayload.issuedAtMs`. A password reset
  // that lands in the same second as the token was issued must still kill it.
  if (Date.parse(user.sessionsValidFrom) > payload.issuedAtMs) return null;

  return user;
}

/** Session as it is exposed to the client — never carries the password hash. */
export async function getSession(): Promise<PublicUser | null> {
  const user = await getSessionUser();
  return user ? toPublicUser(user) : null;
}

/** Throws `UNAUTHORIZED` when there is no valid session. */
export async function requireAuth(): Promise<User> {
  const user = await getSessionUser();
  if (!user) throw new ApiError("UNAUTHORIZED");
  return user;
}
