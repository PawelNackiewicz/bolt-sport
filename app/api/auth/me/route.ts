import { handleRoute } from "@/src/lib/api/handler";
import { ok } from "@/src/lib/api/response";
import { requireAuth } from "@/src/lib/auth/session";
import { toPublicUser } from "@/src/lib/db/repositories/users";

export async function GET() {
  return handleRoute(async () => {
    const user = await requireAuth();
    return ok({ user: toPublicUser(user) });
  });
}
