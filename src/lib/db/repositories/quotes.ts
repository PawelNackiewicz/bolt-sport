import { randomUUID } from "node:crypto";

import type { Quote } from "@/src/lib/shop/types";
import { db } from "@/src/lib/db/store";

const clone = <T>(value: T): T => structuredClone(value);

export type CreateQuoteData = Omit<Quote, "id" | "createdAt">;

export const quotesRepo = {
  async create(data: CreateQuoteData): Promise<Quote> {
    const quote: Quote = {
      ...clone(data),
      id: `q-${randomUUID()}`,
      createdAt: new Date().toISOString(),
    };

    db.quotes.set(quote.id, quote);
    return clone(quote);
  },

  async findAll(): Promise<Quote[]> {
    return [...db.quotes.values()]
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .map(clone);
  },
};
