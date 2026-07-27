"use client";

import { useEffect, useState } from "react";

import type { EnvVarStatus } from "@/src/lib/env-check";

type NotFoundDebugPanelProps = {
  envStatuses: EnvVarStatus[];
  renderedAt: string;
  nodeEnv: string;
};

/**
 * global-not-found.tsx bypasses normal App Router rendering, so there is no
 * router context here — `usePathname()` doesn't work. We read the path
 * straight from `window.location` instead, client-side only.
 */
export function NotFoundDebugPanel({
  envStatuses,
  renderedAt,
  nodeEnv,
}: NotFoundDebugPanelProps) {
  // Lazy initializer runs once on the client during hydration — avoids a
  // setState-in-effect render cascade just to read window.location.
  const [path] = useState<string | null>(() =>
    typeof window === "undefined"
      ? null
      : window.location.pathname + window.location.search,
  );

  useEffect(() => {
    console.error("[global-not-found]", {
      path,
      referrer: document.referrer || null,
      renderedAt,
      envStatuses,
    });
  }, [path, envStatuses, renderedAt]);

  return (
    <div className="mt-6 w-full max-w-md rounded-lg border border-border bg-card p-4 text-left text-xs text-card-foreground">
      <p className="mb-2 font-semibold uppercase tracking-wide text-muted-foreground">
        Debug
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
        <dt className="text-muted-foreground">Ścieżka</dt>
        <dd className="truncate font-mono">{path ?? "…"}</dd>

        <dt className="text-muted-foreground">Środowisko</dt>
        <dd className="font-mono">{nodeEnv}</dd>

        <dt className="text-muted-foreground">Czas</dt>
        <dd className="font-mono">{renderedAt}</dd>
      </dl>

      <p className="mb-1 mt-3 font-semibold uppercase tracking-wide text-muted-foreground">
        Zmienne środowiskowe
      </p>
      <ul className="space-y-0.5">
        {envStatuses.map((status) => (
          <li key={status.name} className="flex items-center justify-between gap-2 font-mono">
            <span className="truncate">{status.name}</span>
            <span
              className={
                status.present
                  ? "text-emerald-600 dark:text-emerald-400"
                  : status.required
                    ? "text-destructive"
                    : "text-muted-foreground"
              }
            >
              {status.present ? status.display : status.required ? "BRAK" : "brak"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
