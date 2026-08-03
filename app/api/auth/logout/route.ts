import { handleRoute } from "@/src/lib/api/handler";
import { ok } from "@/src/lib/api/response";
import { clearAuthCookies, setCartCountCookie } from "@/src/lib/auth/cookies";

export async function POST() {
  return handleRoute(async () => {
    // The cart cookie survives logout on purpose: the basket stays with the
    // browser and merges again on the next login.
    await clearAuthCookies();
    // Whatever it pointed at now belongs to an account this browser can no
    // longer read, so the badge has to go back to zero.
    await setCartCountCookie(0);

    return ok({ success: true });
  });
}
