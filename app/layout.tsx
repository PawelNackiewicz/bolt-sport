import type { Metadata } from "next";
import "./globals.css";
import StoryblokProvider from "@/src/providers/StoryblokProvider";
import { IBM_Plex_Mono, IBM_Plex_Sans, Oswald } from "next/font/google";

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

export const metadata: Metadata = {
  title: "Bolt-Sport — polski producent sprzętu do sportów walki",
  description:
    "Bolt-Sport to polski producent sprzętu do sportów walki. Worki bokserskie, rękawice, maty i materace, a także ringi bokserskie, klatki MMA i kompletne wyposażenie sal treningowych. Produkujemy w Siasiejowie.",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  return (
    <StoryblokProvider>
      <html
        lang={lang}
        suppressHydrationWarning
        className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
      >
        <body>{children}</body>
      </html>
    </StoryblokProvider>
  );
}
