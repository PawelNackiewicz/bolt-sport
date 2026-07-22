"use client";

import { ChevronDown, Languages } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  locales,
  switchLocaleInPath,
  type Locale,
} from "@/src/i18n/config";
import { useI18n } from "@/src/i18n/i18n-provider";

const LABELS: Record<Locale, string> = { pl: "PL", de: "DE", en: "EN" };

export function LanguageSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { locale, dictionary } = useI18n();

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const target = event.target.value as Locale;
    if (target === locale) return;

    // Zapamiętujemy wybór — `proxy.ts` użyje go przy wejściu na ścieżkę bez locale.
    document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;

    // `search` i `hash` czytamy z `window` (jesteśmy w handlerze, więc zawsze
    // po stronie klienta) — dzięki temu unikamy `useSearchParams`, które
    // wymusiłoby Suspense boundary w statycznie renderowanym layoucie.
    const { search, hash } = window.location;
    const nextPath = switchLocaleInPath(pathname, target);

    startTransition(() => {
      // `replace`, żeby przełączanie języka nie zaśmiecało historii przeglądarki.
      router.replace(`${nextPath}${search}${hash}`);
    });
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <Languages
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <select
        value={locale}
        onChange={onChange}
        disabled={isPending}
        aria-label={dictionary.nav.languageLabel}
        className="h-9 cursor-pointer appearance-none rounded-md border border-border bg-background pl-8 pr-7 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-60"
      >
        {locales.map((item) => (
          <option key={item} value={item}>
            {LABELS[item]}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
    </div>
  );
}
