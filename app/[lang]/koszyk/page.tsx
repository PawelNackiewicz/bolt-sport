import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/src/components/ui";
import { CartContents } from "@/src/components/shop/cart-contents";
import { getDictionary } from "@/src/i18n/dictionaries";
import { isLocale } from "@/src/i18n/config";

type CartPageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: CartPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { shop } = await getDictionary(lang);
  return { title: shop.cart.title };
}

export default async function CartPage({ params }: CartPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dictionary = await getDictionary(lang);

  return (
    <main className="py-10 sm:py-14">
      <Container className="flex flex-col gap-8">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {dictionary.shop.cart.title}
        </h1>
        {/* The cart lives client-side so the badge and this page share state. */}
        <CartContents />
      </Container>
    </main>
  );
}
