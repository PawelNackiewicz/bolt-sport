"use client";

import { Phone, Mail, MapPin } from "lucide-react";

import Link from "next/link";

import { Container, Logo, Separator } from "@/src/components/ui";
import { navItems, company } from "@/src/lib/site-data";
import { useI18n } from "@/src/i18n/i18n-provider";

export function Footer() {
  const { dictionary, href } = useI18n();
  const t = dictionary.footer;
  const navT = dictionary.nav;

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
                  href={company.phoneHref}
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Phone className="size-4 text-primary" />
                  {company.phone}
                </a>
              </li>
              <li>
                <a
                  href={company.emailHref}
                  className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Mail className="size-4 text-primary" />
                  {company.email}
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-4 text-primary" />
                {company.address.street}, {company.address.city}
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
            {company.legalName} · {company.address.street},{" "}
            {company.address.city}
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <span>NIP: {company.registry.nip}</span>
            <span>KRS: {company.registry.krs}</span>
            <span>REGON: {company.registry.regon}</span>
          </p>
        </div>
      </Container>
    </footer>
  );
}
