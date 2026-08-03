"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Alert, Button, Separator, Skeleton, buttonVariants } from "@/src/components/ui";
import { useI18n } from "@/src/i18n/i18n-provider";
import type { ApiFailure } from "@/src/lib/shop/api-client";
import { format, translateError } from "@/src/lib/shop/i18n-helpers";
import { formatPrice } from "@/src/lib/shop/money";
import { cn } from "@/src/lib/utils";

import { useCart } from "./cart-provider";

export function CartContents() {
  const { dictionary, locale, href } = useI18n();
  const { cart, ensureCart, changeItemQuantity, removeItem, clear, pending } = useCart();
  const [error, setError] = useState<string | null>(null);

  const t = dictionary.shop.cart;

  // This page renders the cart, so it is the one that pays for loading it.
  useEffect(() => ensureCart(), [ensureCart]);

  const run = async (action: Promise<ApiFailure | null>) => {
    const failure = await action;
    setError(failure ? translateError(dictionary, failure) : null);
  };

  // First paint before the cart request resolves.
  if (!cart) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-20 text-center">
        <ShoppingBag className="size-8 text-muted-foreground" />
        <p className="font-display text-lg font-semibold">{t.empty}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{t.emptyHint}</p>
        <Link href={href("/sklep")} className={cn(buttonVariants({ size: "lg" }), "mt-2")}>
          {t.goToShop}
        </Link>
      </div>
    );
  }

  const { summary } = cart;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="flex flex-col gap-4">
        {cart.warnings.length > 0 ? (
          <Alert variant="warning" className="flex-col items-start gap-1">
            <span className="flex items-center gap-2 font-semibold">
              <AlertTriangle />
              {t.warningsTitle}
            </span>
            <ul className="list-inside list-disc text-sm">
              {cart.warnings.map((warning, index) => (
                <li key={index}>
                  {warning.code === "ITEM_REMOVED"
                    ? format(t.warnings.ITEM_REMOVED, { name: warning.productName })
                    : format(t.warnings.QUANTITY_REDUCED, {
                        name: warning.productName,
                        quantity: warning.quantity,
                      })}
                </li>
              ))}
            </ul>
          </Alert>
        ) : null}

        {error ? <Alert variant="error">{error}</Alert> : null}

        <ul className="flex flex-col gap-4">
          {cart.items.map((item) => (
            <li
              key={item.id}
              className="flex gap-4 rounded-xl border border-border bg-card p-3 sm:p-4"
            >
              <Link
                href={href(`/sklep/${item.product.slug}`)}
                className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-muted"
              >
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={href(`/sklep/${item.product.slug}`)}
                      className="line-clamp-2 font-medium transition-colors hover:text-primary"
                    >
                      {item.product.name}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">
                      {item.product.sku}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`${t.remove} — ${item.product.name}`}
                    disabled={pending}
                    onClick={() => void run(removeItem(item.id))}
                  >
                    <Trash2 />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="-1"
                      disabled={pending}
                      onClick={() => void run(changeItemQuantity(item.id, -1))}
                    >
                      <Minus />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium tabular-nums">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="+1"
                      disabled={pending || item.quantity >= item.product.stock}
                      onClick={() => void run(changeItemQuantity(item.id, 1))}
                    >
                      <Plus />
                    </Button>
                  </div>

                  <span className="font-display text-lg font-semibold tabular-nums">
                    {formatPrice(item.lineTotal, locale)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <Button
          variant="ghost"
          size="sm"
          className="self-start text-muted-foreground"
          disabled={pending}
          onClick={() => void run(clear())}
        >
          <Trash2 />
          {t.clear}
        </Button>
      </div>

      <aside className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-semibold">{t.summary}</h2>

        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t.subtotal}</dt>
            <dd className="tabular-nums">{formatPrice(summary.subtotal, locale)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t.shipping}</dt>
            <dd className="tabular-nums">
              {summary.shippingCost === 0
                ? t.shippingFree
                : formatPrice(summary.shippingCost, locale)}
            </dd>
          </div>
        </dl>

        {summary.freeShippingRemainder > 0 ? (
          <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            {format(t.freeShippingRemainder, {
              amount: formatPrice(summary.freeShippingRemainder, locale),
            })}
          </p>
        ) : (
          <p className="rounded-md bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
            {t.freeShippingReached}
          </p>
        )}

        <Separator />

        <div className="flex items-baseline justify-between">
          <span className="font-medium">{t.total}</span>
          <span className="font-display text-2xl font-bold tabular-nums">
            {formatPrice(summary.total, locale)}
          </span>
        </div>

        <Link
          href={href("/zamowienie")}
          className={cn(buttonVariants({ size: "lg" }), "h-11 w-full")}
        >
          {t.checkout}
        </Link>
        <Link
          href={href("/sklep")}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "w-full")}
        >
          {t.continueShopping}
        </Link>
      </aside>
    </div>
  );
}
