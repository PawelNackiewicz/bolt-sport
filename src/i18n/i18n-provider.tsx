"use client";

import { createContext, useContext, useMemo } from "react";

import { localePath, type Dictionary, type Locale } from "./config";

type I18nValue = {
  locale: Locale;
  dictionary: Dictionary;
  /** `/sklep` → `/de/sklep` dla aktualnego locale. */
  href: (path: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

type I18nProviderProps = {
  locale: Locale;
  dictionary: Dictionary;
  children: React.ReactNode;
};

export function I18nProvider({
  locale,
  dictionary,
  children,
}: I18nProviderProps) {
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      dictionary,
      href: (path: string) => localePath(locale, path),
    }),
    [locale, dictionary],
  );

  return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n musi być użyte wewnątrz <I18nProvider>");
  }
  return context;
}
