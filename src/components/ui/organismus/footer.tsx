import { Phone, Mail, MapPin } from "lucide-react";

import Link from "next/link";

import { Container, Logo, Separator } from "@/src/components/ui";
import { navItems, company } from "@/src/lib/site-data";
import { localePath, type Dictionary, type Locale } from "@/src/i18n/config";
import type { ContactData } from "@/src/lib/storyblok";

type FooterProps = {
  locale: Locale;
  dictionary: Dictionary;
  contactData: ContactData | null;
};

export function Footer({ locale, dictionary, contactData }: FooterProps) {
  const href = (path: string) => localePath(locale, path);
  const t = dictionary.footer;
  const navT = dictionary.nav;

  const phone = contactData?.phone || company.phone;
  const phoneHref = `tel:${phone.replace(/\s+/g, "")}`;
  const email = contactData?.email || company.email;
  const emailHref = `mailto:${email}`;
  const address =
    contactData?.address ||
    `${company.address.street}, ${company.address.city}`;
  const nip = contactData?.nip || company.registry.nip;
  const krs = contactData?.krs || company.registry.krs;
  const regon = contactData?.regon || company.registry.regon;
  const legalName = contactData?.legalName || company.legalName;

  return (
    <footer className="border-t border-border bg-card/30">
      <Container className="flex flex-col gap-10 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div className="flex flex-col gap-4">
            <Logo />
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
              {t.description}
            </p>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <a
                  href={phoneHref}
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="size-4 text-primary" />
                  {phone}
                </a>
              </li>
              <li>
                <a
                  href={emailHref}
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="size-4 text-primary" />
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4 text-primary" />
                {address}
              </li>
            </ul>
          </div>

          <nav className="flex flex-col gap-3">
            <span className="kicker text-muted-foreground">
              {t.navHeading}
            </span>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={href(item.href)}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {navT.items[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Separator />

        <div className="flex flex-col gap-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            {legalName} · {address}
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <span>NIP: {nip}</span>
            <span>KRS: {krs}</span>
            <span>REGON: {regon}</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
