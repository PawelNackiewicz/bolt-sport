"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";

import { Alert, Button, Input, Label, buttonVariants } from "@/src/components/ui";
import { useI18n } from "@/src/i18n/i18n-provider";
import { translateError } from "@/src/lib/shop/i18n-helpers";
import type { Product } from "@/src/lib/shop/types";
import { cn } from "@/src/lib/utils";

import { useCart } from "./cart-provider";

/**
 * Quantity picker plus the add button. Only rendered for purchasable products —
 * quote-priced ones show the enquiry CTA instead.
 */
export function AddToCart({ product }: { product: Product }) {
  const { dictionary, href } = useI18n();
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [state, setState] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const t = dictionary.shop.product;
  const outOfStock = product.stock <= 0;

  const handleAdd = async () => {
    setState("saving");
    setError(null);

    const failure = await addItem(product.id, quantity);

    if (failure) {
      setError(translateError(dictionary, failure));
      setState("idle");
      return;
    }

    setState("done");
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex w-24 flex-col gap-1.5">
          <Label htmlFor="quantity">{t.quantity}</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            disabled={outOfStock}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (!Number.isFinite(next)) return;
              setQuantity(Math.min(Math.max(1, Math.trunc(next)), product.stock));
              setState("idle");
            }}
          />
        </div>

        <Button
          size="lg"
          className="h-10 flex-1 sm:flex-none sm:px-8"
          disabled={outOfStock || state === "saving"}
          onClick={handleAdd}
        >
          {state === "saving" ? (
            t.adding
          ) : (
            <>
              <ShoppingCart />
              {outOfStock ? t.outOfStock : t.addToCart}
            </>
          )}
        </Button>
      </div>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {state === "done" ? (
        <Alert variant="success" className="items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <Check />
            {t.added}
          </span>
          <Link
            href={href("/koszyk")}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0")}
          >
            {t.goToCart}
          </Link>
        </Alert>
      ) : null}
    </div>
  );
}
