import { beforeEach, describe, expect, it } from "vitest";

import { DELETE as clearCart, GET as getCart } from "@/app/api/cart/route";
import { POST as addItem } from "@/app/api/cart/items/route";
import {
  DELETE as removeItem,
  PATCH as patchItem,
} from "@/app/api/cart/items/[itemId]/route";
import { productsRepo } from "@/src/lib/db/repositories/products";
import { CART_COOKIE, CART_COUNT_COOKIE } from "@/src/lib/shop/constants";
import type { CartView, Product } from "@/src/lib/shop/types";

import {
  apiRequest,
  cartCountCookie,
  expectError,
  expectOk,
  routeContext,
} from "../setup/api";
import { testCookies } from "../setup/cookie-store";

let product: Product;

beforeEach(async () => {
  const { items } = await productsRepo.findMany({
    page: 1,
    perPage: 48,
    sort: "newest",
  } as Parameters<typeof productsRepo.findMany>[0]);

  product = items.find((item) => item.pricingMode === "retail" && item.stock > 2)!;
});

const add = (productId: string, quantity: number) =>
  addItem(apiRequest("/api/cart/items", { method: "POST", body: { productId, quantity } }));

describe("cart lifecycle", () => {
  it("starts empty without creating a cart record or a cookie", async () => {
    const cart = await expectOk<CartView>(await getCart());

    expect(cart.id).toBeNull();
    expect(cart.items).toEqual([]);
    expect(cart.summary.itemsCount).toBe(0);
    // Opening a page must not mint a guest cart.
    expect(testCookies.has(CART_COOKIE)).toBe(false);
  });

  it("creates the guest cart cookie on the first mutation", async () => {
    await expectOk<CartView>(await add(product.id, 1), 201);
    expect(testCookies.has(CART_COOKIE)).toBe(true);
  });

  it("adds, tops up, updates and removes a line", async () => {
    const added = await expectOk<CartView>(await add(product.id, 1), 201);
    expect(added.summary.itemsCount).toBe(1);

    const toppedUp = await expectOk<CartView>(await add(product.id, 1), 201);
    expect(toppedUp.items).toHaveLength(1);
    expect(toppedUp.items[0].quantity).toBe(2);

    const itemId = toppedUp.items[0].id;
    const patched = await expectOk<CartView>(
      await patchItem(
        apiRequest(`/api/cart/items/${itemId}`, { method: "PATCH", body: { quantity: 3 } }),
        routeContext({ itemId }),
      ),
    );
    expect(patched.items[0].quantity).toBe(3);

    const removed = await expectOk<CartView>(
      await removeItem(
        apiRequest(`/api/cart/items/${itemId}`, { method: "DELETE" }),
        routeContext({ itemId }),
      ),
    );
    expect(removed.items).toEqual([]);
  });

  it("treats quantity 0 as removing the line", async () => {
    const added = await expectOk<CartView>(await add(product.id, 2), 201);
    const itemId = added.items[0].id;

    const patched = await expectOk<CartView>(
      await patchItem(
        apiRequest(`/api/cart/items/${itemId}`, { method: "PATCH", body: { quantity: 0 } }),
        routeContext({ itemId }),
      ),
    );

    expect(patched.items).toEqual([]);
    expect(patched.summary.itemsCount).toBe(0);
  });

  it("clears the whole cart", async () => {
    await add(product.id, 2);
    const cleared = await expectOk<CartView>(await clearCart());

    expect(cleared.items).toEqual([]);
    expect(cleared.summary.total).toBe(0);
  });

  it("prices the line and the summary from the catalog", async () => {
    const cart = await expectOk<CartView>(await add(product.id, 2), 201);

    expect(cart.items[0].lineTotal).toBe(product.price! * 2);
    expect(cart.summary.subtotal).toBe(product.price! * 2);
  });

  it("404s on an item id that is not in this cart", async () => {
    await add(product.id, 1);

    const response = await patchItem(
      apiRequest("/api/cart/items/nope", { method: "PATCH", body: { quantity: 1 } }),
      routeContext({ itemId: "nope" }),
    );

    await expectError(response, "NOT_FOUND");
  });
});

describe("badge cookie", () => {
  it("is written on read and stays in step with every mutation", async () => {
    await getCart();
    expect(cartCountCookie()).toBe(0);

    await add(product.id, 2);
    expect(cartCountCookie()).toBe(2);

    const cart = await expectOk<CartView>(await getCart());
    const itemId = cart.items[0].id;

    await patchItem(
      apiRequest(`/api/cart/items/${itemId}`, { method: "PATCH", body: { quantity: 3 } }),
      routeContext({ itemId }),
    );
    expect(cartCountCookie()).toBe(3);

    await removeItem(
      apiRequest(`/api/cart/items/${itemId}`, { method: "DELETE" }),
      routeContext({ itemId }),
    );
    expect(cartCountCookie()).toBe(0);
  });

  it("is readable from JavaScript — that is the whole point of it", async () => {
    // httpOnly would defeat the purpose: the header could not render the count
    // without calling /api/cart on every single page.
    await getCart();
    expect(testCookies.optionsFor(CART_COUNT_COOKIE)?.httpOnly).toBe(false);
  });

  it("does not expose the cart identifier", async () => {
    const cart = await expectOk<CartView>(await add(product.id, 1), 201);

    expect(testCookies.get(CART_COUNT_COOKIE)?.value).toBe("1");
    expect(testCookies.get(CART_COUNT_COOKIE)?.value).not.toContain(cart.id!);
    // The identifier lives in the httpOnly cookie instead.
    expect(testCookies.optionsFor(CART_COOKIE)?.httpOnly).toBe(true);
  });
});
