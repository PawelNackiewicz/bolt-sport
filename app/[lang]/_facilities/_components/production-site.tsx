import { Container } from "@/src/components/ui";
import type { FacilitiesDictionary } from "../_lib/types";

type ProductionSiteProps = { content: FacilitiesDictionary["production"] };

/**
 * Theme-aware breather between two cinematic bands — light in the light theme,
 * dark in the dark one.
 */
export function ProductionSite({ content }: ProductionSiteProps) {
  return (
    <section
      id="krasiejow"
      className="flex min-h-svh items-center bg-background py-24 text-foreground sm:py-32 lg:py-44"
    >
      <Container>
        <div data-reveal>
          <p className="kicker font-mono text-muted-foreground">
            {content.kicker}
          </p>
          <h2 className="mt-7 max-w-[14ch] font-display text-4xl leading-[1.15] font-bold tracking-tight uppercase sm:text-6xl lg:text-7xl">
            {content.heading[0]}
            <br />
            {content.heading[1]}
          </h2>
          <p className="mt-8 max-w-[56ch] text-muted-foreground">
            {content.paragraph}
          </p>
        </div>

        <dl className="mt-12 flex flex-wrap gap-x-8 gap-y-6 border-t border-border pt-6 sm:gap-x-14 lg:mt-20 lg:gap-x-20">
          {content.meta.map(([label, value]) => (
            <div key={label}>
              <dt className="kicker font-mono text-muted-foreground">
                {label}
              </dt>
              <dd className="mt-2 font-mono text-[15px] tracking-[0.04em] text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
