import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = {
  label: string;
  /** Ostatni okruszek to bieżąca strona — bez linku. */
  href?: string;
};

type BreadcrumbsProps = {
  items: Crumb[];
  label: string;
};

export function Breadcrumbs({ items, label }: BreadcrumbsProps) {
  return (
    <nav aria-label={label}>
      <ol className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className="flex min-w-0 items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className="truncate"
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight className="size-3 shrink-0 opacity-60" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
