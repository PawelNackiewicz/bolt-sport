"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { buttonVariants } from "@/src/components/ui";
import { useI18n } from "@/src/i18n/i18n-provider";
import { cn } from "@/src/lib/utils";

import { useCart } from "./cart-provider";

/** Header cart link with a live item counter. */
export function CartButton({ className }: { className?: string }) {
  const { dictionary, href } = useI18n();
  const { itemsCount } = useCart();
  const t = dictionary.shop.nav;

  return (
    <Link
      href={href("/koszyk")}
      aria-label={`${t.cart} — ${itemsCount} ${dictionary.shop.common.pieces}`}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon" }),
        "relative",
        className,
      )}
    >
      <ShoppingCart className="size-5" />
      {itemsCount > 0 ? (
        <span
          aria-hidden
          className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] leading-none font-semibold text-primary-foreground tabular-nums"
        >
          {itemsCount > 99 ? "99+" : itemsCount}
        </span>
      ) : null}
    </Link>
  );
}
