"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button, Container } from "@/src/components/ui";
import { useI18n } from "@/src/i18n/i18n-provider";
import type { ShopSectionStoryblok } from "@/src/types/component-types-sb";

type ShopSectionProps = {
  blok: ShopSectionStoryblok;
};

/* -------------------------------------------------------------------------- */
/*  Mock data — replaces the legacy products service until the shop is wired  */
/*  up to a real data source. Mirrors the previous ProductHighlights section. */
/* -------------------------------------------------------------------------- */

type MockCategory = {
  slug: string;
  name: string;
  productCount: number;
};

type MockProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
};

const categories: MockCategory[] = [
  { slug: "worki-treningowe", name: "Worki treningowe", productCount: 12 },
  { slug: "rekawice", name: "Rękawice", productCount: 8 },
  { slug: "ochraniacze", name: "Ochraniacze", productCount: 15 },
  { slug: "tarcze-lapy", name: "Tarcze i łapy", productCount: 6 },
  { slug: "akcesoria", name: "Akcesoria", productCount: 21 },
];

const featured: MockProduct[] = [
  {
    id: "1",
    name: "Worek bokserski Pro 120 cm",
    category: "Worki treningowe",
    price: 549,
    image:
      "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&q=80",
  },
  {
    id: "2",
    name: "Rękawice bokserskie 12 oz",
    category: "Rękawice",
    price: 219,
    image:
      "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?w=600&q=80",
  },
  {
    id: "3",
    name: "Ochraniacz szczęki Premium",
    category: "Ochraniacze",
    price: 49,
    image:
      "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=600&q=80",
  },
  {
    id: "4",
    name: "Łapy trenerskie Curved",
    category: "Tarcze i łapy",
    price: 189,
    image:
      "https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=600&q=80",
  },
  {
    id: "5",
    name: "Owijki bokserskie 4,5 m",
    category: "Akcesoria",
    price: 39,
    image:
      "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80",
  },
  {
    id: "6",
    name: "Ochraniacz na golenie i stopę",
    category: "Ochraniacze",
    price: 159,
    image:
      "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=600&q=80",
  },
];

const priceFormatter = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});

function ProductCard({ product }: { product: MockProduct }) {
  const { href } = useI18n();

  return (
    <Link
      href={href(`/sklep/${product.id}`)}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/50"
    >
      <div className="aspect-4/3 overflow-hidden bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="kicker text-primary">{product.category}</span>
        <h3 className="font-display text-base font-semibold uppercase leading-tight tracking-tight">
          {product.name}
        </h3>
        <span className="mt-auto pt-2 text-lg font-bold">
          {priceFormatter.format(product.price)}
        </span>
      </div>
    </Link>
  );
}

export function ShopSection(_props: ShopSectionProps) {
  const { href } = useI18n();

  return (
    <section
      id="sklep"
      className="scroll-mt-20 border-y border-border bg-card/30 py-16 sm:py-20"
    >
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-3">
            <span className="kicker flex items-center gap-2 text-primary">
              <span className="inline-block h-px w-6 bg-primary" />
              Sklep
            </span>
            <h2 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Najczęściej wybierany sprzęt
            </h2>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              Produkty z naszej bieżącej oferty — w cenach detalicznych.
            </p>
          </div>
          <Button
            size="lg"
            variant="outline"
            className="shrink-0"
            nativeButton={false}
            render={<Link href={href("/sklep")} />}
          >
            Zobacz cały sklep
            <ArrowRight />
          </Button>
        </div>

        {/* category pills — link into the shop pre-filtered */}
        <ul className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <li key={category.slug}>
              <Link
                href={href(`/sklep?category=${category.slug}`)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {category.name}
                <span className="text-[0.7rem] opacity-60">
                  {category.productCount}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </section>
  );
}
