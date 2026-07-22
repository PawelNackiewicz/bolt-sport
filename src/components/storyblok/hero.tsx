import Image from "next/image";

import { Container } from "@/src/components/ui";
import { cn } from "@/src/lib/utils";
import type {
  HeroBodyStoryblok,
  HeroHeadlineGroupStoryblok,
  HeroSectionStoryblok,
  CtaGroupStoryblok,
  TrustBarStoryblok,
} from "@/src/types/component-types-sb";
import { HeroHeadlineGroup } from "./hero-headline-group";
import { CtaGroup } from "./cta-group";
import { TrustBar } from "./trust-bar";

type HeroProps = {
  blok: HeroSectionStoryblok;
};

const DEFAULT_ALT = "Hala treningowa z profesjonalnym sprzętem sportowym";
const DEFAULT_DESCRIPTION =
  "Produkujemy i dostarczamy sprzęt do treningu, klubów sportowych i profesjonalnych aren walki.";

export function Hero({ blok }: HeroProps) {
  const headline = blok.body?.find(
    (nested): nested is HeroHeadlineGroupStoryblok =>
      nested.component === "hero_headline_group",
  );
  const bodyText = blok.body?.find(
    (nested): nested is HeroBodyStoryblok =>
      nested.component === "hero_body",
  );
  const ctaGroup = blok.body?.find(
    (nested): nested is CtaGroupStoryblok =>
      nested.component === "cta_group",
  );
  const trustBar = blok.body?.find(
    (nested): nested is TrustBarStoryblok =>
      nested.component === "trust_bar",
  );

  const isRight = blok.content_alignment === "right";

  const lightImage = blok.background_image_light?.filename || undefined;
  const darkImage = blok.background_image_dark?.filename || undefined;
  const imageAlt =
    blok.background_image_alt ||
    blok.background_image_light?.alt ||
    blok.background_image_dark?.alt ||
    DEFAULT_ALT;

  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden border-b border-border">
      {/* Full-bleed hero photograph — swaps with the theme. Only the visible
          one loads: the hidden (display:none) image is skipped by lazy loading. */}
      {lightImage && (
        <Image
          src={lightImage}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className={cn(
            "-z-20 object-cover dark:hidden",
            isRight ? "object-[38%_50%]" : "object-[62%_50%]",
          )}
        />
      )}
      {darkImage && (
        <Image
          src={darkImage}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className={cn(
            "hidden -z-20 object-cover dark:block",
            isRight ? "object-[38%_50%]" : "object-[62%_50%]",
          )}
        />
      )}

      {/* Legibility scrim — darkest on the side where the copy sits */}
      <div
        className={cn(
          "absolute inset-0 -z-10 bg-linear-to-r from-background/95 via-background/65 to-background/5",
          isRight && "bg-linear-to-l",
        )}
      />
      {/* Vertical grounding — fades into the page below and softens the top */}
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-background via-transparent to-background/35" />
      {/* Brand atmosphere — faint red glow toward the ring. Softened in light
          mode, where red over a bright photo reads much stronger. */}
      <div
        className={cn(
          "absolute inset-0 -z-10 opacity-50 dark:opacity-100",
          isRight
            ? "bg-[radial-gradient(55%_45%_at_18%_18%,oklch(0.585_0.214_23.5/0.16),transparent_60%)]"
            : "bg-[radial-gradient(55%_45%_at_82%_18%,oklch(0.585_0.214_23.5/0.16),transparent_60%)]",
        )}
      />

      <Container className="py-20 sm:py-24">
        <div
          className={cn(
            "text-foreground flex max-w-2xl flex-col gap-7",
            isRight && "ml-auto",
          )}
        >
          {headline && <HeroHeadlineGroup blok={headline} />}

          <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
            {bodyText?.description ?? DEFAULT_DESCRIPTION}
          </p>

          {ctaGroup && <CtaGroup blok={ctaGroup} />}

          {trustBar && <TrustBar blok={trustBar} />}
        </div>
      </Container>
    </section>
  );
}
