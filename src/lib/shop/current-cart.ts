import { cartsRepo } from "@/src/lib/db/repositories/carts";
import { getSessionUser } from "@/src/lib/auth/session";
import {
  readCartCookie,
  setCartCookie,
  setCartCountCookie,
} from "@/src/lib/auth/cookies";
import { mergeGuestCartIntoUserCart } from "@/src/lib/shop/cart-service";
import type { Cart } from "@/src/lib/shop/types";

/**
 * Reads the current cart without ever creating one or touching cookies, so it
 * is safe to call from Server Components (where the cookie store is read-only).
 * Returns `null` when the visitor has no cart yet.
 */
export async function getCartForRead(): Promise<Cart | null> {
  const user = await getSessionUser();

  if (user) {
    const userCart = await cartsRepo.findByUserId(user.id);
    if (userCart) return userCart;
  }

  const cartId = await readCartCookie();
  if (!cartId) return null;

  const guestCart = await cartsRepo.findById(cartId);
  // A cookie pointing at someone else's cart is ignored rather than trusted.
  if (!guestCart || (guestCart.userId !== null && guestCart.userId !== user?.id)) {
    return null;
  }

  return guestCart;
}

/**
 * Resolves the cart for a mutation, creating one when needed. Route handlers
 * only — it writes the guest cart cookie.
 */
export async function getOrCreateCart(): Promise<Cart> {
  const user = await getSessionUser();

  if (user) {
    const existing = await cartsRepo.findByUserId(user.id);
    if (existing) return existing;

    const created = await cartsRepo.create(user.id);
    // Point the cookie at the account cart too, so the id stays stable if the
    // session later expires.
    await setCartCookie(created.id);
    return created;
  }

  const cartId = await readCartCookie();
  if (cartId) {
    const existing = await cartsRepo.findById(cartId);
    if (existing && existing.userId === null) return existing;
  }

  const created = await cartsRepo.create(null);
  await setCartCookie(created.id);
  return created;
}

/**
 * Called right after a successful register/login: folds whatever the visitor
 * collected as a guest into the account cart and repoints the cookie at it.
 */
export async function attachCartToUser(userId: string): Promise<Cart> {
  const guestCartId = await readCartCookie();

  const cart = guestCartId
    ? await mergeGuestCartIntoUserCart(guestCartId, userId)
    : ((await cartsRepo.findByUserId(userId)) ?? (await cartsRepo.create(userId)));

  await setCartCookie(cart.id);
  // Approximate: the count is not re-validated against stock here, and the next
  // `/api/cart` corrects it. Good enough for a badge, and it means signing in
  // does not leave a stale counter behind.
  await setCartCountCookie(
    cart.items.reduce((sum, item) => sum + item.quantity, 0),
  );

  return cart;
}
