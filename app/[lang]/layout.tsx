import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Mono, IBM_Plex_Sans, Oswald } from "next/font/google";

import "../globals.css";
import StoryblokProvider from "@/src/providers/StoryblokProvider";
import { Footer, Navigation } from "@/src/components/ui";
import { getDictionary } from "@/src/i18n/dictionaries";
import { I18nProvider } from "@/src/i18n/i18n-provider";
import { isLocale, locales } from "@/src/i18n/config";

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
  return { title: meta.title, description: meta.description };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<LangParams & { children: React.ReactNode }>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dictionary = await getDictionary(lang);

  return (
    <StoryblokProvider>
      <html
        lang={lang}
        suppressHydrationWarning
        className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
      >
        <body>
          <I18nProvider locale={lang} dictionary={dictionary}>
            <Navigation />
            {children}
            <Footer />
          </I18nProvider>
        </body>
      </html>
    </StoryblokProvider>
  );
}
