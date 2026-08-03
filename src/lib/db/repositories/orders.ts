import { randomUUID } from "node:crypto";

import type { Order, Paginated } from "@/src/lib/shop/types";
import { db } from "@/src/lib/db/store";

const clone = <T>(value: T): T => structuredClone(value);

/** Prefix of the human-facing order number (`RS-2026-000123`). */
export const ORDER_NUMBER_PREFIX = "RS";

export type CreateOrderData = Omit<Order, "id" | "number" | "createdAt">;

export const ordersRepo = {
  async create(data: CreateOrderData): Promise<Order> {
    db.orderSequence += 1;

    const order: Order = {
      ...clone(data),
      id: `o-${randomUUID()}`,
      number: formatOrderNumber(db.orderSequence),
      createdAt: new Date().toISOString(),
    };

    db.orders.set(order.id, order);
    return clone(order);
  },

  async findById(id: string): Promise<Order | null> {
    const order = db.orders.get(id);
    return order ? clone(order) : null;
  },

  async findByUserId(
    userId: string,
    page: number,
    perPage: number,
  ): Promise<Paginated<Order>> {
    const all = [...db.orders.values()]
      .filter((order) => order.userId === userId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    const total = all.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * perPage;

    return {
      items: all.slice(start, start + perPage).map(clone),
      page: safePage,
      perPage,
      total,
      totalPages,
    };
  },
};

function formatOrderNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `${ORDER_NUMBER_PREFIX}-${year}-${String(sequence).padStart(6, "0")}`;
}
