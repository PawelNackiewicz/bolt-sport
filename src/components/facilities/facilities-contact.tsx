import { Container } from "@/src/components/ui";
import { officeHours } from "@/src/lib/facilities-data";
import { company } from "@/src/lib/site-data";

export function FacilitiesContact() {
  const rows: Array<[label: string, value: React.ReactNode]> = [
    [
      "Telefon",
      <a
        key="phone"
        href={company.phoneHref}
        className="transition-colors hover:text-primary"
      >
        {company.phone}
      </a>,
    ],
    [
      "E-mail",
      <a
        key="email"
        href={company.emailHref}
        className="transition-colors hover:text-primary"
      >
        {company.email}
      </a>,
    ],
    ["Produkcja", `${company.address.street}, ${company.address.city}`],
    ["Godziny", officeHours],
  ];

  return (
    <section
      id="kontakt"
      className="dark border-t border-border bg-background py-24 text-foreground sm:py-32 lg:py-44"
    >
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-20">
          <div data-reveal>
            <p className="kicker font-mono text-muted-foreground">Kontakt</p>
            <h2 className="mt-6 max-w-[12ch] font-display text-4xl leading-[1.15] font-bold tracking-tight uppercase sm:text-5xl lg:text-6xl">
              Zadzwoń albo umów wizję.
            </h2>
            <p className="mt-6 max-w-[56ch] text-muted-foreground">
              Najszybciej idzie telefonicznie — w pięć minut wiemy, czy w ogóle
              jesteśmy dobrym wykonawcą dla tego obiektu.
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
