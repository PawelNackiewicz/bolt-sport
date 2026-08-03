import { ApiError } from "@/src/lib/api/errors";
import { handleRoute, parseJsonBody } from "@/src/lib/api/handler";
import { enforceRateLimit } from "@/src/lib/api/rate-limit";
import { ok } from "@/src/lib/api/response";
import { setAuthCookies } from "@/src/lib/auth/cookies";
import { verifyPassword } from "@/src/lib/auth/password";
import { toPublicUser, usersRepo } from "@/src/lib/db/repositories/users";
import { attachCartToUser } from "@/src/lib/shop/current-cart";
import { loginSchema } from "@/src/lib/validation/shop";

export async function POST(request: Request) {
  return handleRoute(async () => {
    enforceRateLimit(request, "login", { limit: 10, windowSeconds: 600 });

    const input = await parseJsonBody(request, loginSchema);
    const user = await usersRepo.findByEmail(input.email);

    // Same error whether the account is missing or the password is wrong, so
    // the endpoint cannot be used to enumerate registered addresses.
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new ApiError("INVALID_CREDENTIALS");
    }

    await setAuthCookies(user.id);
    await attachCartToUser(user.id);

    return ok({ user: toPublicUser(user) });
  });
}
