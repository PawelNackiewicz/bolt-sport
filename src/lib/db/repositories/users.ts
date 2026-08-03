import { randomUUID } from "node:crypto";

import type { PublicUser, User } from "@/src/lib/shop/types";
import { db } from "@/src/lib/db/store";

const clone = <T>(value: T): T => structuredClone(value);

export type CreateUserInput = {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

/** Strips the password hash and session bookkeeping before anything is serialised. */
export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    createdAt: user.createdAt,
  };
}

export const usersRepo = {
  async findById(id: string): Promise<User | null> {
    const user = db.users.get(id);
    return user ? clone(user) : null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const needle = email.trim().toLowerCase();
    for (const user of db.users.values()) {
      if (user.email === needle) return clone(user);
    }
    return null;
  },

  async create(input: CreateUserInput): Promise<User> {
    const now = new Date().toISOString();
    const user: User = {
      id: `u-${randomUUID()}`,
      email: input.email.trim().toLowerCase(),
      passwordHash: input.passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone === "" ? undefined : input.phone,
      createdAt: now,
      sessionsValidFrom: now,
    };

    db.users.set(user.id, user);
    return clone(user);
  },

  /**
   * Replaces the password hash and moves `sessionsValidFrom` forward, which
   * invalidates every refresh token issued before this moment.
   */
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const user = db.users.get(id);
    if (!user) return;

    user.passwordHash = passwordHash;
    user.sessionsValidFrom = new Date().toISOString();
  },
};
