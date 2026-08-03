import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Container } from "@/src/components/ui";
import { Pagination } from "@/src/components/shop/pagination";
import { ProductCard } from "@/src/components/shop/product-card";
import { ShopFilters, SortSelect } from "@/src/components/shop/shop-filters";
import { getDictionary } from "@/src/i18n/dictionaries";
import { isLocale } from "@/src/i18n/config";
import { productsRepo } from "@/src/lib/db/repositories/products";
import { productQuerySchema } from "@/src/lib/validation/shop";

type ShopPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { shop } = await getDictionary(lang);
  return { title: shop.listing.title, description: shop.listing.subtitle };
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const rawParams = await searchParams;
  const dictionary = await getDictionary(lang);
  const t = dictionary.shop.listing;

  // Filters come from a user-editable URL, so a malformed value must fall back
  // to the default listing rather than throw. The schema supplies defaults for
  // sort/page/perPage; anything unparseable is dropped here.
  const parsed = productQuerySchema.safeParse(rawParams);
  const query = parsed.success
    ? parsed.data
    : productQuerySchema.parse({});

  const [result, categories] = await Promise.all([
    productsRepo.findMany(query),
    productsRepo.listCategories(),
  ]);

  const buildHref = (page: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(rawParams)) {
      if (value === undefined || key === "page") continue;
      for (const entry of Array.isArray(value) ? value : [value]) next.append(key, entry);
    }
    if (page > 1) next.set("page", String(page));
    const search = next.toString();
    return search ? `?${search}` : "?";
  };

  return (
    <main className="py-10 sm:py-14">
      <Container className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="kicker text-primary">{dictionary.nav.items.shop}</p>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t.title}
          </h1>
          <p className="max-w-2xl text-muted-foreground">{t.subtitle}</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-10">
          <ShopFilters categories={categories} />

          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground tabular-nums">
                  {result.total}
                </span>{" "}
                {t.results}
              </p>
              <SortSelect />
            </div>

            {result.items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-6 py-16 text-center">
                <p className="font-display text-lg font-semibold">{t.noResults}</p>
                <p className="max-w-sm text-sm text-muted-foreground">{t.noResultsHint}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                {result.items.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    locale={lang}
                    dictionary={dictionary}
                  />
                ))}
              </div>
            )}

            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              dictionary={dictionary}
              buildHref={buildHref}
            />
          </div>
        </div>
      </Container>
    </main>
  );
}
