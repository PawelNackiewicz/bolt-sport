import { describe, expect, it } from "vitest";

import { calculateSummary, isPurchasable } from "@/src/lib/shop/cart-service";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT_RATE,
} from "@/src/lib/shop/constants";
import type { CartItemView, Product } from "@/src/lib/shop/types";

const product = (overrides: Partial<Product> = {}): Product => ({
  id: "p-1",
  slug: "p-1",
  sku: "SKU-1",
  name: "Produkt",
  shortDescription: "",
  description: "",
  categorySlug: "rekawice",
  price: 10000,
  pricingMode: "retail",
  currency: "PLN",
  stock: 10,
  images: ["/products/x.svg"],
  tags: [],
  attributes: {},
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const line = (lineTotal: number, quantity = 1): CartItemView => ({
  id: `i-${lineTotal}-${quantity}`,
  productId: "p-1",
  quantity,
  product: product(),
  lineTotal,
});

describe("calculateSummary", () => {
  it("never charges shipping on an empty cart", () => {
    const summary = calculateSummary([]);

    expect(summary.itemsCount).toBe(0);
    expect(summary.subtotal).toBe(0);
    expect(summary.shippingCost).toBe(0);
    expect(summary.total).toBe(0);
  });

  it("charges the flat rate below the free-shipping threshold", () => {
    const summary = calculateSummary([line(FREE_SHIPPING_THRESHOLD - 1)]);

    expect(summary.shippingCost).toBe(SHIPPING_FLAT_RATE);
    expect(summary.total).toBe(FREE_SHIPPING_THRESHOLD - 1 + SHIPPING_FLAT_RATE);
  });

  it("ships free exactly at the threshold, not only above it", () => {
    const summary = calculateSummary([line(FREE_SHIPPING_THRESHOLD)]);

    expect(summary.shippingCost).toBe(0);
    expect(summary.total).toBe(FREE_SHIPPING_THRESHOLD);
    expect(summary.freeShippingRemainder).toBe(0);
  });

  it("reports how much is still missing for free shipping", () => {
    const summary = calculateSummary([line(FREE_SHIPPING_THRESHOLD - 1500)]);

    expect(summary.freeShippingRemainder).toBe(1500);
    expect(summary.freeShippingThreshold).toBe(FREE_SHIPPING_THRESHOLD);
  });

  it("never reports a negative remainder once the threshold is passed", () => {
    const summary = calculateSummary([line(FREE_SHIPPING_THRESHOLD * 2)]);
    expect(summary.freeShippingRemainder).toBe(0);
  });

  it("counts pieces, not lines", () => {
    const summary = calculateSummary([line(1000, 3), line(2000, 4)]);

    expect(summary.itemsCount).toBe(7);
    expect(summary.subtotal).toBe(3000);
  });
});

describe("isPurchasable", () => {
  it("accepts retail products that carry a price", () => {
    expect(isPurchasable(product({ pricingMode: "retail", price: 1000 }))).toBe(true);
  });

  it("rejects quote-priced products and priceless retail rows", () => {
    expect(isPurchasable(product({ pricingMode: "quote", price: null }))).toBe(false);
    expect(isPurchasable(product({ pricingMode: "retail", price: null }))).toBe(false);
  });
});
