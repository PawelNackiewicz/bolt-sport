import { hashSync } from "bcryptjs";

import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT_RATE,
} from "@/src/lib/shop/constants";
import type {
  Cart,
  Category,
  Order,
  PasswordResetToken,
  Product,
  Quote,
  User,
} from "@/src/lib/shop/types";

import { parseCategorySeed, parseProductSeed } from "./seed-schema";
import categoriesSeed from "./seed/categories.json";
import productsSeed from "./seed/products.json";

/**
 * MOCK DATA LAYER.
 *
 * Everything lives in process memory: restarting the server resets users,
 * carts, orders, quotes and password reset tokens back to the seed state.
 * Products and categories are re-read from the JSON seed on every boot.
 *
 * The shape is deliberately repository-shaped (maps keyed by id) so that
 * swapping this file for Prisma touches only `./repositories/*`.
 */
export type Db = {
  products: Map<string, Product>;
  categories: Map<string, Category>;
  users: Map<string, User>;
  carts: Map<string, Cart>;
  orders: Map<string, Order>;
  resetTokens: Map<string, PasswordResetToken>;
  quotes: Map<string, Quote>;
  /** Incrementing counter behind the `RS-YYYY-NNNNNN` order numbers. */
  orderSequence: number;
};

/** bcrypt cost factor for password hashes. */
export const BCRYPT_ROUNDS = 10;

/* -------------------------------------------------------------------------- */
/*  Demo account and demo orders (mock)                                       */
/* -------------------------------------------------------------------------- */

export const DEMO_USER_EMAIL = "test@bolt-sport.pl";
export const DEMO_USER_PASSWORD = "Test1234!";

const DEMO_USER_ID = "u-demo-0001";

/** Hashing dominates the cost of seeding, so it happens once per process. */
const DEMO_PASSWORD_HASH = hashSync(DEMO_USER_PASSWORD, BCRYPT_ROUNDS);

function createDemoUser(): User {
  return {
    id: DEMO_USER_ID,
    email: DEMO_USER_EMAIL,
    passwordHash: DEMO_PASSWORD_HASH,
    firstName: "Jan",
    lastName: "Testowy",
    phone: "600 100 200",
    createdAt: "2026-01-08T10:15:00.000Z",
    sessionsValidFrom: "2026-01-08T10:15:00.000Z",
  };
}

const DEMO_ADDRESS = {
  street: "Sportowa 12/3",
  postalCode: "45-064",
  city: "Opole",
  country: "Polska",
};

const DEMO_CUSTOMER = {
  email: DEMO_USER_EMAIL,
  firstName: "Jan",
  lastName: "Testowy",
  phone: "600 100 200",
};

/**
 * Three placed orders so that the order history has something to render on a
 * fresh boot. Positions are snapshots, exactly like a real checkout writes them.
 */
function createDemoOrders(products: Map<string, Product>): Order[] {
  const line = (productId: string, quantity: number) => {
    const product = products.get(productId);
    if (!product || product.price === null) {
      throw new Error(`Demo order references a non-purchasable product: ${productId}`);
    }
    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      unitPrice: product.price,
      quantity,
      lineTotal: product.price * quantity,
      image: product.images[0] ?? null,
    };
  };

  const drafts: Array<{
    id: string;
    number: string;
    items: ReturnType<typeof line>[];
    paymentMethod: Order["paymentMethod"];
    status: Order["status"];
    createdAt: string;
  }> = [
    {
      id: "o-demo-0001",
      number: "RS-2026-000001",
      items: [line("p-001", 1), line("p-043", 2)],
      paymentMethod: "card",
      status: "paid",
      createdAt: "2026-02-14T12:05:00.000Z",
    },
    {
      id: "o-demo-0002",
      number: "RS-2026-000002",
      items: [line("p-030", 8)],
      paymentMethod: "transfer",
      status: "paid",
      createdAt: "2026-04-02T09:41:00.000Z",
    },
    {
      id: "o-demo-0003",
      number: "RS-2026-000003",
      items: [line("p-010", 1), line("p-017", 1), line("p-023", 1)],
      paymentMethod: "cod",
      status: "pending",
      createdAt: "2026-06-19T17:22:00.000Z",
    },
  ];

  return drafts.map((draft) => {
    const subtotal = draft.items.reduce((sum, item) => sum + item.lineTotal, 0);
    // Same rule as a live checkout, so demo history does not drift when the
    // shipping constants change.
    const shippingCost =
      subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;

    return {
      id: draft.id,
      number: draft.number,
      userId: DEMO_USER_ID,
      customer: DEMO_CUSTOMER,
      shippingAddress: DEMO_ADDRESS,
      billingAddress: DEMO_ADDRESS,
      paymentMethod: draft.paymentMethod,
      status: draft.status,
      items: draft.items,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      currency: "PLN" as const,
      createdAt: draft.createdAt,
    };
  });
}

/* -------------------------------------------------------------------------- */
/*  Store construction                                                        */
/* -------------------------------------------------------------------------- */

function createDb(): Db {
  const products = new Map<string, Product>(
    parseProductSeed(productsSeed).map((product) => [product.id, product]),
  );
  const categories = new Map<string, Category>(
    parseCategorySeed(categoriesSeed).map((category) => [category.slug, category]),
  );

  const users = new Map<string, User>();
  const demoUser = createDemoUser();
  users.set(demoUser.id, demoUser);

  const orders = new Map<string, Order>();
  const demoOrders = createDemoOrders(products);
  for (const order of demoOrders) orders.set(order.id, order);

  return {
    products,
    categories,
    users,
    carts: new Map(),
    orders,
    resetTokens: new Map(),
    quotes: new Map(),
    orderSequence: demoOrders.length,
  };
}

/**
 * Survives Turbopack hot reloads in dev — without the global, every edited file
 * would hand out a fresh store and log the user out mid-session.
 */
const globalForDb = globalThis as unknown as { __boltSportDb?: Db };

export const db: Db = (globalForDb.__boltSportDb ??= createDb());

/**
 * Restores the seeded state. Contents are replaced in place so every module
 * that already imported `db` keeps pointing at the live store.
 *
 * Exists for the test suite, which needs each case to start from a known
 * catalog, the demo account and an empty set of carts, orders and tokens.
 */
export function resetDb(): void {
  Object.assign(db, createDb());
}
