import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Mono, IBM_Plex_Sans, Oswald } from "next/font/google";

import "../globals.css";
import { Footer, Navigation } from "@/src/components/ui";
import { getDictionary } from "@/src/i18n/dictionaries";
import { I18nProvider } from "@/src/i18n/i18n-provider";
import { isLocale, locales } from "@/src/i18n/config";

/**
 * Ustawia klasę `.dark` przed pierwszym paintem, żeby uniknąć mignięcia
 * jasnego motywu. Musi być blokujący i inline — stąd `dangerouslySetInnerHTML`.
 * Parą jest `ThemeToggle`, który zapisuje wybór do `localStorage.theme`.
 */
const themeScript = `try{const t=localStorage.theme;if(t==="dark"||(!t&&matchMedia("(prefers-color-scheme:dark)").matches))document.documentElement.classList.add("dark")}catch{}`;

const display = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const body = IBM_Plex_Sans({
  variable: "--font-plex",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

type LangParams = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LangParams): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { meta } = await getDictionary(lang);
  return {
    // Bez tego `alternates` renderują się jako ścieżki względne, a hreflang
    // wymaga absolutnych URL-i. Ustaw NEXT_PUBLIC_SITE_URL na produkcji.
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(
        locales.map((locale) => [locale, `/${locale}`]),
      ),
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<LangParams & { children: React.ReactNode }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dictionary = await getDictionary(lang);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <I18nProvider locale={lang} dictionary={dictionary}>
          <Navigation />
          {children}
        </I18nProvider>
        {/* Footer nie ma interaktywności — zostaje serwerowy, słownik dostaje propsem. */}
        <Footer locale={lang} dictionary={dictionary} />
      </body>
    </html>
  );
}
