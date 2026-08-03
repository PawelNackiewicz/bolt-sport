"use client";

import Link from "next/link";
import { PackageX } from "lucide-react";

import { Container, buttonVariants } from "@/src/components/ui";
import { useI18n } from "@/src/i18n/i18n-provider";
import { cn } from "@/src/lib/utils";

/**
 * Rendered when `notFound()` is thrown inside a locale segment — a missing
 * product slug, order id, and so on. Being a client component lets it read the
 * active locale from the provider, which `not-found.tsx` cannot get via params.
 *
 * `app/global-not-found.tsx` still handles URLs that match no route at all.
 */
export default function LocaleNotFound() {
  const { dictionary, href } = useI18n();
  const t = dictionary.shop.notFound;

  return (
    <main className="py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-4 text-center">
        <PackageX className="size-10 text-primary" />
        <p className="kicker text-primary">404</p>
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t.title}
        </h1>
        <p className="max-w-md text-muted-foreground">{t.hint}</p>

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href={href("/sklep")} className={cn(buttonVariants({ size: "lg" }))}>
            {dictionary.shop.cart.goToShop}
          </Link>
          <Link
            href={href("/")}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            {dictionary.nav.home}
          </Link>
        </div>
      </Container>
    </main>
  );
}
