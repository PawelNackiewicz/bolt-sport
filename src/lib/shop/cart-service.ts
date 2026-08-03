import { cartsRepo } from "@/src/lib/db/repositories/carts";
import { productsRepo } from "@/src/lib/db/repositories/products";
import type {
  Cart,
  CartItem,
  CartItemView,
  CartSummary,
  CartView,
  CartWarning,
  Product,
} from "@/src/lib/shop/types";
import {
  FREE_SHIPPING_THRESHOLD,
  MAX_CART_ITEM_QUANTITY,
  SHIPPING_FLAT_RATE,
} from "@/src/lib/shop/constants";

/** A product can be bought only when it has a retail price and stock left. */
export function isPurchasable(product: Product): boolean {
  return product.pricingMode === "retail" && product.price !== null;
}

export function calculateSummary(items: CartItemView[]): CartSummary {
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Mock shipping rule: flat fee, free above the threshold. An empty cart is
  // never charged for shipping.
  const shippingCost =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;

  return {
    itemsCount,
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    freeShippingRemainder: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal),
  };
}

/**
 * Joins cart lines with the catalog and repairs anything that drifted since the
 * item was added: products that disappeared or stopped being purchasable are
 * dropped, quantities above the stock level are trimmed. Repairs are persisted
 * so the same warning is not reported twice, and reported back as `warnings`.
 */
export async function buildCartView(cart: Cart): Promise<CartView> {
  const products = await productsRepo.findManyByIds(
    cart.items.map((item) => item.productId),
  );
  const byId = new Map(products.map((product) => [product.id, product]));

  const warnings: CartWarning[] = [];
  const keptItems: CartItem[] = [];
  const views: CartItemView[] = [];

  for (const item of cart.items) {
    const product = byId.get(item.productId);

    if (!product || !isPurchasable(product) || product.stock <= 0) {
      warnings.push({
        code: "ITEM_REMOVED",
        productName: product?.name ?? item.productId,
      });
      continue;
    }

    const quantity = Math.min(item.quantity, product.stock, MAX_CART_ITEM_QUANTITY);
    if (quantity < item.quantity) {
      warnings.push({ code: "QUANTITY_REDUCED", productName: product.name, quantity });
    }

    keptItems.push({ ...item, quantity });
    views.push({
      id: item.id,
      productId: product.id,
      quantity,
      product,
      // `isPurchasable` guarantees a non-null price.
      lineTotal: product.price! * quantity,
    });
  }

  if (warnings.length > 0) {
    await cartsRepo.replaceItems(cart.id, keptItems);
  }

  return {
    id: cart.id,
    items: views,
    summary: calculateSummary(views),
    warnings,
  };
}

/**
 * Folds a guest cart into the account cart on login: quantities for the same
 * product are summed and then clamped to what is actually in stock. The guest
 * cart is deleted afterwards so the cookie can be repointed at the user cart.
 */
export async function mergeGuestCartIntoUserCart(
  guestCartId: string,
  userId: string,
): Promise<Cart> {
  const guestCart = await cartsRepo.findById(guestCartId);
  const existingUserCart = await cartsRepo.findByUserId(userId);

  // Logging out leaves the cart cookie pointing at the *account* cart, so on
  // the next sign-in the "guest" cart can be the user cart itself. Merging it
  // with itself would double every quantity and then delete the cart it just
  // wrote, silently emptying the basket.
  if (existingUserCart && guestCart?.id === existingUserCart.id) {
    return existingUserCart;
  }

  // Nothing to merge — promote the guest cart or start a fresh one.
  if (!guestCart || guestCart.items.length === 0) {
    if (existingUserCart) return existingUserCart;
    if (guestCart) {
      const assigned = await cartsRepo.assignToUser(guestCart.id, userId);
      if (assigned) return assigned;
    }
    return cartsRepo.create(userId);
  }

  if (!existingUserCart) {
    const assigned = await cartsRepo.assignToUser(guestCart.id, userId);
    if (assigned) return assigned;
    return cartsRepo.create(userId);
  }

  const merged: CartItem[] = existingUserCart.items.map((item) => ({ ...item }));

  for (const guestItem of guestCart.items) {
    const existing = merged.find((item) => item.productId === guestItem.productId);
    if (existing) {
      existing.quantity += guestItem.quantity;
    } else {
      merged.push({ ...guestItem });
    }
  }

  // Clamp against live stock once, after summing.
  const products = await productsRepo.findManyByIds(merged.map((item) => item.productId));
  const byId = new Map(products.map((product) => [product.id, product]));

  const clamped = merged.filter((item) => {
    const product = byId.get(item.productId);
    if (!product || !isPurchasable(product) || product.stock <= 0) return false;

    item.quantity = Math.min(item.quantity, product.stock, MAX_CART_ITEM_QUANTITY);
    return true;
  });

  const updated = await cartsRepo.replaceItems(existingUserCart.id, clamped);
  await cartsRepo.delete(guestCart.id);

  return updated ?? existingUserCart;
}
