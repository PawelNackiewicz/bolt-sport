import { describe, expect, it } from "vitest";

import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { POST as register } from "@/app/api/auth/register/route";
import { GET as getCart } from "@/app/api/cart/route";
import { POST as addItem } from "@/app/api/cart/items/route";
import type { CartView } from "@/src/lib/shop/types";

import { DEMO_CREDENTIALS, apiRequest, cartCountCookie, expectOk } from "../setup/api";
import { purchasableProduct, purchasableProducts, setStock } from "../setup/fixtures";

const add = (productId: string, quantity: number) =>
  addItem(apiRequest("/api/cart/items", { method: "POST", body: { productId, quantity } }));

const signIn = () =>
  login(apiRequest("/api/auth/login", { method: "POST", body: DEMO_CREDENTIALS }));

const signOut = () => logout();

describe("merging a guest cart into the account", () => {
  it("promotes a guest cart when the account has none", async () => {
    const product = purchasableProduct(2);
    await add(product.id, 2);

    await expectOk(await signIn());
    const cart = await expectOk<CartView>(await getCart());

    expect(cart.summary.itemsCount).toBe(2);
    expect(cart.items[0].productId).toBe(product.id);
  });

  it("sums quantities for a product present in both carts", async () => {
    const product = purchasableProduct(6);
    setStock(product.id, 6);

    // Build the account cart first.
    await expectOk(await signIn());
    await add(product.id, 2);
    await signOut();

    // Then collect more as a guest.
    await add(product.id, 3);
    await expectOk(await signIn());

    const cart = await expectOk<CartView>(await getCart());
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(5);
  });

  it("clamps the summed quantity to what is actually in stock", async () => {
    const product = purchasableProduct(4);
    setStock(product.id, 4);

    await expectOk(await signIn());
    await add(product.id, 3);
    await signOut();

    await add(product.id, 3);
    await expectOk(await signIn());

    const cart = await expectOk<CartView>(await getCart());
    expect(cart.items[0].quantity).toBe(4);
  });

  it("keeps both lines when the carts hold different products", async () => {
    const [accountProduct, guestProduct] = purchasableProducts(2, 2);

    await expectOk(await signIn());
    await add(accountProduct.id, 1);
    await signOut();

    await add(guestProduct.id, 2);
    await expectOk(await signIn());

    const cart = await expectOk<CartView>(await getCart());
    expect(cart.items).toHaveLength(2);
    expect(cart.summary.itemsCount).toBe(3);
  });

  it("leaves the account cart alone when the guest arrives empty-handed", async () => {
    const product = purchasableProduct(2);

    await expectOk(await signIn());
    await add(product.id, 2);
    await signOut();

    await expectOk(await signIn());
    const cart = await expectOk<CartView>(await getCart());

    expect(cart.summary.itemsCount).toBe(2);
  });

  it("survives logout and a second login without doubling or wiping", async () => {
    // Regression: logging out leaves the cart cookie pointing at the account
    // cart, so the next login merged that cart with itself — quantities were
    // doubled and then the cart was deleted, silently emptying the basket.
    const product = purchasableProduct(4);
    setStock(product.id, 4);

    await add(product.id, 2);
    await expectOk(await signIn());
    expect((await expectOk<CartView>(await getCart())).summary.itemsCount).toBe(2);

    await signOut();
    await expectOk(await signIn());

    const cart = await expectOk<CartView>(await getCart());
    expect(cart.summary.itemsCount).toBe(2);
    expect(cart.items).toHaveLength(1);
  });

  it("still holds after several logout/login cycles", async () => {
    const product = purchasableProduct(4);
    setStock(product.id, 4);
    await add(product.id, 2);

    for (let cycle = 0; cycle < 3; cycle += 1) {
      await expectOk(await signIn());
      await signOut();
    }

    await expectOk(await signIn());
    expect((await expectOk<CartView>(await getCart())).summary.itemsCount).toBe(2);
  });

  it("merges into a brand-new account on registration too", async () => {
    const product = purchasableProduct(2);
    await add(product.id, 2);

    await expectOk(
      await register(
        apiRequest("/api/auth/register", {
          method: "POST",
          body: {
            email: "nowy@example.com",
            password: "Test1234",
            firstName: "Jan",
            lastName: "Kowalski",
          },
        }),
      ),
      201,
    );

    expect((await expectOk<CartView>(await getCart())).summary.itemsCount).toBe(2);
  });
});

describe("badge cookie across sessions", () => {
  it("follows the merged cart on login", async () => {
    const product = purchasableProduct(2);
    await add(product.id, 2);

    await expectOk(await signIn());
    expect(cartCountCookie()).toBe(2);
  });

  it("drops to zero on logout, because the cart is no longer readable", async () => {
    const product = purchasableProduct(2);
    await add(product.id, 2);
    await expectOk(await signIn());

    await signOut();

    expect(cartCountCookie()).toBe(0);
    expect((await expectOk<CartView>(await getCart())).summary.itemsCount).toBe(0);
  });
});
