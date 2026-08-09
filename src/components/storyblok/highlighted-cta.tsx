import type { HighlightedCtaStoryblok } from "@/src/types/component-types-sb";
import { ActionButton } from "./action-button";

type HighlightedCtaProps = {
  blok: HighlightedCtaStoryblok;
};

const PANEL_BG = "bg-[oklch(0.185_0.004_285)]";
const PANEL_HEADING = "text-[oklch(0.97_0.002_286)]";
const PANEL_BODY = "text-[oklch(0.712_0.012_286)]";

export function HighlightedCta({ blok }: HighlightedCtaProps) {
  const primary = blok.button_primary ?? [];
  const secondary = blok.button_secondary ?? [];
  const buttons = [...primary, ...secondary];

  return (
    <section
      className={`${PANEL_BG} flex flex-col items-center gap-5 rounded-lg px-6 py-12 text-center sm:px-12 sm:py-14`}
    >
      {blok.pre_title && (
        <span className="kicker text-primary">{blok.pre_title}</span>
      )}
      {blok.title && (
        <h2
          className={`${PANEL_HEADING} max-w-xl font-sans text-2xl font-bold leading-tight tracking-tight sm:text-3xl`}
        >
          {blok.title}
        </h2>
      )}
      {blok.description && (
        <p className={`${PANEL_BODY} max-w-md whitespace-pre-line leading-relaxed`}>
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
