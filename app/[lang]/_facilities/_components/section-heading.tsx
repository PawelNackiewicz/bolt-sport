import { cn } from "@/src/lib/utils";

type SectionHeadingProps = {
  title: React.ReactNode;
  eyebrow: string;
  className?: string;
};

/** Headline on the left, mono kicker on the right, hairline rule underneath. */
export function SectionHeading({
  title,
  eyebrow,
  className,
}: SectionHeadingProps) {
  return (
    <div
      data-reveal
      className={cn(
        "mb-12 flex flex-wrap items-baseline justify-between gap-6 border-b border-border pb-6 sm:mb-16 lg:mb-24",
        className,
      )}
    >
      {/* Leading stays above 1 on purpose: tighter and Oswald's uppercase
          diacritics (Ń, Ó, Ś…) collide with the line above and vanish. */}
      <h2 className="font-display text-4xl leading-[1.15] font-bold tracking-tight uppercase sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      <p className="kicker font-mono text-muted-foreground">{eyebrow}</p>
    </div>
  );
}
