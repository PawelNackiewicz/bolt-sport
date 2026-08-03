import { ApiError } from "@/src/lib/api/errors";
import { handleRoute, parseJsonBody } from "@/src/lib/api/handler";
import { ok } from "@/src/lib/api/response";
import { setAuthCookies } from "@/src/lib/auth/cookies";
import { hashPassword, verifyPassword } from "@/src/lib/auth/password";
import { tokensRepo } from "@/src/lib/db/repositories/tokens";
import { usersRepo } from "@/src/lib/db/repositories/users";
import { requireAuth } from "@/src/lib/auth/session";
import { changePasswordSchema } from "@/src/lib/validation/shop";

export async function POST(request: Request) {
  return handleRoute(async () => {
    const user = await requireAuth();
    const input = await parseJsonBody(request, changePasswordSchema);

    const matches = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!matches) {
      throw new ApiError("INVALID_CREDENTIALS", {
        message: "Aktualne hasło jest nieprawidłowe",
        fields: { currentPassword: "Aktualne hasło jest nieprawidłowe" },
      });
    }

    await usersRepo.updatePassword(user.id, await hashPassword(input.newPassword));
    await tokensRepo.deleteForUser(user.id);

    // The change invalidated every token — hand this browser a fresh pair so the
    // user is not logged out of the tab they are working in.
    await setAuthCookies(user.id);

    return ok({ success: true });
  });
}
