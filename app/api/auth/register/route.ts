import { ApiError } from "@/src/lib/api/errors";
import { handleRoute, parseJsonBody } from "@/src/lib/api/handler";
import { enforceRateLimit } from "@/src/lib/api/rate-limit";
import { created } from "@/src/lib/api/response";
import { setAuthCookies } from "@/src/lib/auth/cookies";
import { hashPassword } from "@/src/lib/auth/password";
import { toPublicUser, usersRepo } from "@/src/lib/db/repositories/users";
import { attachCartToUser } from "@/src/lib/shop/current-cart";
import { registerSchema } from "@/src/lib/validation/shop";

export async function POST(request: Request) {
  return handleRoute(async () => {
    enforceRateLimit(request, "register", { limit: 5, windowSeconds: 600 });

    const input = await parseJsonBody(request, registerSchema);

    const existing = await usersRepo.findByEmail(input.email);
    if (existing) {
      throw new ApiError("EMAIL_TAKEN", {
        fields: { email: "Konto z tym adresem e-mail już istnieje" },
      });
    }

    const user = await usersRepo.create({
      email: input.email,
      passwordHash: await hashPassword(input.password),
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    });

    await setAuthCookies(user.id);
    await attachCartToUser(user.id);

    return created({ user: toPublicUser(user) });
  });
}
