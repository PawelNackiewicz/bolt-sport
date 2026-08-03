import { ApiError } from "@/src/lib/api/errors";
import { handleRoute, parseJsonBody } from "@/src/lib/api/handler";
import { cartsRepo } from "@/src/lib/db/repositories/carts";
import { productsRepo } from "@/src/lib/db/repositories/products";
import { buildCartView, isPurchasable } from "@/src/lib/shop/cart-service";
import { cartResponse } from "@/src/lib/shop/cart-response";
import { getOrCreateCart } from "@/src/lib/shop/current-cart";
import { addCartItemSchema } from "@/src/lib/validation/shop";

/** Adds a product, or tops up the quantity if it is already in the cart. */
export async function POST(request: Request) {
  return handleRoute(async () => {
    const input = await parseJsonBody(request, addCartItemSchema);

    const product = await productsRepo.findById(input.productId);
    if (!product) throw new ApiError("NOT_FOUND", { message: "Nie znaleziono produktu" });

    // Rings and MMA cages are quoted individually and never enter the cart.
    if (!isPurchasable(product)) throw new ApiError("PRODUCT_NOT_PURCHASABLE");

    if (product.stock <= 0) {
      throw new ApiError("INSUFFICIENT_STOCK", {
        message: "Produkt jest chwilowo niedostępny",
      });
    }

    const cart = await getOrCreateCart();
    const alreadyInCart =
      cart.items.find((item) => item.productId === product.id)?.quantity ?? 0;

    if (alreadyInCart + input.quantity > product.stock) {
      throw new ApiError("INSUFFICIENT_STOCK", {
        message: `Dostępna ilość to ${product.stock} szt.`,
        // The number travels separately from the sentence so every locale can
        // say it in its own words instead of falling back to the generic one.
        params: { available: product.stock },
      });
    }

    const updated = await cartsRepo.addItem(
      cart.id,
      product.id,
      input.quantity,
      product.stock,
    );
    if (!updated) throw new ApiError("NOT_FOUND", { message: "Nie znaleziono koszyka" });

    return cartResponse(await buildCartView(updated), 201);
  });
}
