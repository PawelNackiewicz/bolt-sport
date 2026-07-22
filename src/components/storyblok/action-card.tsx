"use client";

import { createElement } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { resolveIcon } from "@/src/lib/icons";
import { useI18n } from "@/src/i18n/i18n-provider";
import type { ActionCardStoryblok } from "@/src/types/component-types-sb";

type ActionCardProps = {
  blok: ActionCardStoryblok;
};

export function ActionCard({ blok }: ActionCardProps) {
  const { href } = useI18n();
  const icon = resolveIcon(blok.icon);

  return (
    <Link
      href={href(blok.link ?? "/")}
      className="group focus-visible:ring-ring/50 flex h-full flex-col justify-between gap-6 rounded-xl border border-border bg-card p-6 outline-none transition-colors focus-visible:ring-[3px] hover:border-primary/60 hover:bg-accent/40"
    >
      <div className="flex flex-col gap-4">
        {icon && (
          <span className="grid size-11 place-items-center rounded-lg border border-border bg-secondary text-primary">
            {createElement(icon, { className: "size-5" })}
          </span>
        )}
        <div className="flex flex-col gap-1.5">
          {blok.title && (
            <h3 className="font-display text-lg font-semibold uppercase tracking-tight leading-tight">
              {blok.title}
            </h3>
          )}
          {blok.text && (
            <p className="text-muted-foreground text-sm leading-relaxed">
              {blok.text}
            </p>
          )}
        </div>
      </div>
      {blok.linkLabel && (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          {blok.linkLabel}
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      )}
    </Link>
  );
}
