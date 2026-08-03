import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import { Alert, Skeleton } from "@/src/components/ui";
import { AuthShell } from "@/src/components/shop/auth-shell";
import { LoginForm } from "@/src/components/shop/auth-forms";
import { getDictionary } from "@/src/i18n/dictionaries";
import { isLocale } from "@/src/i18n/config";
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from "@/src/lib/db/store";

type LoginPageProps = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: LoginPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { shop } = await getDictionary(lang);
  return { title: shop.auth.loginTitle };
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const { shop } = await getDictionary(lang);

  return (
    <AuthShell
      title={shop.auth.loginTitle}
      subtitle={shop.auth.loginSubtitle}
      footer={
        // Seeded demo credentials — this is a mock shop, not a real storefront.
        <Alert className="flex-col items-start gap-1">
          <span className="text-xs font-semibold">{shop.auth.demoAccountLabel}</span>
          <code className="font-mono text-xs">
            {DEMO_USER_EMAIL} / {DEMO_USER_PASSWORD}
          </code>
        </Alert>
      }
    >
      {/* LoginForm reads `?redirect=`, so it needs a Suspense boundary. */}
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
