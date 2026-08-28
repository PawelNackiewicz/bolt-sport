import { Container } from "@/src/components/ui";
import type { FacilitiesDictionary } from "../_lib/types";
import { company } from "@/src/lib/site-data";

type FacilitiesContactProps = { content: FacilitiesDictionary["contact"] };

export function FacilitiesContact({ content }: FacilitiesContactProps) {
  const rows: Array<[label: string, value: React.ReactNode]> = [
    [
      content.labels.phone,
      <a
        key="phone"
        href={company.phoneHref}
        className="transition-colors hover:text-primary"
      >
        {company.phone}
      </a>,
    ],
    [
      content.labels.email,
      <a
        key="email"
        href={company.emailHref}
        className="transition-colors hover:text-primary"
      >
        {company.email}
      </a>,
    ],
    [content.labels.production, `${company.address.street}, ${company.address.city}`],
    [content.labels.hours, content.officeHours],
  ];

  return (
    <section
      id="kontakt"
      className="dark border-t border-border bg-background py-24 text-foreground sm:py-32 lg:py-44"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div data-reveal>
            <p className="kicker font-mono text-muted-foreground">
              {content.kicker}
            </p>
            <h2 className="mt-6 max-w-[12ch] font-display text-4xl leading-[1.15] font-bold tracking-tight uppercase sm:text-5xl lg:text-6xl">
              {content.heading}
            </h2>
            <p className="mt-6 max-w-[56ch] text-muted-foreground">
              {content.paragraph}
            </p>
          </div>

          <dl className="lg:mt-12">
            {rows.map(([label, value]) => (
              <div
                key={label}
                data-reveal
                className="flex justify-between gap-5 border-t border-border py-4 font-mono text-[15px]"
              >
                <dt className="kicker text-muted-foreground">{label}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
