import { Container } from "@/src/components/ui";
import { productionMeta } from "@/src/lib/facilities-data";

/**
 * Theme-aware breather between two cinematic bands — light in the light theme,
 * dark in the dark one.
 */
export function ProductionSite() {
  return (
    <section
      id="krasiejow"
      className="flex min-h-svh items-center bg-background py-24 text-foreground sm:py-32 lg:py-44"
    >
      <Container>
        <div data-reveal>
          <p className="kicker font-mono text-muted-foreground">
            Produkcja własna
          </p>
          <h2 className="mt-7 max-w-[14ch] font-display text-4xl leading-[1.15] font-bold tracking-tight uppercase sm:text-6xl lg:text-7xl">
            Wszystko powstaje u nas.
            <br />
            Krasiejów.
          </h2>
          <p className="mt-8 max-w-[56ch] text-muted-foreground">
            Spawalnia, tapicernia, krojownia i lakiernia w jednej hali. Nie
            pośredniczymy w sprzedaży cudzego sprzętu — dlatego nietypowy wymiar
            ringu czy kolor lin to zmiana w rysunku, a nie powód do odmowy.
          </p>
        </div>

        <dl className="mt-12 flex flex-wrap gap-x-8 gap-y-6 border-t border-border pt-6 sm:gap-x-14 lg:mt-20 lg:gap-x-20">
          {productionMeta.map(([label, value]) => (
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
