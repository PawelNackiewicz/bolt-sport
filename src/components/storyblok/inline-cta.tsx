import { Phone } from "lucide-react";

import type { InlineCtaStoryblok } from "@/src/types/component-types-sb";
import { ActionButton } from "./action-button";

type InlineCtaProps = {
  blok: InlineCtaStoryblok;
};

export function InlineCta({ blok }: InlineCtaProps) {
  const buttons = blok.cta_button ?? [];

  return (
    <aside className="flex flex-col gap-6 rounded-lg border border-primary/20 border-l-3 border-l-primary bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:p-7">
      <div className="flex flex-col gap-2">
        {blok.pre_title && (
          <span className="kicker text-primary">{blok.pre_title}</span>
        )}
        {blok.title && (
          <p className="font-sans text-lg font-bold leading-snug tracking-tight text-foreground">
            {blok.title}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
        {buttons.map((button) => (
          <ActionButton key={button._uid} blok={button} />
        ))}
        {blok.phone && (
          <a
            href={`tel:${blok.phone.replace(/\s+/g, "")}`}
            className="flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
          >
            <Phone className="size-4 text-primary" />
            {blok.phone}
          </a>
        )}
      </div>
    </aside>
  );
}
