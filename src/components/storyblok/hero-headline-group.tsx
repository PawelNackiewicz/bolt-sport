import { createElement } from "react";

import { resolveIcon } from "@/src/lib/icons";
import type { HeroHeadlineGroupStoryblok } from "@/src/types/component-types-sb";

type HeroHeadlineGroupProps = {
  blok: HeroHeadlineGroupStoryblok;
};

const DEFAULT_TITLE = "Sprzęt do sportów walki";

export function HeroHeadlineGroup({ blok }: HeroHeadlineGroupProps) {
  const icon = resolveIcon(blok.eyebrow_icon);
  const hasSplitTitle = blok.title_prefix || blok.title_highlight;

  return (
    <>
      <span className="kicker flex items-center gap-2 text-primary">
        <span className="inline-block h-px w-6 bg-primary" />
        {icon && createElement(icon, { className: "size-4" })}
        {blok.eyebrow}
      </span>

      <h1 className="text-4xl leading-[0.98] font-bold tracking-tight uppercase sm:text-5xl lg:text-6xl xl:text-7xl">
        {hasSplitTitle ? (
          <>
            {blok.title_prefix}
            {blok.title_prefix && blok.title_highlight && (
              <br className="hidden sm:block" />
            )}{" "}
            <span className="text-primary">{blok.title_highlight}</span>
          </>
        ) : (
          (blok.title ?? DEFAULT_TITLE)
        )}
      </h1>
    </>
  );
}
