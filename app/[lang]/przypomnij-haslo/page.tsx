import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuthShell } from "@/src/components/shop/auth-shell";
import { ForgotPasswordForm } from "@/src/components/shop/auth-forms";
import { getDictionary } from "@/src/i18n/dictionaries";
import { isLocale } from "@/src/i18n/config";

type ForgotPageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: ForgotPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { shop } = await getDictionary(lang);
  return { title: shop.auth.forgotTitle };
}

export default async function ForgotPasswordPage({ params }: ForgotPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const { shop } = await getDictionary(lang);

  return (
    <AuthShell title={shop.auth.forgotTitle} subtitle={shop.auth.forgotSubtitle}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
