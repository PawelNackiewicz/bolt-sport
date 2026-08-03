import { describe, expect, it } from "vitest";

import { GET as getCart } from "@/app/api/cart/route";
import { POST as addItem } from "@/app/api/cart/items/route";
import { PATCH as patchItem } from "@/app/api/cart/items/[itemId]/route";
import type { CartView } from "@/src/lib/shop/types";

import { apiRequest, expectError, expectOk, routeContext } from "../setup/api";
import {
  deleteProduct,
  purchasableProduct,
  purchasableProducts,
  quoteProduct,
  setStock,
} from "../setup/fixtures";

const add = (productId: string, quantity: number) =>
  addItem(apiRequest("/api/cart/items", { method: "POST", body: { productId, quantity } }));

const patch = (itemId: string, quantity: number) =>
  patchItem(
    apiRequest(`/api/cart/items/${itemId}`, { method: "PATCH", body: { quantity } }),
    routeContext({ itemId }),
  );

describe("stock rules when adding", () => {
  it("reports how many pieces are actually available", async () => {
    const product = purchasableProduct(3);
    setStock(product.id, 3);

    const error = await expectError(await add(product.id, 4), "INSUFFICIENT_STOCK");

    // The number has to travel as a parameter — the client localises the
    // sentence and would otherwise show only "not enough stock".
    expect(error.params).toEqual({ available: 3 });
    expect(error.message).toContain("3");
  });

  it("counts what is already in the cart towards the limit", async () => {
    const product = purchasableProduct(3);
    setStock(product.id, 3);

    await expectOk<CartView>(await add(product.id, 2), 201);
    const error = await expectError(await add(product.id, 2), "INSUFFICIENT_STOCK");

    expect(error.params).toEqual({ available: 3 });
  });

  it("refuses a product that is out of stock, without a misleading count", async () => {
    const product = purchasableProduct();
    setStock(product.id, 0);

    const error = await expectError(await add(product.id, 1), "INSUFFICIENT_STOCK");

    // "0 available" would read worse than the generic sentence here.
    expect(error.params).toBeUndefined();
  });

  it("keeps quote-priced products out of the cart entirely", async () => {
    const product = quoteProduct();
    await expectError(await add(product.id, 1), "PRODUCT_NOT_PURCHASABLE");
  });

  it("404s on an unknown product", async () => {
    await expectError(await add("p-does-not-exist", 1), "NOT_FOUND");
  });

  it("rejects a non-positive or absurd quantity", async () => {
    const product = purchasableProduct();

    await expectError(await add(product.id, 0), "VALIDATION_ERROR");
    await expectError(await add(product.id, -1), "VALIDATION_ERROR");
    await expectError(await add(product.id, 1000), "VALIDATION_ERROR");
  });
});

describe("stock rules when updating a line", () => {
  it("reports availability on PATCH too", async () => {
    const product = purchasableProduct(3);
    setStock(product.id, 3);

    const cart = await expectOk<CartView>(await add(product.id, 1), 201);
    const error = await expectError(
      await patch(cart.items[0].id, 10),
      "INSUFFICIENT_STOCK",
    );

    expect(error.params).toEqual({ available: 3 });
  });
});

describe("re-validation on read", () => {
  it("trims a line that no longer fits the stock and says so", async () => {
    const product = purchasableProduct(5);
    setStock(product.id, 5);
    await add(product.id, 5);

    // A concurrent order drains the shelf.
    setStock(product.id, 2);

    const cart = await expectOk<CartView>(await getCart());

    expect(cart.items[0].quantity).toBe(2);
    expect(cart.warnings).toEqual([
      { code: "QUANTITY_REDUCED", productName: product.name, quantity: 2 },
    ]);
    expect(cart.summary.itemsCount).toBe(2);
  });

  it("persists the repair, so the same warning is not reported twice", async () => {
    const product = purchasableProduct(5);
    setStock(product.id, 5);
    await add(product.id, 5);
    setStock(product.id, 2);

    await getCart();
    const second = await expectOk<CartView>(await getCart());

    expect(second.warnings).toEqual([]);
    expect(second.items[0].quantity).toBe(2);
  });

  it("drops a product that sold out completely", async () => {
    const product = purchasableProduct();
    await add(product.id, 1);
    setStock(product.id, 0);

    const cart = await expectOk<CartView>(await getCart());

    expect(cart.items).toEqual([]);
    expect(cart.warnings).toEqual([
      { code: "ITEM_REMOVED", productName: product.name },
    ]);
  });

  it("drops a product that disappeared from the catalog", async () => {
    const product = purchasableProduct();
    await add(product.id, 1);
    deleteProduct(product.id);

    const cart = await expectOk<CartView>(await getCart());

    expect(cart.items).toEqual([]);
    expect(cart.warnings[0].code).toBe("ITEM_REMOVED");
  });

  it("leaves the other lines alone while repairing one", async () => {
    const [drained, untouched] = purchasableProducts(2, 5);

    setStock(drained.id, 5);
    setStock(untouched.id, 5);
    await add(drained.id, 5);
    await add(untouched.id, 4);

    setStock(drained.id, 1);

    const cart = await expectOk<CartView>(await getCart());

    expect(cart.warnings).toHaveLength(1);
    expect(cart.items.find((item) => item.productId === drained.id)?.quantity).toBe(1);
    expect(cart.items.find((item) => item.productId === untouched.id)?.quantity).toBe(4);
    expect(cart.summary.itemsCount).toBe(5);
  });
});
