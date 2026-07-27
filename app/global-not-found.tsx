import Link from "next/link";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { IBM_Plex_Sans, Oswald } from "next/font/google";

import "./globals.css";
import { checkEnv } from "@/src/lib/env-check";
import { NotFoundDebugPanel } from "./not-found-debug-panel";

const display = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
});

const body = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Nie znaleziono strony",
  description: "Strona, której szukasz, nie istnieje.",
};

export default async function GlobalNotFound() {
  const envStatuses = checkEnv();
  const renderedAt = new Date().toISOString();

  // global-not-found.tsx runs outside the matched-route render tree, so
  // there's no request pathname available server-side (see not-found.md:
  // "you must fetch data on the client-side instead"). We log what we do
  // have here (host/referer/env status); the exact path is logged
  // client-side by <NotFoundDebugPanel />.
  const headersList = await headers();
  console.error("[global-not-found]", {
    renderedAt,
    host: headersList.get("host"),
    referer: headersList.get("referer"),
    userAgent: headersList.get("user-agent"),
    envStatuses,
  });

  return (
    <html
      lang="pl"
      className={`${display.variable} ${body.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
        <span className="kicker text-primary">404</span>
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          Nie znaleziono strony
        </h1>
        <p className="max-w-md text-muted-foreground">
          Strona, której szukasz, nie istnieje lub została przeniesiona.
        </p>
        <Link
          href="/"
          className="mt-2 inline-flex items-center rounded-full border border-border px-5 py-2 text-sm font-medium transition-colors hover:border-primary/50 hover:text-primary"
        >
          Wróć na stronę główną
        </Link>
        <NotFoundDebugPanel
          envStatuses={envStatuses}
          renderedAt={renderedAt}
          nodeEnv={process.env.NODE_ENV}
        />
      </body>
    </html>
  );
}
