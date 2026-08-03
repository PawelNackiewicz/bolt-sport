import { handleRoute } from "@/src/lib/api/handler";
import { cartsRepo } from "@/src/lib/db/repositories/carts";
import { buildCartView, calculateSummary } from "@/src/lib/shop/cart-service";
import { cartResponse } from "@/src/lib/shop/cart-response";
import { getCartForRead, getOrCreateCart } from "@/src/lib/shop/current-cart";

/**
 * Returns the cart with products joined in. Reading also re-validates it: gone
 * products are dropped and quantities trimmed to stock, reported in `warnings`.
 */
export async function GET() {
  return handleRoute(async () => {
    const cart = await getCartForRead();

    if (!cart) {
      // No cart yet — answer with an empty one instead of creating a record
      // (and a cookie) just because someone opened the page.
      return cartResponse({
        id: null,
        items: [],
        summary: calculateSummary([]),
        warnings: [],
      });
    }

    return cartResponse(await buildCartView(cart));
  });
}

export async function DELETE() {
  return handleRoute(async () => {
    const cart = await getOrCreateCart();
    const cleared = await cartsRepo.clear(cart.id);

    return cartResponse(await buildCartView(cleared ?? cart));
  });
}
