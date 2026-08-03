import { randomBytes } from "node:crypto";

import type { PasswordResetToken } from "@/src/lib/shop/types";
import { PASSWORD_RESET_TTL_SECONDS } from "@/src/lib/shop/constants";
import { db } from "@/src/lib/db/store";

const clone = <T>(value: T): T => structuredClone(value);

export const tokensRepo = {
  /** Issues a single-use reset token; any earlier token for the user is dropped. */
  async createPasswordReset(userId: string): Promise<PasswordResetToken> {
    for (const [key, existing] of db.resetTokens) {
      if (existing.userId === userId) db.resetTokens.delete(key);
    }

    const token: PasswordResetToken = {
      token: randomBytes(32).toString("hex"),
      userId,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_SECONDS * 1000).toISOString(),
      usedAt: null,
    };

    db.resetTokens.set(token.token, token);
    return clone(token);
  },

  async findPasswordReset(token: string): Promise<PasswordResetToken | null> {
    const found = db.resetTokens.get(token);
    return found ? clone(found) : null;
  },

  async markPasswordResetUsed(token: string): Promise<void> {
    const found = db.resetTokens.get(token);
    if (!found) return;
    found.usedAt = new Date().toISOString();
  },

  async deleteForUser(userId: string): Promise<void> {
    for (const [key, existing] of db.resetTokens) {
      if (existing.userId === userId) db.resetTokens.delete(key);
    }
  },
};
