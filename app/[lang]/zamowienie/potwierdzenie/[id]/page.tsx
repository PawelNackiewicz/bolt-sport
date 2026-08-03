import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { Badge, Container, Separator, buttonVariants } from "@/src/components/ui";
import { getDictionary } from "@/src/i18n/dictionaries";
import { isLocale, localePath } from "@/src/i18n/config";
import { getSession } from "@/src/lib/auth/session";
import { ordersRepo } from "@/src/lib/db/repositories/orders";
import { formatPrice } from "@/src/lib/shop/money";
import { cn } from "@/src/lib/utils";

type ConfirmationPageProps = { params: Promise<{ lang: string; id: string }> };

export async function generateMetadata({
  params,
}: ConfirmationPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { shop } = await getDictionary(lang);
  return { title: shop.confirmation.title, robots: { index: false } };
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();

  const order = await ordersRepo.findById(id);
  if (!order) notFound();

  // Orders owned by an account stay private; guest orders are reachable only
  // through the unguessable id, which is what this page is linked with.
  if (order.userId !== null) {
    const user = await getSession();
    if (!user || user.id !== order.userId) notFound();
  }

  const dictionary = await getDictionary(lang);
  const t = dictionary.shop.confirmation;

  return (
    <main className="py-12 sm:py-16">
      <Container className="flex max-w-3xl flex-col gap-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="size-12 text-primary" />
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t.title}
          </h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </header>

        <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
          <dl className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">{t.orderNumber}</dt>
              <dd className="font-mono text-sm font-semibold">{order.number}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">{t.placedAt}</dt>
              <dd className="text-sm">
                {new Date(order.createdAt).toLocaleDateString(lang)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-xs text-muted-foreground">{t.paymentMethod}</dt>
              <dd className="flex items-center gap-2 text-sm">
                {dictionary.shop.checkout.methods[order.paymentMethod]}
                <Badge variant={order.status === "paid" ? "success" : "warning"}>
                  {dictionary.shop.orderStatus[order.status]}
                </Badge>
              </dd>
            </div>
          </dl>

          <Separator />

          <ul className="flex flex-col gap-2 text-sm">
            {order.items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  {item.quantity}× {item.name}
                </span>
                <span className="shrink-0 tabular-nums">
                  {formatPrice(item.lineTotal, lang)}
                </span>
              </li>
            ))}
          </ul>

          <Separator />

          <div className="flex items-baseline justify-between">
            <span className="font-medium">{dictionary.shop.cart.total}</span>
            <span className="font-display text-2xl font-bold tabular-nums">
              {formatPrice(order.total, lang)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Link href={localePath(lang, "/sklep")} className={cn(buttonVariants({ size: "lg" }))}>
            {t.backToShop}
          </Link>
          <Link
            href={localePath(lang, "/konto/zamowienia")}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            {t.viewOrders}
          </Link>
        </div>
      </Container>
    </main>
  );
}
