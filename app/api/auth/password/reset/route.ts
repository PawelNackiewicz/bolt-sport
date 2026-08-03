import { ApiError } from "@/src/lib/api/errors";
import { handleRoute, parseJsonBody } from "@/src/lib/api/handler";
import { ok } from "@/src/lib/api/response";
import { clearAuthCookies } from "@/src/lib/auth/cookies";
import { hashPassword } from "@/src/lib/auth/password";
import { tokensRepo } from "@/src/lib/db/repositories/tokens";
import { usersRepo } from "@/src/lib/db/repositories/users";
import { resetPasswordSchema } from "@/src/lib/validation/shop";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const input = await parseJsonBody(request, resetPasswordSchema);

    const token = await tokensRepo.findPasswordReset(input.token);
    if (!token || token.usedAt !== null) throw new ApiError("TOKEN_INVALID");
    if (Date.parse(token.expiresAt) < Date.now()) throw new ApiError("TOKEN_EXPIRED");

    const user = await usersRepo.findById(token.userId);
    if (!user) throw new ApiError("TOKEN_INVALID");

    // Moving `sessionsValidFrom` forward is what invalidates every existing
    // session, including the one that requested the reset.
    await usersRepo.updatePassword(user.id, await hashPassword(input.password));
    await tokensRepo.markPasswordResetUsed(token.token);
    await tokensRepo.deleteForUser(user.id);
    await clearAuthCookies();

    return ok({ success: true });
  });
}
