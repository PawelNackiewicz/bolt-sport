"use client";

import { useEffect } from "react";

import { useSmoothScroll } from "@/src/hooks/use-smooth-scroll";
import { gsap, ScrollTrigger } from "@/src/lib/gsap";

/**
 * Page-wide scroll behaviour: Lenis smooth scrolling plus the shared reveal for
 * every `[data-reveal]` element that has no animation of its own.
 *
 * Renders nothing — it only drives the DOM the sections already rendered.
 */
export function ScrollEffects() {
  useSmoothScroll();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    const animations = targets.map((element, index) =>
      gsap.from(element, {
        opacity: 0,
        y: 26,
        duration: 0.8,
        ease: "power3.out",
        delay: (index % 4) * 0.05,
        scrollTrigger: { trigger: element, start: "top 90%", once: true },
      }),
    );
    ScrollTrigger.refresh();

    return () =>
      animations.forEach((animation) => {
        animation.scrollTrigger?.kill();
        animation.kill();
      });
  }, []);

  return null;
}
