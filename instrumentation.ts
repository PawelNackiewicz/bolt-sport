import type { Instrumentation } from "next";

import { checkEnv, hasMissingRequiredEnv } from "@/src/lib/env-check";

/**
 * Runs once when the server boots. Surfaces missing env vars immediately in
 * the deploy logs instead of letting them fail silently deep inside a page.
 */
export function register() {
  const statuses = checkEnv();

  console.log("[env-check] Sprawdzanie zmiennych środowiskowych...");
  for (const status of statuses) {
    const tag = status.present ? "OK" : status.required ? "BRAK (wymagana)" : "brak (opcjonalna)";
    console.log(`[env-check]   ${status.name}: ${tag}${status.present ? ` — ${status.display}` : ""}`);
  }

  if (hasMissingRequiredEnv(statuses)) {
    console.error(
      "[env-check] Brakuje wymaganych zmiennych środowiskowych — sprawdź .env.local lub ustawienia hostingu (np. Vercel → Project Settings → Environment Variables).",
    );
  } else {
    console.log("[env-check] Wszystkie wymagane zmienne środowiskowe są ustawione.");
  }
}

/**
 * Catches server-side errors (thrown env-var checks, failed Storyblok
 * fetches, etc.) that would otherwise only show up as a generic error page,
 * and logs the request path/route that triggered them.
 */
export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request,
  context,
) => {
  const message = error instanceof Error ? error.message : String(error);
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String((error as { digest: unknown }).digest)
      : undefined;

  console.error("[request-error]", {
    path: request.path,
    method: request.method,
    routerKind: context.routerKind,
    routePath: context.routePath,
    routeType: context.routeType,
    message,
    digest,
  });
};
