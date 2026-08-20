import { Container } from "@/src/components/ui";
import { facilityTypes } from "@/src/lib/facilities-data";
import { cn } from "@/src/lib/utils";
import { SectionHeading } from "./section-heading";

export function FacilityTypes() {
  return (
    <section
      id="typy"
      className="dark bg-background py-24 text-foreground sm:py-32 lg:py-44"
    >
      <Container>
        <SectionHeading
          title={
            <>
              Cztery rodzaje
              <br />
              zleceń.
            </>
          }
          eyebrow="Wybierz najbliższy — kwalifikator dobierze resztę"
        />

        <div className="grid border-t border-border sm:grid-cols-2 xl:grid-cols-4">
          {facilityTypes.map((type, index) => (
            <div
              key={type.kind}
              data-reveal
              className={cn(
                "flex min-h-[46vh] flex-col border-b border-border p-6 transition-colors duration-300 hover:bg-foreground/3 sm:p-8",
                // Vertical rules follow the column count at each breakpoint.
                index % 2 !== 0 && "sm:border-l",
                index > 0 && "xl:border-l",
              )}
            >
              <div className="kicker font-mono text-muted-foreground">
                {type.kind}
              </div>
              <h3 className="my-4 font-display text-xl font-semibold tracking-tight uppercase sm:text-2xl">
                {type.title}
              </h3>
              <p className="text-sm text-muted-foreground">{type.description}</p>
              <div className="mt-auto border-t border-border pt-5 font-mono text-base text-primary">
                {type.budget}
              </div>
              <a
                href="#kwalifikator"
                className="kicker mt-4 font-mono transition-colors hover:text-primary"
              >
                Sprawdź zakres →
              </a>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
