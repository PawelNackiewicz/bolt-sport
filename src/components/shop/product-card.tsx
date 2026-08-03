import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/src/components/ui";
import { localePath, type Dictionary, type Locale } from "@/src/i18n/config";
import { formatPrice } from "@/src/lib/shop/money";
import type { Product } from "@/src/lib/shop/types";
import { translateTag } from "@/src/lib/shop/i18n-helpers";
import { cn } from "@/src/lib/utils";

type ProductCardProps = {
  product: Product;
  locale: Locale;
  dictionary: Dictionary;
  className?: string;
};

/**
 * Server component — the whole card is a link, so it needs no client JS.
 * Adding to the cart happens on the product page, not from the grid.
 */
export function ProductCard({ product, locale, dictionary, className }: ProductCardProps) {
  const t = dictionary.shop.product;
  const isQuote = product.pricingMode === "quote";
  const outOfStock = !isQuote && product.stock <= 0;
  const lowStock = !isQuote && product.stock > 0 && product.stock <= 5;
  const [featuredTag] = product.tags;

  return (
    <Link
      href={localePath(locale, `/sklep/${product.slug}`)}
      className={cn(
        "group/card flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none",
        className,
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
        />

        {featuredTag ? (
          <Badge className="absolute top-3 left-3 backdrop-blur-sm">
            {translateTag(dictionary, featuredTag)}
          </Badge>
        ) : null}

        {outOfStock ? (
          <Badge variant="muted" className="absolute top-3 right-3 backdrop-blur-sm">
            {t.outOfStock}
          </Badge>
        ) : lowStock ? (
          <Badge variant="warning" className="absolute top-3 right-3 backdrop-blur-sm">
            {t.lowStock}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-base leading-snug font-semibold text-foreground">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.shortDescription}
        </p>

        <div className="mt-auto pt-3">
          {isQuote ? (
            <span className="font-display text-lg font-semibold text-primary">
              {t.quotePrice}
            </span>
          ) : (
            <span className="font-display text-xl font-semibold text-foreground tabular-nums">
              {formatPrice(product.price ?? 0, locale)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

/** Matches the card's silhouette so the listing does not jump when data lands. */
export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mt-auto h-6 w-1/3 animate-pulse rounded bg-muted pt-3" />
      </div>
    </div>
  );
}
