import { randomUUID } from "node:crypto";

import type { Cart, CartItem } from "@/src/lib/shop/types";
import { db } from "@/src/lib/db/store";

const clone = <T>(value: T): T => structuredClone(value);

function touch(cart: Cart): void {
  cart.updatedAt = new Date().toISOString();
}

export const cartsRepo = {
  async findById(id: string): Promise<Cart | null> {
    const cart = db.carts.get(id);
    return cart ? clone(cart) : null;
  },

  async findByUserId(userId: string): Promise<Cart | null> {
    for (const cart of db.carts.values()) {
      if (cart.userId === userId) return clone(cart);
    }
    return null;
  },

  async create(userId: string | null, id?: string): Promise<Cart> {
    const now = new Date().toISOString();
    const cart: Cart = {
      id: id ?? randomUUID(),
      userId,
      items: [],
      createdAt: now,
      updatedAt: now,
    };

    db.carts.set(cart.id, cart);
    return clone(cart);
  },

  /** Adds a line, or tops up the quantity when the product is already there. */
  async addItem(cartId: string, productId: string, quantity: number, maxQuantity: number) {
    const cart = db.carts.get(cartId);
    if (!cart) return null;

    const existing = cart.items.find((item) => item.productId === productId);
    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, maxQuantity);
    } else {
      const item: CartItem = {
        id: randomUUID(),
        productId,
        quantity: Math.min(quantity, maxQuantity),
        addedAt: new Date().toISOString(),
      };
      cart.items.push(item);
    }

    touch(cart);
    return clone(cart);
  },

  async updateItemQuantity(cartId: string, itemId: string, quantity: number) {
    const cart = db.carts.get(cartId);
    if (!cart) return null;

    const item = cart.items.find((candidate) => candidate.id === itemId);
    if (!item) return null;

    if (quantity <= 0) {
      cart.items = cart.items.filter((candidate) => candidate.id !== itemId);
    } else {
      item.quantity = quantity;
    }

    touch(cart);
    return clone(cart);
  },

  async removeItem(cartId: string, itemId: string) {
    const cart = db.carts.get(cartId);
    if (!cart) return null;

    const before = cart.items.length;
    cart.items = cart.items.filter((item) => item.id !== itemId);
    if (cart.items.length === before) return null;

    touch(cart);
    return clone(cart);
  },

  async clear(cartId: string): Promise<Cart | null> {
    const cart = db.carts.get(cartId);
    if (!cart) return null;

    cart.items = [];
    touch(cart);
    return clone(cart);
  },

  /** Overwrites the whole item list — used by cart re-validation and merging. */
  async replaceItems(cartId: string, items: CartItem[]): Promise<Cart | null> {
    const cart = db.carts.get(cartId);
    if (!cart) return null;

    cart.items = clone(items);
    touch(cart);
    return clone(cart);
  },

  async assignToUser(cartId: string, userId: string): Promise<Cart | null> {
    const cart = db.carts.get(cartId);
    if (!cart) return null;

    cart.userId = userId;
    touch(cart);
    return clone(cart);
  },

  async delete(cartId: string): Promise<void> {
    db.carts.delete(cartId);
  },
};
