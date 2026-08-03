import { describe, expect, it, vi } from "vitest";

import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "@/src/lib/auth/jwt";

describe("signing and verifying tokens", () => {
  it("round-trips an access token", async () => {
    const token = await signAccessToken("u-1");
    const payload = await verifyToken(token, "access");

    expect(payload?.userId).toBe("u-1");
    expect(payload?.type).toBe("access");
  });

  it("round-trips a refresh token", async () => {
    const token = await signRefreshToken("u-1");
    expect((await verifyToken(token, "refresh"))?.userId).toBe("u-1");
  });

  it("refuses to accept a refresh token where an access token is expected", async () => {
    // Otherwise a long-lived refresh token would work as a session everywhere.
    const refresh = await signRefreshToken("u-1");
    expect(await verifyToken(refresh, "access")).toBeNull();

    const access = await signAccessToken("u-1");
    expect(await verifyToken(access, "refresh")).toBeNull();
  });

  it("rejects a tampered signature", async () => {
    const token = await signAccessToken("u-1");
    const [header, payload] = token.split(".");
    const forged = `${header}.${payload}.${"a".repeat(43)}`;

    expect(await verifyToken(forged, "access")).toBeNull();
  });

  it("rejects garbage and missing tokens", async () => {
    expect(await verifyToken(undefined, "access")).toBeNull();
    expect(await verifyToken("", "access")).toBeNull();
    expect(await verifyToken("not-a-jwt", "access")).toBeNull();
  });

  it("rejects an expired token", async () => {
    const token = await signAccessToken("u-1");

    // Access tokens live 15 minutes; jump an hour ahead.
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 60 * 60 * 1000);
    try {
      expect(await verifyToken(token, "access")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("carries millisecond issue time, which second-resolution iat cannot", async () => {
    // `sessionsValidFrom` is compared against this: a password reset landing in
    // the same second as the token must still kill it.
    const before = Date.now();
    const payload = await verifyToken(await signAccessToken("u-1"), "access");
    const after = Date.now();

    expect(payload?.issuedAtMs).toBeGreaterThanOrEqual(before);
    expect(payload?.issuedAtMs).toBeLessThanOrEqual(after);
    expect(payload!.issuedAtMs % 1000).not.toBeNaN();
  });
});
