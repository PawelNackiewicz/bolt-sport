import { describe, expect, it } from "vitest";

import { POST as login } from "@/app/api/auth/login/route";
import { GET as getCart } from "@/app/api/cart/route";
import { POST as addItem } from "@/app/api/cart/items/route";
import { GET as listOrders, POST as createOrder } from "@/app/api/orders/route";
import { GET as getOrder } from "@/app/api/orders/[id]/route";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT_RATE } from "@/src/lib/shop/constants";
import type { CartView, Order } from "@/src/lib/shop/types";

import {
  CHECKOUT_PAYLOAD,
  DEMO_CREDENTIALS,
  apiRequest,
  cartCountCookie,
  expectError,
  expectOk,
  routeContext,
} from "../setup/api";
import { purchasableProduct, setStock, stockOf } from "../setup/fixtures";

const add = (productId: string, quantity: number) =>
  addItem(apiRequest("/api/cart/items", { method: "POST", body: { productId, quantity } }));

const checkout = (body: unknown = CHECKOUT_PAYLOAD) =>
  createOrder(apiRequest("/api/orders", { method: "POST", body }));

const signIn = () =>
  login(apiRequest("/api/auth/login", { method: "POST", body: DEMO_CREDENTIALS }));

describe("placing an order", () => {
  it("refuses an empty cart", async () => {
    await expectError(await checkout(), "CART_EMPTY");
  });

  it("creates a guest order with no owner", async () => {
    const product = purchasableProduct(2);
    await add(product.id, 2);

    const { order } = await expectOk<{ order: Order }>(await checkout(), 201);

    expect(order.userId).toBeNull();
    expect(order.number).toMatch(/^RS-\d{4}-\d{6}$/);
    expect(order.items).toHaveLength(1);
    expect(order.items[0].quantity).toBe(2);
  });

  it("attaches the order to the signed-in account", async () => {
    const product = purchasableProduct(1);
    await expectOk(await signIn());
    await add(product.id, 1);

    const { order } = await expectOk<{ order: Order }>(await checkout(), 201);
    expect(order.userId).toBe("u-demo-0001");
  });

  it("snapshots the line so later catalog edits cannot rewrite history", async () => {
    const product = purchasableProduct(1);
    await add(product.id, 1);

    const { order } = await expectOk<{ order: Order }>(await checkout(), 201);

    expect(order.items[0]).toMatchObject({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      unitPrice: product.price,
      lineTotal: product.price,
    });
  });

  it("charges shipping by the same rule as the cart", async () => {
    const product = purchasableProduct(1);
    setStock(product.id, 50);

    await add(product.id, 1);
    const cart = await expectOk<CartView>(await getCart());
    const { order } = await expectOk<{ order: Order }>(await checkout(), 201);

    expect(order.subtotal).toBe(cart.summary.subtotal);
    expect(order.shippingCost).toBe(cart.summary.shippingCost);
    expect(order.total).toBe(order.subtotal + order.shippingCost);
    expect(order.shippingCost).toBe(
      order.subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE,
    );
  });

  it("decrements stock and clears the cart", async () => {
    const product = purchasableProduct(3);
    setStock(product.id, 3);
    await add(product.id, 2);

    await expectOk(await checkout(), 201);

    expect(stockOf(product.id)).toBe(1);
    expect((await expectOk<CartView>(await getCart())).items).toEqual([]);
    expect(cartCountCookie()).toBe(0);
  });

  it("settles a card payment immediately and leaves the others pending", async () => {
    const product = purchasableProduct(3);
    setStock(product.id, 30);

    await add(product.id, 1);
    const card = await expectOk<{ order: Order }>(await checkout(), 201);
    expect(card.order.status).toBe("paid");

    await add(product.id, 1);
    const transfer = await expectOk<{ order: Order }>(
      await checkout({ ...CHECKOUT_PAYLOAD, paymentMethod: "transfer" }),
      201,
    );
    expect(transfer.order.status).toBe("pending");

    await add(product.id, 1);
    const cod = await expectOk<{ order: Order }>(
      await checkout({ ...CHECKOUT_PAYLOAD, paymentMethod: "cod" }),
      201,
    );
    expect(cod.order.status).toBe("pending");
  });

  it("bills to the shipping address unless a separate one is given", async () => {
    const product = purchasableProduct(2);
    setStock(product.id, 20);

    await add(product.id, 1);
    const same = await expectOk<{ order: Order }>(await checkout(), 201);
    expect(same.order.billingAddress).toEqual(same.order.shippingAddress);

    const billingAddress = {
      street: "Fakturowa 1",
      postalCode: "00-001",
      city: "Warszawa",
      country: "Polska",
    };
    await add(product.id, 1);
    const separate = await expectOk<{ order: Order }>(
      await checkout({ ...CHECKOUT_PAYLOAD, billingAddress }),
      201,
    );
    expect(separate.order.billingAddress).toEqual(billingAddress);
  });

  it("validates the customer and the address", async () => {
    const product = purchasableProduct(1);
    await add(product.id, 1);

    const error = await expectError(
      await checkout({
        ...CHECKOUT_PAYLOAD,
        customer: { ...CHECKOUT_PAYLOAD.customer, email: "nie-email", phone: "1" },
        shippingAddress: { ...CHECKOUT_PAYLOAD.shippingAddress, postalCode: "bad" },
      }),
      "VALIDATION_ERROR",
    );

    expect(Object.keys(error.fields ?? {})).toEqual(
      expect.arrayContaining([
        "customer.email",
        "customer.phone",
        "shippingAddress.postalCode",
      ]),
    );
  });

  it("refuses to charge when availability moved under the customer", async () => {
    const product = purchasableProduct(5);
    setStock(product.id, 5);
    await add(product.id, 5);

    // Someone else buys the shelf while the checkout form is open.
    setStock(product.id, 1);

    const error = await expectError(await checkout(), "CART_CHANGED");

    // Its own code, so the UI can explain what happened in the user's language.
    expect(error.code).toBe("CART_CHANGED");
    expect(stockOf(product.id)).toBe(1);
  });

  it("numbers orders sequentially", async () => {
    const product = purchasableProduct(2);
    setStock(product.id, 20);

    await add(product.id, 1);
    const first = await expectOk<{ order: Order }>(await checkout(), 201);
    await add(product.id, 1);
    const second = await expectOk<{ order: Order }>(await checkout(), 201);

    const sequence = (order: Order) => Number(order.number.split("-")[2]);
    expect(sequence(second.order)).toBe(sequence(first.order) + 1);
  });
});

describe("order history", () => {
  it("requires a session", async () => {
    await expectError(await listOrders(apiRequest("/api/orders")), "UNAUTHORIZED");
  });

  it("lists the seeded demo orders newest first, with pagination meta", async () => {
    await expectOk(await signIn());

    const response = await listOrders(apiRequest("/api/orders?page=1&perPage=2"));
    const body = (await response.clone().json()) as { data: Order[]; meta: { total: number } };

    expect(body.data).toHaveLength(2);
    expect(body.meta.total).toBe(3);
    expect(Date.parse(body.data[0].createdAt)).toBeGreaterThan(
      Date.parse(body.data[1].createdAt),
    );
  });

  it("shows a freshly placed order in the account history", async () => {
    const product = purchasableProduct(1);
    await expectOk(await signIn());
    await add(product.id, 1);
    const { order } = await expectOk<{ order: Order }>(await checkout(), 201);

    const response = await listOrders(apiRequest("/api/orders"));
    const body = (await response.json()) as { data: Order[] };

    expect(body.data.map((entry) => entry.id)).toContain(order.id);
  });
});

describe("reading a single order", () => {
  it("lets a guest reach their order by its unguessable id", async () => {
    const product = purchasableProduct(1);
    await add(product.id, 1);
    const { order } = await expectOk<{ order: Order }>(await checkout(), 201);

    const data = await expectOk<{ order: Order }>(
      await getOrder(apiRequest(`/api/orders/${order.id}`), routeContext({ id: order.id })),
    );
    expect(data.order.id).toBe(order.id);
  });

  it("keeps an account order private", async () => {
    const product = purchasableProduct(1);
    await expectOk(await signIn());
    await add(product.id, 1);
    const { order } = await expectOk<{ order: Order }>(await checkout(), 201);

    // Sign out by dropping the cookies, then try again.
    const { testCookies } = await import("../setup/cookie-store");
    testCookies.clear();

    await expectError(
      await getOrder(apiRequest(`/api/orders/${order.id}`), routeContext({ id: order.id })),
      "UNAUTHORIZED",
    );
  });

  it("404s on an unknown id", async () => {
    await expectError(
      await getOrder(apiRequest("/api/orders/o-nope"), routeContext({ id: "o-nope" })),
      "NOT_FOUND",
    );
  });
});
