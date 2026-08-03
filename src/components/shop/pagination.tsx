import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/src/components/ui";
import type { Dictionary } from "@/src/i18n/config";
import { format } from "@/src/lib/shop/i18n-helpers";
import { cn } from "@/src/lib/utils";

type PaginationProps = {
  page: number;
  totalPages: number;
  dictionary: Dictionary;
  /** Builds the href for a page, preserving the current filters. */
  buildHref: (page: number) => string;
};

/** Plain links, so pagination works without JavaScript and stays shareable. */
export function Pagination({ page, totalPages, dictionary, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const t = dictionary.shop.listing;
  const disabled = "pointer-events-none opacity-40";

  return (
    <nav
      aria-label={t.pageOf.replace(/\{\w+\}/g, "").trim()}
      className="flex items-center justify-between gap-4 border-t border-border pt-6"
    >
      <Link
        href={buildHref(page - 1)}
        aria-disabled={page <= 1}
        tabIndex={page <= 1 ? -1 : undefined}
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), page <= 1 && disabled)}
      >
        <ChevronLeft />
        {t.previous}
      </Link>

      <span className="font-mono text-xs text-muted-foreground tabular-nums">
        {format(t.pageOf, { page, total: totalPages })}
      </span>

      <Link
        href={buildHref(page + 1)}
        aria-disabled={page >= totalPages}
        tabIndex={page >= totalPages ? -1 : undefined}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          page >= totalPages && disabled,
        )}
      >
        {t.next}
        <ChevronRight />
      </Link>
    </nav>
  );
}
