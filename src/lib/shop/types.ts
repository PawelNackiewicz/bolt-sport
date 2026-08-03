/**
 * Domain model for the shop. Every monetary value is an integer amount of
 * grosze (1 PLN = 100 gr) so that arithmetic never hits floating point.
 */

export type Currency = "PLN";

/**
 * `retail` products can be bought directly. `quote` products (rings, MMA cages)
 * are configured per order, so they carry no price and cannot enter the cart.
 */
export type PricingMode = "retail" | "quote";

export type ProductRating = {
  average: number;
  count: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  categorySlug: string;
  /** Grosze, or `null` for `pricingMode: "quote"`. */
  price: number | null;
  pricingMode: PricingMode;
  currency: Currency;
  images: string[];
  stock: number;
  sku: string;
  attributes: Record<string, string>;
  tags: string[];
  rating?: ProductRating;
  createdAt: string;
};

export type Category = {
  slug: string;
  /** Polish fallback label; the UI prefers the dictionary entry for this slug. */
  name: string;
  description: string;
  order: number;
};

export type CategoryWithCount = Category & { productCount: number };

/* -------------------------------------------------------------------------- */
/*  Users                                                                     */
/* -------------------------------------------------------------------------- */

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  createdAt: string;
  /**
   * Bumped on password change/reset. Refresh tokens issued before this moment
   * are rejected, which is how we invalidate every existing session.
   */
  sessionsValidFrom: string;
};

/** User shape safe to send over the wire — never includes `passwordHash`. */
export type PublicUser = Omit<User, "passwordHash" | "sessionsValidFrom">;

export type PasswordResetToken = {
  token: string;
  userId: string;
  expiresAt: string;
  usedAt: string | null;
};

/* -------------------------------------------------------------------------- */
/*  Cart                                                                      */
/* -------------------------------------------------------------------------- */

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  addedAt: string;
};

export type Cart = {
  id: string;
  /** Set once the cart belongs to an account; `null` for guest carts. */
  userId: string | null;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
};

/** A cart item joined with its product, as returned by the API. */
export type CartItemView = {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
  /** `product.price * quantity`, in grosze. */
  lineTotal: number;
};

export type CartSummary = {
  itemsCount: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  freeShippingThreshold: number;
  /** Grosze still missing for free shipping; `0` once it is reached. */
  freeShippingRemainder: number;
};

/**
 * Emitted when re-validating a cart against the catalog: a product disappeared
 * or the requested quantity no longer fits the stock level.
 */
export type CartWarning =
  | { code: "ITEM_REMOVED"; productName: string }
  | { code: "QUANTITY_REDUCED"; productName: string; quantity: number };

export type CartView = {
  /** `null` for a visitor who has no cart record yet — nothing was persisted. */
  id: string | null;
  items: CartItemView[];
  summary: CartSummary;
  warnings: CartWarning[];
};

/* -------------------------------------------------------------------------- */
/*  Orders                                                                    */
/* -------------------------------------------------------------------------- */

export type PaymentMethod = "card" | "transfer" | "cod";
export type OrderStatus = "pending" | "paid" | "cancelled";

export type Address = {
  street: string;
  postalCode: string;
  city: string;
  country: string;
};

export type OrderCustomer = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  company?: string;
};

/**
 * Positions are snapshots, not references: renaming or repricing a product must
 * never rewrite the history of an order that was already placed.
 */
export type OrderItem = {
  productId: string;
  name: string;
  slug: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  image: string | null;
};

export type Order = {
  id: string;
  /** Human-facing identifier, e.g. `RS-2026-000123`. */
  number: string;
  /** `null` for guest checkout. */
  userId: string | null;
  customer: OrderCustomer;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: Currency;
  notes?: string;
  createdAt: string;
};

/* -------------------------------------------------------------------------- */
/*  Quotes (B2B)                                                              */
/* -------------------------------------------------------------------------- */

export type QuoteType = "ring" | "klatka" | "wyposazenie-sali" | "hurt";

export type Quote = {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  productId?: string;
  message: string;
  type: QuoteType;
  createdAt: string;
};

/* -------------------------------------------------------------------------- */
/*  Catalog querying                                                          */
/* -------------------------------------------------------------------------- */

export type ProductSort = "price-asc" | "price-desc" | "newest" | "name-asc";

export type ProductQuery = {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  inStock?: boolean;
  sort: ProductSort;
  page: number;
  perPage: number;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};
