import { Container } from "@/src/components/ui";

/** Shared frame for the four standalone auth screens. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="py-12 sm:py-20">
      <Container className="flex max-w-md flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle ? <p className="text-muted-foreground">{subtitle}</p> : null}
        </header>

        <div className="rounded-xl border border-border bg-card p-6">{children}</div>

        {footer}
      </Container>
    </main>
  );
}
