import { describe, expect, it, vi } from "vitest";

import { POST as login } from "@/app/api/auth/login/route";
import { GET as me } from "@/app/api/auth/me/route";
import { POST as changePassword } from "@/app/api/auth/password/change/route";
import { POST as forgotPassword } from "@/app/api/auth/password/forgot/route";
import { POST as resetPassword } from "@/app/api/auth/password/reset/route";
import { PASSWORD_RESET_TTL_SECONDS } from "@/src/lib/shop/constants";

import { DEMO_CREDENTIALS, apiRequest, expectError, expectOk } from "../setup/api";

const NEW_PASSWORD = "NoweHaslo123";

const signIn = (password = DEMO_CREDENTIALS.password) =>
  login(
    apiRequest("/api/auth/login", {
      method: "POST",
      body: { email: DEMO_CREDENTIALS.email, password },
    }),
  );

const forgot = (email = DEMO_CREDENTIALS.email, ip?: string) =>
  forgotPassword(apiRequest("/api/auth/password/forgot", { method: "POST", body: { email }, ip }));

const reset = (token: string, password = NEW_PASSWORD) =>
  resetPassword(
    apiRequest("/api/auth/password/reset", { method: "POST", body: { token, password } }),
  );

async function issueResetToken(): Promise<string> {
  const data = await expectOk<{ devToken?: string }>(await forgot());
  expect(data.devToken).toBeTruthy();
  return data.devToken!;
}

describe("forgot password", () => {
  it("answers the same way whether or not the account exists", async () => {
    // Otherwise the endpoint enumerates registered addresses.
    const known = await expectOk<{ success: boolean }>(await forgot());
    const unknown = await expectOk<{ success: boolean }>(await forgot("nikt@example.com"));

    expect(known.success).toBe(true);
    expect(unknown.success).toBe(true);
  });

  it("hands back a dev token outside production only", async () => {
    const outsideProduction = await expectOk<{ devToken?: string }>(await forgot());
    expect(outsideProduction.devToken).toBeTruthy();

    vi.stubEnv("NODE_ENV", "production");
    try {
      const inProduction = await expectOk<{ devToken?: string; devLink?: string }>(
        await forgot(),
      );
      expect(inProduction.devToken).toBeUndefined();
      expect(inProduction.devLink).toBeUndefined();
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("issues no token for an address nobody registered", async () => {
    const data = await expectOk<{ devToken?: string }>(await forgot("nikt@example.com"));
    expect(data.devToken).toBeUndefined();
  });

  it("rate limits the endpoint", async () => {
    const ip = "203.0.113.20";
    let limited = false;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const response = await forgot(DEMO_CREDENTIALS.email, ip);
      if (response.status === 429) {
        limited = true;
        break;
      }
    }

    expect(limited).toBe(true);
  });
});

describe("reset password", () => {
  it("changes the password and lets the new one through", async () => {
    const token = await issueResetToken();
    await expectOk(await reset(token));

    await expectError(await signIn(DEMO_CREDENTIALS.password), "INVALID_CREDENTIALS");
    await expectOk(await signIn(NEW_PASSWORD));
  });

  it("burns the token — a second use is refused", async () => {
    const token = await issueResetToken();
    await expectOk(await reset(token));

    await expectError(await reset(token, "JeszczeInne123"), "TOKEN_INVALID");
  });

  it("rejects a token nobody issued", async () => {
    await expectError(await reset("nie-istnieje"), "TOKEN_INVALID");
  });

  it("rejects an expired token", async () => {
    const token = await issueResetToken();

    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + (PASSWORD_RESET_TTL_SECONDS + 60) * 1000);
    try {
      await expectError(await reset(token), "TOKEN_EXPIRED");
    } finally {
      vi.useRealTimers();
    }
  });

  it("enforces the password rules on the new password", async () => {
    const token = await issueResetToken();
    const error = await expectError(await reset(token, "krotkie"), "VALIDATION_ERROR");

    expect(error.fields?.password).toBeTruthy();
  });

  it("signs the requester out — every outstanding token dies", async () => {
    await expectOk(await signIn());
    const token = await issueResetToken();

    await expectOk(await reset(token));

    await expectError(await me(), "UNAUTHORIZED");
  });
});

describe("change password", () => {
  it("requires a session", async () => {
    await expectError(
      await changePassword(
        apiRequest("/api/auth/password/change", {
          method: "POST",
          body: { currentPassword: DEMO_CREDENTIALS.password, newPassword: NEW_PASSWORD },
        }),
      ),
      "UNAUTHORIZED",
    );
  });

  it("verifies the current password before changing anything", async () => {
    await expectOk(await signIn());

    const error = await expectError(
      await changePassword(
        apiRequest("/api/auth/password/change", {
          method: "POST",
          body: { currentPassword: "ZupelnieZle1", newPassword: NEW_PASSWORD },
        }),
      ),
      "INVALID_CREDENTIALS",
    );
    expect(error.fields?.currentPassword).toBeTruthy();

    // The old password still works.
    await expectOk(await signIn(DEMO_CREDENTIALS.password));
  });

  it("changes the password and keeps the current tab signed in", async () => {
    await expectOk(await signIn());

    await expectOk(
      await changePassword(
        apiRequest("/api/auth/password/change", {
          method: "POST",
          body: { currentPassword: DEMO_CREDENTIALS.password, newPassword: NEW_PASSWORD },
        }),
      ),
    );

    // The handler re-issues cookies so the acting browser is not logged out.
    await expectOk(await me());
    await expectOk(await signIn(NEW_PASSWORD));
  });

  it("invalidates tokens issued in the same second as the change", async () => {
    // This is what the millisecond `ims` claim exists for: second-resolution
    // `iat` would let a token minted in the same second survive.
    await expectOk(await signIn());
    const { testCookies } = await import("../setup/cookie-store");
    const staleAccess = testCookies.get("rs_access")!.value;
    const staleRefresh = testCookies.get("rs_refresh")!.value;

    await expectOk(
      await changePassword(
        apiRequest("/api/auth/password/change", {
          method: "POST",
          body: { currentPassword: DEMO_CREDENTIALS.password, newPassword: NEW_PASSWORD },
        }),
      ),
    );

    // Put the pre-change tokens back, as another device would still hold them.
    testCookies.set("rs_access", staleAccess);
    testCookies.set("rs_refresh", staleRefresh);

    await expectError(await me(), "UNAUTHORIZED");
  });
});
