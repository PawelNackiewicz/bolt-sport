import { ApiError } from "@/src/lib/api/errors";
import { handleRoute, parseJsonBody, parseSearchParams } from "@/src/lib/api/handler";
import { created, ok } from "@/src/lib/api/response";
import { setCartCountCookie } from "@/src/lib/auth/cookies";
import { getSessionUser } from "@/src/lib/auth/session";
import { cartsRepo } from "@/src/lib/db/repositories/carts";
import { ordersRepo } from "@/src/lib/db/repositories/orders";
import { productsRepo } from "@/src/lib/db/repositories/products";
import { buildCartView } from "@/src/lib/shop/cart-service";
import { getCartForRead } from "@/src/lib/shop/current-cart";
import type { OrderItem } from "@/src/lib/shop/types";
import { createOrderSchema, orderListQuerySchema } from "@/src/lib/validation/shop";

/**
 * Checkout. Available to guests as well as logged-in users; a guest order has
 * `userId: null` and is reachable only through its unguessable id.
 *
 * Payment is mocked: `card` settles immediately, `transfer` and `cod` stay
 * `pending`. No payment gateway is contacted.
 */
export async function POST(request: Request) {
  return handleRoute(async () => {
    const input = await parseJsonBody(request, createOrderSchema);

    const cart = await getCartForRead();
    if (!cart || cart.items.length === 0) throw new ApiError("CART_EMPTY");

    // Re-validate against the live catalog immediately before charging.
    const view = await buildCartView(cart);
    if (view.items.length === 0) throw new ApiError("CART_EMPTY");

    // Its own code rather than a generic CONFLICT: the UI has to be able to
    // tell the customer *what* changed, in their own language.
    if (view.warnings.length > 0) throw new ApiError("CART_CHANGED");

    const user = await getSessionUser();

    // Snapshot each line so later catalog edits never rewrite order history.
    const items: OrderItem[] = view.items.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      sku: item.product.sku,
      unitPrice: item.product.price!,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      image: item.product.images[0] ?? null,
    }));

    const order = await ordersRepo.create({
      userId: user?.id ?? null,
      customer: input.customer,
      shippingAddress: input.shippingAddress,
      billingAddress: input.billingAddress ?? input.shippingAddress,
      paymentMethod: input.paymentMethod,
      status: input.paymentMethod === "card" ? "paid" : "pending",
      items,
      subtotal: view.summary.subtotal,
      shippingCost: view.summary.shippingCost,
      total: view.summary.total,
      currency: "PLN",
      notes: input.notes,
    });

    for (const item of items) {
      await productsRepo.decrementStock(item.productId, item.quantity);
    }

    await cartsRepo.clear(cart.id);
    // The cart is gone, so the header badge has to drop to zero even though
    // this response does not carry a cart.
    await setCartCountCookie(0);

    return created({ order });
  });
}

/** Order history of the logged-in user. */
export async function GET(request: Request) {
  return handleRoute(async () => {
    const user = await getSessionUser();
    if (!user) throw new ApiError("UNAUTHORIZED");

    const { page, perPage } = parseSearchParams(
      new URL(request.url),
      orderListQuerySchema,
    );

    const result = await ordersRepo.findByUserId(user.id, page, perPage);

    return ok(result.items, {
      page: result.page,
      perPage: result.perPage,
      total: result.total,
      totalPages: result.totalPages,
    });
  });
}
