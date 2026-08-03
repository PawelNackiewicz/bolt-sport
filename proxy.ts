import { NextResponse, type NextRequest } from "next/server";

import {
  LOCALE_COOKIE,
  defaultLocale,
  isLocale,
  locales,
  type Locale,
} from "@/src/i18n/config";
import { verifyToken } from "@/src/lib/auth/jwt";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/src/lib/shop/constants";

/**
 * Każdy request bez prefiksu locale (`/sklep`) dostaje redirect na wersję
 * z prefiksem (`/pl/sklep`). Język wybieramy z ciasteczka, a jeśli go nie ma —
 * z nagłówka `Accept-Language`.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matched = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (matched) return guardAccount(request, matched);

  const locale = resolveLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

/**
 * Gate for `/konto/**`. This only checks that a session cookie carries a valid
 * signature — the authoritative check (does the user still exist, was the
 * password changed since) happens in the page itself, which can reach the data
 * store. Proxy runs before rendering and should stay cheap and side-effect free.
 */
async function guardAccount(request: NextRequest, locale: Locale) {
  const accountPath = `/${locale}/konto`;
  const { pathname } = request.nextUrl;

  if (pathname !== accountPath && !pathname.startsWith(`${accountPath}/`)) {
    return NextResponse.next();
  }

  const hasSession =
    (await verifyToken(request.cookies.get(ACCESS_COOKIE)?.value, "access")) ??
    (await verifyToken(request.cookies.get(REFRESH_COOKIE)?.value, "refresh"));

  if (hasSession) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}/logowanie`;
  url.search = "";
  // Preserve the original target (including its query) so login can return the
  // user to where they were heading.
  url.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(url);
}

function resolveLocale(request: NextRequest): Locale {
  const fromCookie = request.cookies.get(LOCALE_COOKIE)?.value?.toLowerCase();
  if (isLocale(fromCookie)) return fromCookie;

  const fromHeader = matchAcceptLanguage(
    request.headers.get("accept-language"),
  );
  return fromHeader ?? defaultLocale;
}

/**
 * Minimalny parser `Accept-Language` — sortuje tagi po `q` i zwraca pierwszy,
 * którego język bazowy obsługujemy (`de-AT` → `de`).
 */
function matchAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;

  const tags = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const quality = params.find((param) => param.trim().startsWith("q="));
      const q = quality ? Number.parseFloat(quality.split("=")[1]) : 1;
      return { tag: tag.trim().toLowerCase(), q: Number.isNaN(q) ? 0 : q };
    })
    .filter(({ tag }) => tag.length > 0)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of tags) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return null;
}

export const config = {
  // Pomijamy API, pliki statyczne Next.js i wszystko z rozszerzeniem (public/).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
