import { Container } from "@/src/components/ui";
import type { FacilitiesDictionary } from "../_lib/types";
import { SectionHeading } from "./section-heading";

type FacilitiesFaqProps = { content: FacilitiesDictionary["faq"] };

export function FacilitiesFaq({ content }: FacilitiesFaqProps) {
  return (
    <section
      id="faq"
      className="dark bg-background py-24 text-foreground sm:py-32 lg:py-44"
    >
      <Container>
        <SectionHeading
          title={
            <>
              {content.heading[0]}
              <br />
              {content.heading[1]}
            </>
          }
          eyebrow={content.eyebrow}
        />

        <div className="border-t border-border">
          {content.items.map((entry) => (
            <details
              key={entry.question}
              data-reveal
              className="group border-b border-border"
            >
              <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-5 font-display text-lg font-semibold tracking-tight uppercase after:flex-none after:font-mono after:text-primary after:content-['+'] group-open:after:content-['–'] sm:py-7 sm:text-xl [&::-webkit-details-marker]:hidden">
                {entry.question}
              </summary>
              <p className="max-w-[74ch] pb-5 text-muted-foreground sm:pb-7">
                {entry.answer}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
