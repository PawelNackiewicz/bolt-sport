import { Container } from "@/src/components/ui";
import { processPhases } from "@/src/lib/facilities-data";
import { cn } from "@/src/lib/utils";
import { SectionHeading } from "./section-heading";

export function ProcessTimeline() {
  return (
    <section
      id="proces"
      className="bg-background py-24 text-foreground sm:py-32 lg:py-44"
    >
      <Container>
        <SectionHeading
          title={
            <>
              Jak z nami
              <br />
              pracujesz.
            </>
          }
          eyebrow="Od telefonu do odbioru"
        />

        <div className="grid border-t border-border sm:grid-cols-2 xl:grid-cols-5">
          {processPhases.map((phase, index) => (
            <div
              key={phase.number}
              data-reveal
              className={cn(
                "flex flex-col border-b border-border p-6 sm:min-h-[34vh] sm:p-7",
                index % 2 !== 0 && "sm:border-l",
                index > 0 && "xl:border-l",
              )}
            >
              <div className="kicker font-mono text-primary">
                {phase.number}
              </div>
              <h3 className="my-3.5 font-display text-lg font-semibold tracking-tight uppercase sm:text-xl">
                {phase.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {phase.description}
              </p>
              <div className="kicker mt-auto pt-5 font-mono text-muted-foreground">
                {phase.duration}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
