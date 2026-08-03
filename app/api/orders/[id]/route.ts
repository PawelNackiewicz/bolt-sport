import { ApiError } from "@/src/lib/api/errors";
import { handleRoute } from "@/src/lib/api/handler";
import { ok } from "@/src/lib/api/response";
import { getSessionUser } from "@/src/lib/auth/session";
import { ordersRepo } from "@/src/lib/db/repositories/orders";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return handleRoute(async () => {
    const { id } = await context.params;

    const order = await ordersRepo.findById(id);
    if (!order) throw new ApiError("NOT_FOUND", { message: "Nie znaleziono zamówienia" });

    // Orders placed by an account are private to that account. Guest orders
    // have no owner and are protected only by the unguessable id, which is what
    // makes the confirmation page reachable after a guest checkout.
    if (order.userId !== null) {
      const user = await getSessionUser();
      if (!user) throw new ApiError("UNAUTHORIZED");
      if (user.id !== order.userId) throw new ApiError("FORBIDDEN");
    }

    return ok({ order });
  });
}
