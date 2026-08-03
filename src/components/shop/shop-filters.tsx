"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { Button, Checkbox, Input, Label, Select } from "@/src/components/ui";
import { useI18n } from "@/src/i18n/i18n-provider";
import { translateCategory } from "@/src/lib/shop/i18n-helpers";
import type { CategoryWithCount, ProductSort } from "@/src/lib/shop/types";

const SORT_VALUES: ProductSort[] = ["newest", "price-asc", "price-desc", "name-asc"];

/**
 * Every filter lives in the URL, so a filtered listing can be linked, shared
 * and restored by a reload. The component only ever rewrites `searchParams`;
 * the page re-renders on the server with the new query.
 */
export function ShopFilters({ categories }: { categories: CategoryWithCount[] }) {
  const { dictionary } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const t = dictionary.shop.listing;

  const apply = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    // Any filter change invalidates the current page number.
    params.delete("page");

    startTransition(() => {
      router.push(params.size > 0 ? `${pathname}?${params}` : pathname, {
        scroll: false,
      });
    });
  };

  /** Empty values are removed so the URL only carries active filters. */
  const setParam = (params: URLSearchParams, key: string, value: string) => {
    if (value.trim() === "") params.delete(key);
    else params.set(key, value.trim());
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    apply((params) => {
      setParam(params, "q", String(data.get("q") ?? ""));
      setParam(params, "minPrice", toGrosze(String(data.get("minPrice") ?? "")));
      setParam(params, "maxPrice", toGrosze(String(data.get("maxPrice") ?? "")));
    });
  };

  const hasFilters = ["q", "category", "minPrice", "maxPrice", "inStock", "tags"].some(
    (key) => searchParams.has(key),
  );

  return (
    <aside className="flex flex-col gap-6" data-pending={pending || undefined}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold tracking-wide uppercase">
          <SlidersHorizontal className="size-4 text-primary" />
          {t.filters}
        </h2>

        {hasFilters ? (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => startTransition(() => router.push(pathname, { scroll: false }))}
          >
            <X />
            {t.clearFilters}
          </Button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-q">{t.search}</Label>
          <Input
            id="filter-q"
            name="q"
            type="search"
            defaultValue={searchParams.get("q") ?? ""}
            placeholder={t.searchPlaceholder}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-category">{t.category}</Label>
          <Select
            id="filter-category"
            value={searchParams.get("category") ?? ""}
            onChange={(event) =>
              apply((params) => setParam(params, "category", event.target.value))
            }
          >
            <option value="">{t.allCategories}</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {translateCategory(dictionary, category.slug, category.name)} (
                {category.productCount})
              </option>
            ))}
          </Select>
        </div>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-medium">{t.price}</legend>
          <div className="flex items-center gap-2">
            <Input
              name="minPrice"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              aria-label={t.priceFrom}
              placeholder={t.priceFrom}
              defaultValue={toZlote(searchParams.get("minPrice"))}
            />
            <span aria-hidden className="text-muted-foreground">
              —
            </span>
            <Input
              name="maxPrice"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              aria-label={t.priceTo}
              placeholder={t.priceTo}
              defaultValue={toZlote(searchParams.get("maxPrice"))}
            />
          </div>
        </fieldset>

        <div className="flex items-center gap-2">
          <Checkbox
            id="filter-stock"
            checked={searchParams.get("inStock") === "true"}
            onChange={(event) =>
              apply((params) => {
                if (event.target.checked) params.set("inStock", "true");
                else params.delete("inStock");
              })
            }
          />
          <Label htmlFor="filter-stock" className="font-normal">
            {t.inStockOnly}
          </Label>
        </div>

        <Button type="submit" variant="outline" size="lg" disabled={pending}>
          {t.apply}
        </Button>
      </form>
    </aside>
  );
}

/** Sort sits above the grid rather than in the filter column. */
export function SortSelect() {
  const { dictionary } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = dictionary.shop.listing;

  return (
    <div className="flex items-center gap-2">
      <Label htmlFor="sort" className="shrink-0 text-muted-foreground">
        {t.sort}
      </Label>
      <Select
        id="sort"
        value={searchParams.get("sort") ?? "newest"}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("sort", event.target.value);
          params.delete("page");
          router.push(`${pathname}?${params}`, { scroll: false });
        }}
        className="w-auto min-w-44"
      >
        {SORT_VALUES.map((value) => (
          <option key={value} value={value}>
            {t.sortOptions[value]}
          </option>
        ))}
      </Select>
    </div>
  );
}

/** The URL carries grosze; the inputs show whole złote. */
function toGrosze(value: string): string {
  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed) || parsed <= 0) return "";
  return String(Math.round(parsed * 100));
}

function toZlote(value: string | null): string {
  if (!value) return "";
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "";
  return String(Math.round(parsed / 100));
}
