"use client";

import { createElement } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button, Container } from "@/src/components/ui";
import { cn } from "@/src/lib/utils";
import { resolveIcon } from "@/src/lib/icons";
import { useI18n } from "@/src/i18n/i18n-provider";
import type {
  ActionButtonStoryblok,
  HeroBodyStoryblok,
  HeroHeadlineGroupStoryblok,
  HeroSectionStoryblok,
  CtaGroupStoryblok,
  TrustBarStoryblok,
} from "@/src/types/component-types-sb";

type HeroProps = {
  blok: HeroSectionStoryblok;
};

const DEFAULT_ALT = "Hala treningowa z profesjonalnym sprzętem sportowym";
const DEFAULT_TITLE = "Sprzęt do sportów walki";
const DEFAULT_DESCRIPTION =
  "Produkujemy i dostarczamy sprzęt do treningu, klubów sportowych i profesjonalnych aren walki.";

function renderIcon(name: string | undefined, className: string) {
  const icon = resolveIcon(name);
  return icon ? createElement(icon, { className }) : null;
}

export function Hero({ blok }: HeroProps) {
  const { href } = useI18n();

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

  const hasSplitTitle = headline?.title_prefix || headline?.title_highlight;
  const ctaButtons = [
    ...(ctaGroup?.primary_button ?? []),
    ...(ctaGroup?.secondary_button ?? []),
  ];
  const trustItems = trustBar?.items ?? [];

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
          <span className="kicker flex items-center gap-2 text-primary">
            <span className="inline-block h-px w-6 bg-primary" />
            {renderIcon(headline?.eyebrow_icon, "size-4")}
            {headline?.eyebrow}
          </span>

          <h1 className="text-4xl leading-[0.98] font-bold tracking-tight uppercase sm:text-5xl lg:text-6xl xl:text-7xl">
            {hasSplitTitle ? (
              <>
                {headline?.title_prefix}
                {headline?.title_prefix && headline?.title_highlight && (
                  <br className="hidden sm:block" />
                )}{" "}
                <span className="text-primary">
                  {headline?.title_highlight}
                </span>
              </>
            ) : (
              (headline?.title ?? DEFAULT_TITLE)
            )}
          </h1>

          <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
            {bodyText?.description ?? DEFAULT_DESCRIPTION}
          </p>

          {ctaButtons.length > 0 && (
            <div
              className={cn(
                "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
                ctaGroup?.alignment === "right" && "sm:justify-end",
              )}
            >
              {ctaButtons.map((button) => (
                <CtaButton key={button._uid} button={button} href={href} />
              ))}
            </div>
          )}

          {/* trust proof */}
          {trustItems.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-3 border-t border-border/70 pt-6">
              {trustItems.map((item) => {
                const content = (
                  <>
                    {renderIcon(item.icon, "size-4 text-primary")}
                    {item.label}
                    {item.value && (
                      <span
                        className={cn(
                          item.highlight
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {item.value}
                      </span>
                    )}
                  </>
                );

                return (
                  <li
                    key={item._uid}
                    className={cn(
                      "flex items-center gap-2 text-sm font-medium",
                      item.highlight
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.link ? (
                      <Link
                        href={href(item.link)}
                        className="flex items-center gap-2 transition-colors hover:text-foreground"
                      >
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Container>
    </section>
  );
}

function CtaButton({
  button,
  href,
}: {
  button: ActionButtonStoryblok;
  href: (path: string) => string;
}) {
  const isSecondary = button.variant === "secondary";

  return (
    <Button
      size="lg"
      variant={isSecondary ? "outline" : "default"}
      aria-label={button.aria_label || undefined}
      className={cn(
        isSecondary &&
          "border-primary/60 bg-background/30 text-primary backdrop-blur-sm hover:bg-primary/10 hover:text-primary",
      )}
      render={<Link href={href(button.link ?? "/")} />}
    >
      {renderIcon(button.icon_left, "size-4")}
      {button.text}
      {renderIcon(button.icon_right, "size-4")}
    </Button>
  );
}
