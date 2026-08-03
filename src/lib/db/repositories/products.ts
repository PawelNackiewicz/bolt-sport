import type {
  CategoryWithCount,
  Paginated,
  Product,
  ProductQuery,
} from "@/src/lib/shop/types";
import { db } from "@/src/lib/db/store";

/**
 * Reads hand out clones so a caller mutating the returned object cannot
 * corrupt the in-memory store. With a real database this is free.
 */
const clone = <T>(value: T): T => structuredClone(value);

function matches(product: Product, query: ProductQuery): boolean {
  if (query.category && product.categorySlug !== query.category) return false;

  if (query.q) {
    const needle = query.q.toLowerCase();
    const haystack = `${product.name} ${product.shortDescription} ${product.sku}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }

  // A price filter is meaningless for quote-priced products, so they drop out
  // as soon as the user narrows the range.
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    if (product.price === null) return false;
    if (query.minPrice !== undefined && product.price < query.minPrice) return false;
    if (query.maxPrice !== undefined && product.price > query.maxPrice) return false;
  }

  if (query.tags?.length && !query.tags.some((tag) => product.tags.includes(tag))) {
    return false;
  }

  if (query.inStock && product.stock <= 0) return false;

  return true;
}

/** Quote-priced products sort last in price order — they have no price to compare. */
function compare(a: Product, b: Product, sort: ProductQuery["sort"]): number {
  switch (sort) {
    case "price-asc":
    case "price-desc": {
      if (a.price === null && b.price === null) return a.name.localeCompare(b.name, "pl");
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return sort === "price-asc" ? a.price - b.price : b.price - a.price;
    }
    case "name-asc":
      return a.name.localeCompare(b.name, "pl");
    case "newest":
    default:
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  }
}

export const productsRepo = {
  async findMany(query: ProductQuery): Promise<Paginated<Product>> {
    const filtered = [...db.products.values()]
      .filter((product) => matches(product, query))
      .sort((a, b) => compare(a, b, query.sort));

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / query.perPage));
    // Clamp instead of returning an empty page: a stale `?page=9` in a shared
    // link should still show products.
    const page = Math.min(query.page, totalPages);
    const start = (page - 1) * query.perPage;

    return {
      items: filtered.slice(start, start + query.perPage).map(clone),
      page,
      perPage: query.perPage,
      total,
      totalPages,
    };
  },

  async findById(id: string): Promise<Product | null> {
    const product = db.products.get(id);
    return product ? clone(product) : null;
  },

  async findBySlug(slug: string): Promise<Product | null> {
    for (const product of db.products.values()) {
      if (product.slug === slug) return clone(product);
    }
    return null;
  },

  async findManyByIds(ids: string[]): Promise<Product[]> {
    return ids
      .map((id) => db.products.get(id))
      .filter((product): product is Product => product !== undefined)
      .map(clone);
  },

  /** Products from the same category, excluding the one being viewed. */
  async findRelated(product: Product, limit = 4): Promise<Product[]> {
    return [...db.products.values()]
      .filter(
        (candidate) =>
          candidate.categorySlug === product.categorySlug && candidate.id !== product.id,
      )
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, limit)
      .map(clone);
  },

  async listCategories(): Promise<CategoryWithCount[]> {
    const counts = new Map<string, number>();
    for (const product of db.products.values()) {
      counts.set(product.categorySlug, (counts.get(product.categorySlug) ?? 0) + 1);
    }

    return [...db.categories.values()]
      .sort((a, b) => a.order - b.order)
      .map((category) => ({
        ...clone(category),
        productCount: counts.get(category.slug) ?? 0,
      }));
  },

  async findCategoryBySlug(slug: string) {
    const category = db.categories.get(slug);
    return category ? clone(category) : null;
  },

  /** Highest retail price in the catalog — drives the price filter bounds. */
  async maxRetailPrice(): Promise<number> {
    let max = 0;
    for (const product of db.products.values()) {
      if (product.price !== null && product.price > max) max = product.price;
    }
    return max;
  },

  /** All tags actually present in the catalog, alphabetically. */
  async listTags(): Promise<string[]> {
    const tags = new Set<string>();
    for (const product of db.products.values()) {
      for (const tag of product.tags) tags.add(tag);
    }
    return [...tags].sort((a, b) => a.localeCompare(b, "pl"));
  },

  /** Applied during checkout, after stock has already been validated. */
  async decrementStock(id: string, quantity: number): Promise<void> {
    const product = db.products.get(id);
    if (!product) return;
    product.stock = Math.max(0, product.stock - quantity);
  },
};
