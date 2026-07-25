import Image from "next/image";

import { Container } from "@/src/components/ui";
import { cn } from "@/src/lib/utils";
import type { ImageTextSectionStoryblok } from "@/src/types/component-types-sb";
import { ActionButton } from "./action-button";
import { IconTextRow } from "./icon-text-row";

type ImageTextSectionProps = {
  blok: ImageTextSectionStoryblok;
};

export function ImageTextSection({ blok }: ImageTextSectionProps) {
  const features = blok.features ?? [];
  const ctaButtons = blok.cta_button ?? [];
  const isRight = blok.image_position === "right";
  const imageUrl = blok.image?.filename || undefined;
  const hasBadge = blok.badge_subtitle || blok.badge_title;
  const hasHeading = blok.pre_title || blok.title;

  return (
    <section className="relative isolate overflow-hidden border-y border-border bg-card/40 py-16 sm:py-20">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {imageUrl && (
          <div
            className={cn(
              "relative order-last aspect-[4/3] w-full lg:aspect-square",
              !isRight && "lg:order-first",
            )}
          >
            <Image
              src={imageUrl}
              alt={blok.image?.alt || ""}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="rounded-xl object-cover"
            />
            {hasBadge && (
              <div className="absolute -top-4 right-4 rounded-lg border border-primary/40 bg-background/90 px-4 py-3 shadow-lg backdrop-blur-sm">
                {blok.badge_subtitle && (
                  <p className="kicker text-primary">{blok.badge_subtitle}</p>
                )}
                {blok.badge_title && (
                  <p className="font-display text-lg font-bold uppercase">
                    {blok.badge_title}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-8">
          {hasHeading && (
            <div className="flex flex-col gap-3">
              {blok.pre_title && (
                <span className="kicker flex items-center gap-2 text-primary">
                  <span className="inline-block h-px w-6 bg-primary" />
                  {blok.pre_title}
                </span>
              )}
              {blok.title && (
                <h2 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                  {blok.title}
                </h2>
              )}
            </div>
          )}

          {features.length > 0 && (
            <ul className="flex flex-col">
              {features.map((feature) => (
                <IconTextRow key={feature._uid} blok={feature} />
              ))}
            </ul>
          )}

          {ctaButtons.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {ctaButtons.map((button) => (
                <ActionButton key={button._uid} blok={button} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
