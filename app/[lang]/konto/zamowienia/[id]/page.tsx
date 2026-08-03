import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Badge, Container, Separator } from "@/src/components/ui";
import { getDictionary } from "@/src/i18n/dictionaries";
import { isLocale, localePath } from "@/src/i18n/config";
import { getSession } from "@/src/lib/auth/session";
import { ordersRepo } from "@/src/lib/db/repositories/orders";
import { loginPath } from "@/src/lib/shop/redirects";
import { formatPrice } from "@/src/lib/shop/money";

type OrderPageProps = { params: Promise<{ lang: string; id: string }> };

export async function generateMetadata({ params }: OrderPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { shop } = await getDictionary(lang);
  return { title: shop.account.orderDetails, robots: { index: false } };
}

export default async function OrderDetailsPage({ params }: OrderPageProps) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();

  const user = await getSession();
  if (!user) redirect(loginPath(lang, `/konto/zamowienia/${id}`));

  const order = await ordersRepo.findById(id);
  // Someone else's order is reported as missing rather than forbidden, so the
  // page does not confirm that the id exists.
  if (!order || order.userId !== user.id) notFound();

  const dictionary = await getDictionary(lang);
  const t = dictionary.shop.account;

  return (
    <main className="py-10 sm:py-14">
      <Container className="flex max-w-3xl flex-col gap-8">
        <div className="flex flex-col gap-2">
          <Link
            href={localePath(lang, "/konto/zamowienia")}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.backToOrders}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {order.number}
            </h1>
            <Badge variant={order.status === "paid" ? "success" : "warning"}>
              {dictionary.shop.orderStatus[order.status]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleString(lang)}
          </p>
        </div>

        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">{t.items}</h2>

          <ul className="flex flex-col gap-4">
            {order.items.map((item) => (
              <li key={item.productId} className="flex items-center gap-4">
                {item.image ? (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                  </div>
                ) : null}

                <div className="flex min-w-0 flex-1 flex-col">
                  {/* Snapshot data — the catalog may have changed since. */}
                  <Link
                    href={localePath(lang, `/sklep/${item.slug}`)}
                    className="truncate font-medium transition-colors hover:text-primary"
                  >
                    {item.name}
                  </Link>
                  <span className="font-mono text-xs text-muted-foreground">{item.sku}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.quantity} × {formatPrice(item.unitPrice, lang)}
                  </span>
                </div>

                <span className="shrink-0 font-medium tabular-nums">
                  {formatPrice(item.lineTotal, lang)}
                </span>
              </li>
            ))}
          </ul>

          <Separator />

          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{dictionary.shop.cart.subtotal}</dt>
              <dd className="tabular-nums">{formatPrice(order.subtotal, lang)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{dictionary.shop.cart.shipping}</dt>
              <dd className="tabular-nums">
                {order.shippingCost === 0
                  ? dictionary.shop.cart.shippingFree
                  : formatPrice(order.shippingCost, lang)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-border pt-2">
              <dt className="font-medium">{dictionary.shop.cart.total}</dt>
              <dd className="font-display text-2xl font-bold tabular-nums">
                {formatPrice(order.total, lang)}
              </dd>
            </div>
          </dl>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 text-sm">
            <h2 className="font-display font-semibold">
              {dictionary.shop.checkout.shippingAddress}
            </h2>
            <address className="text-muted-foreground not-italic">
              {order.customer.firstName} {order.customer.lastName}
              <br />
              {order.customer.company ? (
                <>
                  {order.customer.company}
                  <br />
                </>
              ) : null}
              {order.shippingAddress.street}
              <br />
              {order.shippingAddress.postalCode} {order.shippingAddress.city}
              <br />
              {order.shippingAddress.country}
            </address>
          </section>

          <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 text-sm">
            <h2 className="font-display font-semibold">{dictionary.shop.checkout.payment}</h2>
            <p className="text-muted-foreground">
              {dictionary.shop.checkout.methods[order.paymentMethod]}
            </p>
            {order.notes ? (
              <>
                <h2 className="mt-2 font-display font-semibold">
                  {dictionary.shop.checkout.notes}
                </h2>
                <p className="text-muted-foreground">{order.notes}</p>
              </>
            ) : null}
          </section>
        </div>
      </Container>
    </main>
  );
}
