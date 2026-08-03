import { handleRoute, parseJsonBody } from "@/src/lib/api/handler";
import { enforceRateLimit } from "@/src/lib/api/rate-limit";
import { ok } from "@/src/lib/api/response";
import { tokensRepo } from "@/src/lib/db/repositories/tokens";
import { usersRepo } from "@/src/lib/db/repositories/users";
import { forgotPasswordSchema } from "@/src/lib/validation/shop";

/**
 * MOCK PASSWORD RESET — there is no SMTP integration. The reset link is printed
 * to the server console, and outside production the token is also returned in
 * the response so the flow can be exercised from the browser.
 *
 * The endpoint answers 200 whether or not the account exists, so it cannot be
 * used to discover registered addresses.
 */
export async function POST(request: Request) {
  return handleRoute(async () => {
    enforceRateLimit(request, "password-forgot", { limit: 5, windowSeconds: 600 });

    const { email } = await parseJsonBody(request, forgotPasswordSchema);
    const user = await usersRepo.findByEmail(email);

    if (!user) {
      return ok({ success: true });
    }

    const token = await tokensRepo.createPasswordReset(user.id);
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const link = `${baseUrl}/pl/ustaw-nowe-haslo?token=${token.token}`;

    console.info(
      `\n[mock-mail] Reset hasła dla ${user.email}\n[mock-mail] ${link}\n[mock-mail] Token wygasa: ${token.expiresAt}\n`,
    );

    return ok({
      success: true,
      // Never leaked in production builds.
      ...(process.env.NODE_ENV !== "production"
        ? { devToken: token.token, devLink: link }
        : {}),
    });
  });
}
