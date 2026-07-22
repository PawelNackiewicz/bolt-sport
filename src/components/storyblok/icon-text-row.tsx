import { createElement } from "react";

import { resolveIcon } from "@/src/lib/icons";
import type { IconTextRowStoryblok } from "@/src/types/component-types-sb";

type IconTextRowProps = {
  blok: IconTextRowStoryblok;
};

export function IconTextRow({ blok }: IconTextRowProps) {
  const icon = resolveIcon(blok.icon);

  return (
    <li className="flex items-start gap-4 border-border py-4 [&:not(:last-child)]:border-b">
      {icon && (
        <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-border bg-secondary text-primary">
          {createElement(icon, { className: "size-5" })}
        </span>
      )}
      <div className="flex flex-col gap-1">
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
