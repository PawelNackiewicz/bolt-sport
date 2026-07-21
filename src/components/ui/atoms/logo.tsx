import Image from "next/image";

import { cn } from "@/src/lib/utils";
import { company } from "@/src/lib/site-data";
import logoMark from "@/public/bolt-sport-small.png";

/**
 * Ring-Sport logo. The artwork uses black ring posts that read fine on light
 * surfaces but would vanish on the dark theme, so a white chip is applied only
 * in dark mode to keep the mark legible everywhere.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center justify-center rounded-lg px-2.5 py-2 dark:bg-white dark:shadow-sm",
        className,
      )}
    >
      <Image
        src={logoMark}
        alt={`${company.name} — logo`}
        className="h-8 w-auto"
      />
    </span>
  );
}
