import { Button, buttonVariants } from "@/src/components/ui";
import { cn } from "@/src/lib/utils";

type Tone = "solid" | "outline";

/** `outline` reads as a hairline button over video, `solid` is the red CTA. */
function ctaClass(tone: Tone, className?: string) {
  return cn(
    buttonVariants({ variant: tone === "solid" ? "default" : "outline" }),
    "h-11 px-6 font-mono text-xs tracking-[0.16em] uppercase",
    tone === "outline" &&
      "border-foreground/50 bg-transparent text-foreground hover:bg-foreground hover:text-background dark:bg-transparent dark:hover:bg-foreground",
    className,
  );
}

type CtaLinkProps = {
  href: string;
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
};

/**
 * Page-level call to action. Plain <a> rather than <Link> — every target is
 * either an in-page anchor (routed through Lenis) or a `tel:` link.
 */
export function CtaLink({
  href,
  children,
  tone = "solid",
  className,
}: CtaLinkProps) {
  return (
    <a href={href} className={ctaClass(tone, className)}>
      {children}
    </a>
  );
}

type CtaButtonProps = {
  onClick: () => void;
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
};

/** Same look as `CtaLink`, for actions that stay on the page. */
export function CtaButton({
  onClick,
  children,
  tone = "solid",
  className,
}: CtaButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={ctaClass(tone, cn("cursor-pointer", className))}
    >
      {children}
    </Button>
  );
}
