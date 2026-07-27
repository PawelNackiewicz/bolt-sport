import { NextResponse, type NextRequest } from "next/server";

import {
  LOCALE_COOKIE,
  defaultLocale,
  isLocale,
  locales,
  type Locale,
} from "@/src/i18n/config";

/**
 * Każdy request bez prefiksu locale (`/sklep`) dostaje redirect na wersję
 * z prefiksem (`/pl/sklep`). Język wybieramy z ciasteczka, a jeśli go nie ma —
 * z nagłówka `Accept-Language`.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = resolveLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

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
