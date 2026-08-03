import { db } from "@/src/lib/db/store";
import type { Product } from "@/src/lib/shop/types";

/**
 * Seed-derived fixtures. Tests reach into the store directly to arrange state —
 * that is the point of a repository-shaped mock layer.
 */

/** First purchasable product with at least `minStock` pieces on hand. */
export function purchasableProduct(minStock = 1): Product {
  const product = [...db.products.values()].find(
    (candidate) =>
      candidate.pricingMode === "retail" &&
      candidate.price !== null &&
      candidate.stock >= minStock,
  );

  if (!product) throw new Error(`No purchasable product with stock >= ${minStock} in the seed`);
  return structuredClone(product);
}

/** Two distinct purchasable products, for multi-line cart cases. */
export function purchasableProducts(count: number, minStock = 1): Product[] {
  const products = [...db.products.values()]
    .filter(
      (candidate) =>
        candidate.pricingMode === "retail" &&
        candidate.price !== null &&
        candidate.stock >= minStock,
    )
    .slice(0, count);

  if (products.length < count) throw new Error(`Seed has fewer than ${count} such products`);
  return products.map((product) => structuredClone(product));
}

/** A product the shop quotes individually — never allowed into the cart. */
export function quoteProduct(): Product {
  const product = [...db.products.values()].find(
    (candidate) => candidate.pricingMode === "quote",
  );

  if (!product) throw new Error("No quote-priced product in the seed");
  return structuredClone(product);
}

/** Moves stock behind the shopper's back, the way a concurrent order would. */
export function setStock(productId: string, stock: number): void {
  const product = db.products.get(productId);
  if (!product) throw new Error(`Unknown product ${productId}`);
  product.stock = stock;
}

/** Removes a product from the catalog while it sits in someone's cart. */
export function deleteProduct(productId: string): void {
  db.products.delete(productId);
}

export function stockOf(productId: string): number {
  return db.products.get(productId)?.stock ?? 0;
}
