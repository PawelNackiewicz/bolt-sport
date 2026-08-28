"use client";

import { useEffect, useRef } from "react";

import { useVideoScrub } from "../_hooks/use-video-scrub";
import { facilitiesMedia } from "../_lib/facilities-data";
import { gsap } from "../_lib/gsap";
import type { FacilitiesDictionary } from "../_lib/types";
import { CtaLink } from "./cta-link";

/** Concatenated file when it exists, otherwise the separate clips in order. */
const heroParts = facilitiesMedia.heroVideo
  ? [facilitiesMedia.heroVideo]
  : facilitiesMedia.heroParts;

type FacilitiesHeroProps = { content: FacilitiesDictionary["hero"] };

export function FacilitiesHero({ content }: FacilitiesHeroProps) {
  const section = useRef<HTMLElement>(null);
  const videoLayer = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLDivElement>(null);

  useVideoScrub({
    containerRef: videoLayer,
    sectionRef: section,
    parts: heroParts,
  });

  // Headline fades out over the first third of the scrub.
  useEffect(() => {
    const animation = gsap.to(headline.current, {
      opacity: 0,
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: section.current,
        start: "top top",
        end: "35% top",
        scrub: true,
      },
    });
    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, []);

  return (
    <section
      id="hero"
      ref={section}
      // Negative margin slides the stage under the sticky site header, so the
      // video is full-bleed from the very first pixel of scroll.
      className="dark relative -mt-16 h-[460vh] bg-background text-foreground"
    >
      <div className="sticky top-0 h-svh overflow-hidden [contain:paint]">
        <div
          className="absolute inset-0 z-0 bg-background bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${facilitiesMedia.heroPoster}")` }}
        />
        {/* The scrub hook appends one <video> per clip in here. */}
        <div ref={videoLayer} className="absolute inset-0 z-10" />
        <div className="absolute inset-0 z-20 bg-[oklch(0.145_0.004_285_/_0.45)]" />

        <div className="absolute inset-y-0 right-5 z-30 hidden items-center sm:right-8 md:flex">
          <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase [writing-mode:vertical-rl]">
            {content.scrollLabel}
          </span>
        </div>

        <div
          ref={headline}
          className="absolute inset-0 z-30 flex flex-col justify-end px-5 pb-10 sm:px-8 sm:pb-16 lg:pb-20"
        >
          <div className="mx-auto w-full max-w-7xl">
            {/* Leading below 1 works only because no line but the first carries
                a diacritic — Oswald's uppercase accents would be swallowed by
                the line above. Loosen it if this copy ever changes. */}
            <h1 className="mb-7 max-w-[16ch] font-display text-5xl leading-[0.9] font-bold tracking-tight uppercase sm:text-7xl lg:text-8xl xl:text-9xl">
              {content.headline[0]}
              <br />
              {content.headline[1]}
            </h1>
            <div className="flex flex-wrap gap-3">
              <CtaLink href="#kwalifikator">{content.ctaPrimary}</CtaLink>
              <CtaLink href="#realizacje" tone="outline">
                {content.ctaSecondary}
              </CtaLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
