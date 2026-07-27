import Link from "next/link";
import type { Metadata } from "next";
import { IBM_Plex_Sans, Oswald } from "next/font/google";

import "./globals.css";

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

export default function GlobalNotFound() {
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
      </body>
    </html>
  );
}
