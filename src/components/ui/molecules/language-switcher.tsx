"use client";

import { ChevronDown, Languages } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export const locales = ["pl", "de", "en"] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (locales as readonly string[]).includes(value);
}

const LABELS: Record<Locale, string> = { pl: "PL", de: "DE", en: "EN" };

export function LanguageSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const current = isLocale(pathname.split("/")[1])
    ? pathname.split("/")[1]
    : "pl";

  function onChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const target = event.target.value as Locale;
    const segments = pathname.split("/");
    if (isLocale(segments[1])) {
      segments[1] = target;
    } else {
      segments.splice(1, 0, target);
    }
    router.push(segments.join("/") || "/");
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <Languages
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <select
        value={current}
        onChange={onChange}
        aria-label="Wybór języka"
        className="h-9 cursor-pointer appearance-none rounded-md border border-border bg-background pl-8 pr-7 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        {locales.map((locale) => (
          <option key={locale} value={locale}>
            {LABELS[locale]}
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
