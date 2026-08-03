import { z } from "zod";

import type { Category, Product } from "@/src/lib/shop/types";

/**
 * The seed files are hand-maintained, so they are parsed rather than cast.
 * A typo surfaces as a clear error at boot instead of an odd `undefined`
 * halfway through a page render — and it gives TypeScript a real type for JSON
 * whose inferred shape is a union of 50-odd object literals.
 */
const productSeedSchema = z
  .object({
    id: z.string().min(1),
    slug: z.string().min(1),
    name: z.string().min(1),
    shortDescription: z.string().min(1),
    description: z.string().min(1),
    categorySlug: z.string().min(1),
    price: z.number().int().nonnegative().nullable(),
    pricingMode: z.enum(["retail", "quote"]),
    currency: z.literal("PLN"),
    images: z.array(z.string().min(1)).min(1),
    stock: z.number().int().nonnegative(),
    sku: z.string().min(1),
    attributes: z.record(z.string(), z.string()),
    tags: z.array(z.string()),
    rating: z
      .object({
        average: z.number().min(0).max(5),
        count: z.number().int().nonnegative(),
      })
      .optional(),
    createdAt: z.iso.datetime(),
  })
  // The core domain invariant: exactly one of "has a price" / "is quoted".
  .refine(
    (product) =>
      product.pricingMode === "quote" ? product.price === null : product.price !== null,
    { error: "pricingMode must match the presence of a price" },
  );

const categorySeedSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int(),
});

export function parseProductSeed(raw: unknown): Product[] {
  const products = z.array(productSeedSchema).parse(raw);

  const slugs = new Set<string>();
  const ids = new Set<string>();
  for (const product of products) {
    if (ids.has(product.id)) throw new Error(`Duplicate product id in seed: ${product.id}`);
    if (slugs.has(product.slug)) {
      throw new Error(`Duplicate product slug in seed: ${product.slug}`);
    }
    ids.add(product.id);
    slugs.add(product.slug);
  }

  return products;
}

export function parseCategorySeed(raw: unknown): Category[] {
  return z.array(categorySeedSchema).parse(raw);
}
