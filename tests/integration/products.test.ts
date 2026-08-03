import { describe, expect, it } from "vitest";

import { GET as listCategories } from "@/app/api/categories/route";
import { GET as listProducts } from "@/app/api/products/route";
import { GET as getProduct } from "@/app/api/products/[slug]/route";
import { DEFAULT_PER_PAGE } from "@/src/lib/shop/constants";
import type { CategoryWithCount, Product } from "@/src/lib/shop/types";

import { apiRequest, expectError, readJson, routeContext } from "../setup/api";
import { purchasableProduct, quoteProduct, setStock } from "../setup/fixtures";

async function query(search: string) {
  const response = await listProducts(apiRequest(`/api/products${search}`));
  const envelope = await readJson<Product[]>(response);

  expect(envelope.error, JSON.stringify(envelope.error)).toBeUndefined();
  return { items: envelope.data!, meta: envelope.meta! };
}

describe("listing", () => {
  it("paginates with the default page size", async () => {
    const { items, meta } = await query("");

    expect(items.length).toBeLessThanOrEqual(DEFAULT_PER_PAGE);
    expect(meta.page).toBe(1);
    expect(meta.perPage).toBe(DEFAULT_PER_PAGE);
    expect(meta.total).toBeGreaterThan(items.length);
  });

  it("returns a different slice on the second page", async () => {
    const first = await query("?page=1&perPage=5");
    const second = await query("?page=2&perPage=5");

    const firstIds = first.items.map((item) => item.id);
    expect(second.items.every((item) => !firstIds.includes(item.id))).toBe(true);
  });

  it("clamps a page number past the end instead of returning nothing", async () => {
    // A stale `?page=99` in a shared link should still show products.
    const { items, meta } = await query("?page=99&perPage=5");

    expect(items.length).toBeGreaterThan(0);
    expect(meta.page).toBe(meta.totalPages);
  });

  it("filters by category", async () => {
    const { items: all } = await query("?perPage=48");
    const category = all[0].categorySlug;

    const { items } = await query(`?category=${category}&perPage=48`);
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.categorySlug === category)).toBe(true);
  });

  it("searches name, description and SKU", async () => {
    const product = purchasableProduct();

    const bySku = await query(`?q=${encodeURIComponent(product.sku)}`);
    expect(bySku.items.map((item) => item.id)).toContain(product.id);

    const byName = await query(`?q=${encodeURIComponent(product.name.split(" ")[0])}`);
    expect(byName.items.length).toBeGreaterThan(0);
  });

  it("is case-insensitive when searching", async () => {
    const product = purchasableProduct();
    const term = product.sku.toLowerCase();

    const { items } = await query(`?q=${encodeURIComponent(term)}`);
    expect(items.map((item) => item.id)).toContain(product.id);
  });

  it("returns an empty page rather than an error for a hopeless search", async () => {
    const { items, meta } = await query("?q=zzzzzznieistnieje");

    expect(items).toEqual([]);
    expect(meta.total).toBe(0);
  });

  it("drops quote-priced products as soon as a price filter is applied", async () => {
    // They have no price to compare against, so keeping them would be noise.
    const { items } = await query("?minPrice=1&perPage=48");
    expect(items.every((item) => item.price !== null)).toBe(true);
  });

  it("respects the price range", async () => {
    const { items } = await query("?minPrice=10000&maxPrice=30000&perPage=48");

    expect(items.length).toBeGreaterThan(0);
    expect(items.every((item) => item.price! >= 10000 && item.price! <= 30000)).toBe(true);
  });

  it("filters to what is actually in stock", async () => {
    const product = purchasableProduct();
    setStock(product.id, 0);

    const { items } = await query("?inStock=true&perPage=48");
    expect(items.map((item) => item.id)).not.toContain(product.id);
    expect(items.every((item) => item.stock > 0)).toBe(true);
  });

  it("sorts by price, keeping quote-priced products last", async () => {
    const { items } = await query("?sort=price-asc&perPage=48");
    const priced = items.filter((item) => item.price !== null);
    const quoted = items.filter((item) => item.price === null);

    const sorted = [...priced].sort((a, b) => a.price! - b.price!);
    expect(priced.map((item) => item.id)).toEqual(sorted.map((item) => item.id));

    if (quoted.length > 0) {
      const firstQuotedIndex = items.findIndex((item) => item.price === null);
      const lastPricedIndex = items.map((item) => item.price !== null).lastIndexOf(true);
      expect(firstQuotedIndex).toBeGreaterThan(lastPricedIndex);
    }
  });

  it("sorts by name and by recency", async () => {
    const byName = await query("?sort=name-asc&perPage=48");
    const names = byName.items.map((item) => item.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "pl")));

    const byNewest = await query("?sort=newest&perPage=48");
    const dates = byNewest.items.map((item) => Date.parse(item.createdAt));
    expect(dates).toEqual([...dates].sort((a, b) => b - a));
  });

  it("rejects a sort value it does not know", async () => {
    await expectError(
      await listProducts(apiRequest("/api/products?sort=cheapest")),
      "VALIDATION_ERROR",
    );
  });
});

describe("single product", () => {
  it("returns the product with related items and its category", async () => {
    const product = purchasableProduct();
    const response = await getProduct(
      apiRequest(`/api/products/${product.slug}`),
      routeContext({ slug: product.slug }),
    );
    const envelope = await readJson<{
      product: Product;
      related: Product[];
      category: { slug: string } | null;
    }>(response);

    expect(envelope.data!.product.id).toBe(product.id);
    expect(envelope.data!.category?.slug).toBe(product.categorySlug);
    expect(
      envelope.data!.related.every(
        (item) => item.id !== product.id && item.categorySlug === product.categorySlug,
      ),
    ).toBe(true);
  });

  it("404s on an unknown slug", async () => {
    await expectError(
      await getProduct(apiRequest("/api/products/nie-ma"), routeContext({ slug: "nie-ma" })),
      "NOT_FOUND",
    );
  });

  it("serves quote-priced products with a null price", async () => {
    const product = quoteProduct();
    const response = await getProduct(
      apiRequest(`/api/products/${product.slug}`),
      routeContext({ slug: product.slug }),
    );
    const envelope = await readJson<{ product: Product }>(response);

    expect(envelope.data!.product.price).toBeNull();
    expect(envelope.data!.product.pricingMode).toBe("quote");
  });
});

describe("categories", () => {
  it("counts the products in each category", async () => {
    const envelope = await readJson<CategoryWithCount[]>(await listCategories());
    const categories = envelope.data!;

    expect(categories.length).toBeGreaterThan(0);
    expect(categories.every((category) => category.productCount >= 0)).toBe(true);

    const { meta } = await query("?perPage=48");
    const summed = categories.reduce((total, item) => total + item.productCount, 0);
    expect(summed).toBe(meta.total);
  });
});
