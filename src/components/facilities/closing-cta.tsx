"use client";

import { useEffect, useRef } from "react";

import { facilitiesMedia } from "@/src/lib/facilities-data";
import { company } from "@/src/lib/site-data";
import { CtaLink } from "./cta-link";

export function ClosingCta() {
  const video = useRef<HTMLVideoElement>(null);

  // Loop only while on screen — a background video playing off-screen is pure
  // battery drain.
  useEffect(() => {
    const element = video.current;
    if (!element || !facilitiesMedia.closeVideo) return;

    element.src = facilitiesMedia.closeVideo;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.play().catch(() => {});
          } else {
            element.pause();
          }
        }),
      { threshold: 0.25 },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="closing"
      className="dark relative grid h-svh place-items-center overflow-hidden bg-background text-center text-foreground"
    >
      <div
        className="absolute inset-0 z-0 bg-background bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${facilitiesMedia.closePoster}")` }}
      />
      <video
        ref={video}
        muted
        playsInline
        loop
        preload="none"
        aria-hidden="true"
        className="absolute inset-0 z-10 size-full object-cover"
      />
      <div className="absolute inset-0 z-20 bg-[oklch(0.145_0.004_285_/_0.62)]" />

      <div className="relative z-30 px-5 sm:px-8">
        <h2 className="mb-8 font-display text-4xl leading-[1.15] font-bold tracking-tight uppercase sm:text-6xl lg:text-7xl">
          Zacznijmy od pomiaru.
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <CtaLink href="#kwalifikator">Umów wizję lokalną</CtaLink>
          <CtaLink href={company.phoneHref} tone="outline">
            {company.phone}
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
