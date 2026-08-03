import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { Badge, Container, buttonVariants } from "@/src/components/ui";
import { getDictionary } from "@/src/i18n/dictionaries";
import { isLocale, localePath } from "@/src/i18n/config";
import { getSession } from "@/src/lib/auth/session";
import { ordersRepo } from "@/src/lib/db/repositories/orders";
import { loginPath } from "@/src/lib/shop/redirects";
import { formatPrice } from "@/src/lib/shop/money";
import { cn } from "@/src/lib/utils";

type OrdersPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: OrdersPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { shop } = await getDictionary(lang);
  return { title: shop.account.orders, robots: { index: false } };
}

export default async function OrdersPage({ params, searchParams }: OrdersPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const user = await getSession();
  if (!user) redirect(loginPath(lang, "/konto/zamowienia"));

  const { page } = await searchParams;
  const parsedPage = Number(page);
  const currentPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const dictionary = await getDictionary(lang);
  const t = dictionary.shop.account;
  const result = await ordersRepo.findByUserId(user.id, currentPage, 10);

  return (
    <main className="py-10 sm:py-14">
      <Container className="flex max-w-3xl flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Link
            href={localePath(lang, "/konto")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.title}
          </Link>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t.orders}
          </h1>
        </div>

        {result.items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <p className="text-muted-foreground">{t.ordersEmpty}</p>
            <Link href={localePath(lang, "/sklep")} className={cn(buttonVariants())}>
              {dictionary.shop.cart.goToShop}
            </Link>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {result.items.map((order) => (
              <li key={order.id}>
                <Link
                  href={localePath(lang, `/konto/zamowienia/${order.id}`)}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="font-mono text-sm font-semibold">{order.number}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString(lang)} ·{" "}
                      {/* Total pieces, not the number of lines — the label says "szt." */}
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      {dictionary.shop.common.pieces}
                    </span>
                  </div>

                  <Badge variant={order.status === "paid" ? "success" : "warning"}>
                    {dictionary.shop.orderStatus[order.status]}
                  </Badge>

                  <span className="font-display text-lg font-semibold tabular-nums">
                    {formatPrice(order.total, lang)}
                  </span>

                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        )}

        {result.totalPages > 1 ? (
          <nav className="flex items-center justify-between gap-4 border-t border-border pt-6">
            <Link
              href={`?page=${result.page - 1}`}
              aria-disabled={result.page <= 1}
              className={cn(
                buttonVariants({ variant: "outline" }),
                result.page <= 1 && "pointer-events-none opacity-40",
              )}
            >
              {dictionary.shop.listing.previous}
            </Link>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {result.page} / {result.totalPages}
            </span>
            <Link
              href={`?page=${result.page + 1}`}
              aria-disabled={result.page >= result.totalPages}
              className={cn(
                buttonVariants({ variant: "outline" }),
                result.page >= result.totalPages && "pointer-events-none opacity-40",
              )}
            >
              {dictionary.shop.listing.next}
            </Link>
          </nav>
        ) : null}
      </Container>
    </main>
  );
}
