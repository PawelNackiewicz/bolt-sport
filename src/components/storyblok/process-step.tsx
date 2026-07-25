import { createElement } from "react";

import { resolveIcon } from "@/src/lib/icons";
import type { ProcessStepStoryblok } from "@/src/types/component-types-sb";

type ProcessStepProps = {
  blok: ProcessStepStoryblok;
  index?: number;
};

export function ProcessStep({ blok, index }: ProcessStepProps) {
  const icon = resolveIcon(blok.icon);

  return (
    <li className="flex flex-col gap-4 bg-card p-6 transition-colors hover:bg-accent/40">
      <div className="flex items-center justify-between">
        {icon && (
          <span className="grid size-11 place-items-center rounded-lg border border-border bg-secondary text-primary">
            {createElement(icon, { className: "size-5" })}
          </span>
        )}
        {index !== undefined && (
          <span className="font-display text-3xl font-bold text-muted-foreground/30">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        {blok.title && (
          <h3 className="font-display text-base font-semibold uppercase leading-tight tracking-tight">
            {blok.title}
          </h3>
        )}
        {blok.description && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {blok.description}
          </p>
        )}
      </div>
    </li>
  );
}
