import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/src/components/ui";
import { CheckoutForm } from "@/src/components/shop/checkout-form";
import { getDictionary } from "@/src/i18n/dictionaries";
import { isLocale } from "@/src/i18n/config";
import { getSession } from "@/src/lib/auth/session";

type CheckoutPageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { shop } = await getDictionary(lang);
  return { title: shop.checkout.title };
}

/** Checkout is open to guests; a session only prefills the form. */
export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [dictionary, user] = await Promise.all([getDictionary(lang), getSession()]);
  const t = dictionary.shop.checkout;

  return (
    <main className="py-10 sm:py-14">
      <Container className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </header>

        <CheckoutForm user={user} />
      </Container>
    </main>
  );
}
