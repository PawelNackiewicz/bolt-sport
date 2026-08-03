import { ApiError } from "@/src/lib/api/errors";
import { handleRoute } from "@/src/lib/api/handler";
import { ok } from "@/src/lib/api/response";
import { readAuthCookies, setAccessCookie } from "@/src/lib/auth/cookies";
import { verifyToken } from "@/src/lib/auth/jwt";
import { toPublicUser, usersRepo } from "@/src/lib/db/repositories/users";

export async function POST() {
  return handleRoute(async () => {
    const { refreshToken } = await readAuthCookies();
    const payload = await verifyToken(refreshToken, "refresh");

    if (!payload) throw new ApiError("UNAUTHORIZED");

    const user = await usersRepo.findById(payload.userId);
    if (!user) throw new ApiError("UNAUTHORIZED");

    // Refresh tokens minted before the last password change are dead.
    if (Date.parse(user.sessionsValidFrom) > payload.issuedAtMs) {
      throw new ApiError("UNAUTHORIZED");
    }

    await setAccessCookie(user.id);

    return ok({ user: toPublicUser(user) });
  });
}
