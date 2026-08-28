"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Plugin registration has to happen once, at module import time — not inside a
 * component effect. Child effects run before parent effects, so any component
 * calling ScrollTrigger.create() would fire before the page had a chance to
 * register the plugin.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
