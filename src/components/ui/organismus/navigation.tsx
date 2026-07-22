"use client";

import { useState } from "react";
import { Menu, PhoneCall } from "lucide-react";

import Link from "next/link";

import {
  Button,
  buttonVariants,
  Separator,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Container,
  Logo,
  ThemeToggle,
  LanguageSwitcher,
} from "@/src/components/ui";
import { cn } from "@/src/lib/utils";
import { navItems, company } from "@/src/lib/site-data";
import { useI18n } from "@/src/i18n/i18n-provider";

export function Navigation() {
  const [open, setOpen] = useState(false);
  const { dictionary, href } = useI18n();
  const t = dictionary.nav;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href={href("/")} aria-label={`${company.name} — ${t.home}`}>
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={href(item.href)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t.items[item.key]}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <Link
            href={href("/#kontakt")}
            className={cn(buttonVariants(), "hidden sm:inline-flex")}
          >
            {t.quote}
          </Link>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="lg:hidden"
                  aria-label={t.openMenu}
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Logo />
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1 px-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={href(item.href)}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    {t.items[item.key]}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3 p-4">
                <Separator />
                <a
                  href={company.phoneHref}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <PhoneCall className="size-4 text-primary" />
                  {company.phone}
                </a>
                <Link
                  href={href("/#kontakt")}
                  onClick={() => setOpen(false)}
                  className={cn(buttonVariants({ size: "lg" }), "w-full")}
                >
                  {t.quote}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
