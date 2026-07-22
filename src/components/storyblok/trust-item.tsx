"use client";

import { createElement } from "react";
import Link from "next/link";

import { cn } from "@/src/lib/utils";
import { resolveIcon } from "@/src/lib/icons";
import { useI18n } from "@/src/i18n/i18n-provider";
import type { TrustItemStoryblok } from "@/src/types/component-types-sb";

type TrustItemProps = {
  blok: TrustItemStoryblok;
};

export function TrustItem({ blok }: TrustItemProps) {
  const { href } = useI18n();
  const icon = resolveIcon(blok.icon);

  const content = (
    <>
      {icon && createElement(icon, { className: "size-4 text-primary" })}
      {blok.label}
      {blok.value && (
        <span
          className={cn(
            blok.highlight
              ? "font-semibold text-foreground"
              : "text-muted-foreground",
          )}
        >
          {blok.value}
        </span>
      )}
    </>
  );

  return (
    <li
      className={cn(
        "flex items-center gap-2 text-sm font-medium",
        blok.highlight ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {blok.link ? (
        <Link
          href={href(blok.link)}
          className="flex items-center gap-2 transition-colors hover:text-foreground"
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </li>
  );
}
