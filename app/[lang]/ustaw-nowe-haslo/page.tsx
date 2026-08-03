import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuthShell } from "@/src/components/shop/auth-shell";
import { ResetPasswordForm } from "@/src/components/shop/auth-forms";
import { getDictionary } from "@/src/i18n/dictionaries";
import { isLocale } from "@/src/i18n/config";

type ResetPageProps = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata({ params }: ResetPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { shop } = await getDictionary(lang);
  return { title: shop.auth.resetTitle, robots: { index: false } };
}

export default async function ResetPasswordPage({ params, searchParams }: ResetPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const { token } = await searchParams;
  const { shop } = await getDictionary(lang);

  return (
    <AuthShell title={shop.auth.resetTitle} subtitle={shop.auth.resetSubtitle}>
      <ResetPasswordForm token={token ?? ""} />
    </AuthShell>
  );
}
