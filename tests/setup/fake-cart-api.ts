import { vi } from "vitest";

import { calculateSummary } from "@/src/lib/shop/cart-service";
import type { CartItemView, CartView, Product } from "@/src/lib/shop/types";

export type RecordedCall = {
  url: string;
  method: string;
  body: Record<string, unknown> | undefined;
};

export const FAKE_PRODUCT: Product = {
  id: "p-1",
  slug: "rekawice-bokserskie",
  sku: "SKU-1",
  name: "Rękawice bokserskie",
  shortDescription: "Skóra naturalna",
  description: "Opis",
  categorySlug: "rekawice",
  price: 34900,
  pricingMode: "retail",
  currency: "PLN",
  stock: 10,
  images: ["/products/rekawice-1.svg"],
  tags: [],
  attributes: {},
  createdAt: "2026-01-01T00:00:00.000Z",
};

/**
 * Stands in for `/api/cart*`, with the same semantics the route handlers have:
 * PATCH carries an absolute quantity, POST tops a line up, and every response
 * is the whole cart. Responses can be held open so a test can issue a second
 * request while the first is still on the wire.
 */
export function createFakeCartApi(options: { failNext?: boolean } = {}) {
  const calls: RecordedCall[] = [];
  let items: CartItemView[] = [];
  let gate: Promise<void> | null = null;
  let openGate: (() => void) | null = null;
  let failNext = options.failNext ?? false;

  const view = (): CartView => ({
    id: "cart-1",
    items: [...items],
    summary: calculateSummary(items),
    warnings: [],
  });

  const respond = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { "content-type": "application/json" },
    });

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = (init?.method ?? "GET").toUpperCase();
    const body = init?.body ? JSON.parse(String(init.body)) : undefined;

    calls.push({ url, method, body });

    // Let the caller decide when this request comes back.
    if (gate) await gate;

    if (failNext) {
      failNext = false;
      return respond(
        { error: { code: "INSUFFICIENT_STOCK", message: "brak", params: { available: 1 } } },
        409,
      );
    }

    if (url.endsWith("/api/cart") && method === "GET") return respond({ data: view() });
    if (url.endsWith("/api/cart") && method === "DELETE") {
      items = [];
      return respond({ data: view() });
    }

    if (url.endsWith("/api/cart/items") && method === "POST") {
      const existing = items.find((item) => item.productId === body.productId);
      if (existing) existing.quantity += body.quantity;
      else {
        items.push({
          id: `item-${items.length + 1}`,
          productId: body.productId,
          quantity: body.quantity,
          product: FAKE_PRODUCT,
          lineTotal: 0,
        });
      }
      recalculate();
      return respond({ data: view() }, 201);
    }

    const itemId = url.split("/api/cart/items/")[1];

    if (method === "PATCH") {
      const item = items.find((candidate) => candidate.id === itemId);
      if (item) item.quantity = body.quantity;
      items = items.filter((candidate) => candidate.quantity > 0);
      recalculate();
      return respond({ data: view() });
    }

    if (method === "DELETE") {
      items = items.filter((candidate) => candidate.id !== itemId);
      return respond({ data: view() });
    }

    return respond({ error: { code: "NOT_FOUND", message: "?" } }, 404);
  });

  function recalculate() {
    for (const item of items) item.lineTotal = FAKE_PRODUCT.price! * item.quantity;
  }

  return {
    fetchMock,
    calls,
    /** Requests issued from now on hang until `release()` is called. */
    hold() {
      gate = new Promise<void>((resolve) => {
        openGate = resolve;
      });
    },
    release() {
      openGate?.();
      gate = null;
      openGate = null;
    },
    /** Makes the next request answer with a 409, as an out-of-stock add would. */
    failOnce() {
      failNext = true;
    },
    seed(quantity: number) {
      items = [
        {
          id: "item-1",
          productId: FAKE_PRODUCT.id,
          quantity,
          product: FAKE_PRODUCT,
          lineTotal: FAKE_PRODUCT.price! * quantity,
        },
      ];
    },
    bodies(method: string) {
      return calls.filter((call) => call.method === method).map((call) => call.body);
    },
  };
}
