import { describe, expect, it, vi } from "vitest";

import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { GET as me } from "@/app/api/auth/me/route";
import { POST as refresh } from "@/app/api/auth/refresh/route";
import { POST as register } from "@/app/api/auth/register/route";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/src/lib/shop/constants";
import type { PublicUser } from "@/src/lib/shop/types";

import { DEMO_CREDENTIALS, apiRequest, expectError, expectOk } from "../setup/api";
import { testCookies } from "../setup/cookie-store";

const NEW_USER = {
  email: "nowy@example.com",
  password: "Test1234",
  firstName: "Jan",
  lastName: "Kowalski",
  phone: "600 100 200",
};

const signIn = (body: unknown = DEMO_CREDENTIALS, ip?: string) =>
  login(apiRequest("/api/auth/login", { method: "POST", body, ip }));

const signUp = (body: unknown = NEW_USER, ip?: string) =>
  register(apiRequest("/api/auth/register", { method: "POST", body, ip }));

describe("registration", () => {
  it("creates the account and opens a session", async () => {
    const data = await expectOk<{ user: PublicUser }>(await signUp(), 201);

    expect(data.user.email).toBe("nowy@example.com");
    expect(testCookies.has(ACCESS_COOKIE)).toBe(true);
    expect(testCookies.has(REFRESH_COOKIE)).toBe(true);
  });

  it("never returns the password hash", async () => {
    const data = await expectOk<{ user: PublicUser }>(await signUp(), 201);
    expect(JSON.stringify(data.user)).not.toContain("$2");
    expect("passwordHash" in data.user).toBe(false);
  });

  it("keeps the session cookies out of reach of JavaScript", async () => {
    await signUp();

    expect(testCookies.optionsFor(ACCESS_COOKIE)?.httpOnly).toBe(true);
    expect(testCookies.optionsFor(REFRESH_COOKIE)?.httpOnly).toBe(true);
  });

  it("rejects a duplicate address with a message on the email field", async () => {
    const error = await expectError(
      await signUp({ ...NEW_USER, email: DEMO_CREDENTIALS.email }),
      "EMAIL_TAKEN",
    );

    expect(error.fields?.email).toBeTruthy();
  });

  it("treats the address case-insensitively when checking for duplicates", async () => {
    const error = await expectError(
      await signUp({ ...NEW_USER, email: DEMO_CREDENTIALS.email.toUpperCase() }),
      "EMAIL_TAKEN",
    );

    expect(error.fields?.email).toBeTruthy();
  });

  it("reports validation problems per field", async () => {
    const error = await expectError(
      await signUp({ ...NEW_USER, email: "nie-email", password: "krotkie" }),
      "VALIDATION_ERROR",
    );

    expect(Object.keys(error.fields ?? {})).toEqual(
      expect.arrayContaining(["email", "password"]),
    );
  });
});

describe("login", () => {
  it("signs in the demo account", async () => {
    const data = await expectOk<{ user: PublicUser }>(await signIn());
    expect(data.user.email).toBe(DEMO_CREDENTIALS.email);
  });

  it("gives the same answer for a wrong password and an unknown address", async () => {
    // Otherwise the endpoint enumerates which addresses are registered.
    const wrongPassword = await expectError(
      await signIn({ ...DEMO_CREDENTIALS, password: "ZupelnieZle1" }),
      "INVALID_CREDENTIALS",
    );
    const unknownEmail = await expectError(
      await signIn({ email: "nikt@example.com", password: "ZupelnieZle1" }),
      "INVALID_CREDENTIALS",
    );

    expect(wrongPassword.message).toBe(unknownEmail.message);
    expect(wrongPassword.fields).toEqual(unknownEmail.fields);
  });

  it("does not open a session on a failed attempt", async () => {
    await signIn({ ...DEMO_CREDENTIALS, password: "ZupelnieZle1" });
    expect(testCookies.has(ACCESS_COOKIE)).toBe(false);
  });

  it("rate limits repeated attempts and says how long to wait", async () => {
    const ip = "203.0.113.7";
    let error;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const response = await signIn({ ...DEMO_CREDENTIALS, password: "ZupelnieZle1" }, ip);
      if (response.status === 429) {
        error = await expectError(response, "RATE_LIMITED");
        break;
      }
    }

    expect(error).toBeDefined();
    expect(typeof error!.params?.retryAfter).toBe("number");
    expect(error!.params!.retryAfter).toBeGreaterThan(0);
  });

  it("buckets the limiter per client address", async () => {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      await signIn({ ...DEMO_CREDENTIALS, password: "ZupelnieZle1" }, "203.0.113.8");
    }

    // A different visitor must not inherit the block.
    const other = await signIn(DEMO_CREDENTIALS, "203.0.113.9");
    expect(other.status).toBe(200);
  });
});

describe("session", () => {
  it("answers /me for a signed-in visitor and 401s otherwise", async () => {
    await expectError(await me(), "UNAUTHORIZED");

    await signIn();
    const data = await expectOk<{ user: PublicUser }>(await me());
    expect(data.user.email).toBe(DEMO_CREDENTIALS.email);
  });

  it("clears both cookies on logout", async () => {
    await signIn();
    await expectOk(await logout());

    expect(testCookies.has(ACCESS_COOKIE)).toBe(false);
    expect(testCookies.has(REFRESH_COOKIE)).toBe(false);
    await expectError(await me(), "UNAUTHORIZED");
  });

  it("mints a new access cookie from the refresh token", async () => {
    await signIn();
    const before = testCookies.get(ACCESS_COOKIE)?.value;

    testCookies.delete(ACCESS_COOKIE);

    // Same second would produce a byte-identical token — the payload is just
    // subject, type and issue time. Step forward so "re-issued" is observable.
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 2000);
    try {
      await expectOk(await refresh());
    } finally {
      vi.useRealTimers();
    }

    const after = testCookies.get(ACCESS_COOKIE)?.value;
    expect(after).toBeTruthy();
    expect(after).not.toBe(before);

    // And it is a working session, not just a different string.
    await expectOk(await me());
  });

  it("refuses to refresh without a refresh token", async () => {
    await signIn();
    testCookies.delete(REFRESH_COOKIE);

    await expectError(await refresh(), "UNAUTHORIZED");
  });

  it("keeps the session alive once the access token is gone but refresh remains", async () => {
    await signIn();
    testCookies.delete(ACCESS_COOKIE);

    // getSessionUser falls back to the refresh token, which is the session of record.
    const data = await expectOk<{ user: PublicUser }>(await me());
    expect(data.user.email).toBe(DEMO_CREDENTIALS.email);
  });
});
