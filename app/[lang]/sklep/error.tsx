"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button, Container } from "@/src/components/ui";
import { useI18n } from "@/src/i18n/i18n-provider";

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { dictionary } = useI18n();
  const t = dictionary.shop.common;

  useEffect(() => {
    console.error("[sklep] Render error:", error);
  }, [error]);

  return (
    <main className="py-20">
      <Container className="flex flex-col items-center gap-4 text-center">
        <AlertTriangle className="size-8 text-destructive" />
        <h1 className="font-display text-2xl font-bold">{t.errorTitle}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{t.errorHint}</p>
        <Button size="lg" onClick={reset}>
          {t.retry}
        </Button>
      </Container>
    </main>
  );
}
