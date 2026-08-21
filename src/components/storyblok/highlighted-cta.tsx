import type { HighlightedCtaStoryblok } from "@/src/types/component-types-sb";
import { ActionButton } from "./action-button";

type HighlightedCtaProps = {
  blok: HighlightedCtaStoryblok;
};

export function HighlightedCta({ blok }: HighlightedCtaProps) {
  const primary = blok.button_primary ?? [];
  const secondary = blok.button_secondary ?? [];
  const buttons = [...primary, ...secondary];

  return (
    <section className="dark flex flex-col items-center gap-5 rounded-lg bg-card px-6 py-12 text-center sm:px-12 sm:py-14">
      {blok.pre_title && (
        <span className="kicker text-primary">{blok.pre_title}</span>
      )}
      {blok.title && (
        <h2 className="max-w-xl font-sans text-2xl font-bold leading-tight tracking-tight text-card-foreground sm:text-3xl">
          {blok.title}
        </h2>
      )}
      {blok.description && (
        <p className="max-w-md whitespace-pre-line text-muted-foreground leading-relaxed">
          {blok.description.trim()}
        </p>
      )}

      {buttons.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {buttons.map((button) => (
            <ActionButton key={button._uid} blok={button} onDark />
          ))}
        </div>
      )}
    </section>
  );
}
