import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PackageSearch } from "lucide-react";

import { Container, Separator, buttonVariants } from "@/src/components/ui";
import { ChangePasswordForm, LogoutButton } from "@/src/components/shop/auth-forms";
import { getDictionary } from "@/src/i18n/dictionaries";
import { isLocale, localePath } from "@/src/i18n/config";
import { getSession } from "@/src/lib/auth/session";
import { loginPath } from "@/src/lib/shop/redirects";
import { cn } from "@/src/lib/utils";

type AccountPageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: AccountPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { shop } = await getDictionary(lang);
  return { title: shop.account.title, robots: { index: false } };
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  // proxy.ts already blocks anonymous access, but it only checks the cookie
  // signature. This is the authoritative check — it also catches sessions
  // invalidated by a password change.
  const user = await getSession();
  if (!user) redirect(loginPath(lang, "/konto"));

  const dictionary = await getDictionary(lang);
  const t = dictionary.shop.account;

  return (
    <main className="py-10 sm:py-14">
      <Container className="flex max-w-3xl flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t.title}
          </h1>
          <LogoutButton />
        </div>

        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">{t.profile}</h2>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">
                {dictionary.shop.auth.firstName} {dictionary.shop.auth.lastName}
              </dt>
              <dd className="font-medium">
                {user.firstName} {user.lastName}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">{dictionary.shop.auth.email}</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            {user.phone ? (
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs text-muted-foreground">{dictionary.shop.auth.phone}</dt>
                <dd className="font-medium">{user.phone}</dd>
              </div>
            ) : null}
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">{t.memberSince}</dt>
              <dd className="font-medium">
                {new Date(user.createdAt).toLocaleDateString(lang)}
              </dd>
            </div>
          </dl>

          <Separator />

          <Link
            href={localePath(lang, "/konto/zamowienia")}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "self-start")}
          >
            <PackageSearch />
            {t.orders}
          </Link>
        </section>

        <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-semibold">{t.changePassword}</h2>
          <ChangePasswordForm />
        </section>
      </Container>
    </main>
  );
}
