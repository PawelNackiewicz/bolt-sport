import { ApiError } from "@/src/lib/api/errors";
import { handleRoute, parseJsonBody } from "@/src/lib/api/handler";
import { cartsRepo } from "@/src/lib/db/repositories/carts";
import { productsRepo } from "@/src/lib/db/repositories/products";
import { buildCartView } from "@/src/lib/shop/cart-service";
import { cartResponse } from "@/src/lib/shop/cart-response";
import { getOrCreateCart } from "@/src/lib/shop/current-cart";
import { updateCartItemSchema } from "@/src/lib/validation/shop";

type Context = { params: Promise<{ itemId: string }> };

const itemNotFound = () =>
  new ApiError("NOT_FOUND", { message: "Nie znaleziono pozycji w koszyku" });

/** `quantity: 0` removes the line. */
export async function PATCH(request: Request, context: Context) {
  return handleRoute(async () => {
    const { itemId } = await context.params;
    const { quantity } = await parseJsonBody(request, updateCartItemSchema);

    const cart = await getOrCreateCart();
    const item = cart.items.find((candidate) => candidate.id === itemId);
    if (!item) throw itemNotFound();

    if (quantity > 0) {
      const product = await productsRepo.findById(item.productId);
      if (!product) throw new ApiError("NOT_FOUND", { message: "Nie znaleziono produktu" });

      if (quantity > product.stock) {
        throw new ApiError("INSUFFICIENT_STOCK", {
          message: `Dostępna ilość to ${product.stock} szt.`,
          params: { available: product.stock },
        });
      }
    }

    const updated = await cartsRepo.updateItemQuantity(cart.id, itemId, quantity);
    if (!updated) throw itemNotFound();

    return cartResponse(await buildCartView(updated));
  });
}

export async function DELETE(_request: Request, context: Context) {
  return handleRoute(async () => {
    const { itemId } = await context.params;

    const cart = await getOrCreateCart();
    const updated = await cartsRepo.removeItem(cart.id, itemId);
    if (!updated) throw itemNotFound();

    return cartResponse(await buildCartView(updated));
  });
}
