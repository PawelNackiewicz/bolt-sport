"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

import { Button } from "@/src/components/ui";
import { useI18n } from "@/src/i18n/i18n-provider";
import type { Product, QuoteType } from "@/src/lib/shop/types";

import { QuoteForm } from "./quote-form";

/**
 * Replaces "add to cart" for quote-priced products: the enquiry form is
 * revealed in place rather than sending the visitor to another page.
 */
export function QuoteCta({ product }: { product: Product }) {
  const { dictionary } = useI18n();
  const [open, setOpen] = useState(false);
  const t = dictionary.shop.product;

  const defaultType: QuoteType =
    product.categorySlug === "klatki-mma"
      ? "klatka"
      : product.categorySlug === "ringi-bokserskie"
        ? "ring"
        : "wyposazenie-sali";

  if (open) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-display text-lg font-semibold">
          {dictionary.shop.quote.title}
        </h2>
        <QuoteForm product={product} defaultType={defaultType} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button size="lg" className="h-11 self-start px-8" onClick={() => setOpen(true)}>
        <MessageSquare />
        {t.askForQuote}
      </Button>
      <p className="text-sm text-muted-foreground">{t.quoteHint}</p>
    </div>
  );
}
