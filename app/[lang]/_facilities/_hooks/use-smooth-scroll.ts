"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { gsap, ScrollTrigger } from "../_lib/gsap";

/**
 * Wires Lenis smooth scrolling into the GSAP ticker and keeps ScrollTrigger in
 * sync with it. Under `prefers-reduced-motion` Lenis never starts — native
 * scrolling stays in charge.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Route #hash anchors through Lenis so they don't fight the smooth scroll.
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      );
      if (!anchor) return;

      const target = document.querySelector(anchor.getAttribute("href") ?? "");
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target as HTMLElement);
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);
}
