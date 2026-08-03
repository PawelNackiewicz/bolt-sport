import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Star } from "lucide-react";

import { Badge, Container, Separator } from "@/src/components/ui";
import { AddToCart } from "@/src/components/shop/add-to-cart";
import { ProductCard } from "@/src/components/shop/product-card";
import { ProductGallery } from "@/src/components/shop/product-gallery";
import { QuoteCta } from "@/src/components/shop/quote-cta";
import { getDictionary } from "@/src/i18n/dictionaries";
import { isLocale, localePath } from "@/src/i18n/config";
import { productsRepo } from "@/src/lib/db/repositories/products";
import { format, translateCategory, translateTag } from "@/src/lib/shop/i18n-helpers";
import { formatPrice } from "@/src/lib/shop/money";

type ProductPageProps = { params: Promise<{ lang: string; slug: string }> };

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};

  const product = await productsRepo.findBySlug(slug);
  if (!product) return {};

  return { title: product.name, description: product.shortDescription };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const product = await productsRepo.findBySlug(slug);
  if (!product) notFound();

  const dictionary = await getDictionary(lang);
  const t = dictionary.shop.product;

  const [related, category] = await Promise.all([
    productsRepo.findRelated(product, 4),
    productsRepo.findCategoryBySlug(product.categorySlug),
  ]);

  const isQuote = product.pricingMode === "quote";
  const categoryLabel = translateCategory(
    dictionary,
    product.categorySlug,
    category?.name ?? product.categorySlug,
  );

  return (
    <main className="py-8 sm:py-12">
      <Container className="flex flex-col gap-12">
        <nav aria-label="breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link href={localePath(lang, "/sklep")} className="transition-colors hover:text-foreground">
            {dictionary.shop.listing.title}
          </Link>
          <ChevronRight className="size-3.5" />
          <Link
            href={`${localePath(lang, "/sklep")}?category=${product.categorySlug}`}
            className="transition-colors hover:text-foreground"
          >
            {categoryLabel}
          </Link>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
          <ProductGallery images={product.images} name={product.name} />

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {translateTag(dictionary, tag)}
                  </Badge>
                ))}
              </div>

              <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {product.name}
              </h1>
              <p className="text-muted-foreground">{product.shortDescription}</p>

              {product.rating ? (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Star className="size-4 fill-primary text-primary" />
                  {format(t.rating, {
                    average: product.rating.average.toFixed(1),
                    count: product.rating.count,
                  })}
                </p>
              ) : null}
            </div>

            <Separator />

            <div className="flex flex-col gap-1">
              {isQuote ? (
                <span className="font-display text-3xl font-bold text-primary">
                  {t.quotePrice}
                </span>
              ) : (
                <>
                  <span className="font-display text-3xl font-bold tabular-nums">
                    {formatPrice(product.price ?? 0, lang)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {product.stock > 0
                      ? format(t.stockCount, { count: product.stock })
                      : t.outOfStock}
                  </span>
                </>
              )}
            </div>

            {isQuote ? <QuoteCta product={product} /> : <AddToCart product={product} />}

            <Separator />

            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-4 border-b border-border/60 py-1.5 sm:col-span-2">
                <dt className="text-muted-foreground">{t.sku}</dt>
                <dd className="font-mono text-xs">{product.sku}</dd>
              </div>
              {Object.entries(product.attributes).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 border-b border-border/60 py-1.5">
                  <dt className="text-muted-foreground">{key}</dt>
                  <dd className="text-right font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <section className="max-w-3xl">
          <h2 className="mb-4 font-display text-xl font-semibold">{t.description}</h2>
          <div className="flex flex-col gap-4 leading-relaxed text-muted-foreground">
            {product.description.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>

        {related.length > 0 ? (
          <section className="flex flex-col gap-5">
            <h2 className="font-display text-xl font-semibold">{t.related}</h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  locale={lang}
                  dictionary={dictionary}
                />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </main>
  );
}
