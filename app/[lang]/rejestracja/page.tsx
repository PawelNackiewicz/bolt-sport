import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuthShell } from "@/src/components/shop/auth-shell";
import { RegisterForm } from "@/src/components/shop/auth-forms";
import { getDictionary } from "@/src/i18n/dictionaries";
import { isLocale } from "@/src/i18n/config";

type RegisterPageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: RegisterPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { shop } = await getDictionary(lang);
  return { title: shop.auth.registerTitle };
}

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const { shop } = await getDictionary(lang);

  return (
    <AuthShell title={shop.auth.registerTitle} subtitle={shop.auth.registerSubtitle}>
      <RegisterForm />
    </AuthShell>
  );
}
