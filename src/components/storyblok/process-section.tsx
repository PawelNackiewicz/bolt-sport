import { Container } from "@/src/components/ui";
import type { ProcessSectionStoryblok } from "@/src/types/component-types-sb";
import { ProcessStep } from "./process-step";

type ProcessSectionProps = {
  blok: ProcessSectionStoryblok;
};

export function ProcessSection({ blok }: ProcessSectionProps) {
  const steps = blok.steps ?? [];

  if (steps.length === 0) return null;

  const hasHeading = blok.pre_title || blok.title || blok.description;

  return (
    <section className="scroll-mt-20 py-16 sm:py-20">
      <Container className="flex flex-col gap-12">
        {hasHeading && (
          <div className="flex flex-col gap-3">
            {blok.pre_title && (
              <span className="kicker flex items-center gap-2 text-primary">
                <span className="inline-block h-px w-6 bg-primary" />
                {blok.pre_title}
              </span>
            )}
            {blok.title && (
              <h2 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                {blok.title}
              </h2>
            )}
            {blok.description && (
              <p className="text-muted-foreground max-w-2xl leading-relaxed">
                {blok.description}
              </p>
            )}
          </div>
        )}

        <ol className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => (
            <ProcessStep key={step._uid} blok={step} index={index} />
          ))}
        </ol>
      </Container>
    </section>
  );
}
