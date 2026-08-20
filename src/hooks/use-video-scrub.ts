"use client";

import { useEffect, useRef, type RefObject } from "react";

import { ScrollTrigger } from "@/src/lib/gsap";

type UseVideoScrubOptions = {
  /** Element the <video> tags get appended to. Must be positioned. */
  containerRef: RefObject<HTMLElement | null>;
  /** Tall section whose scroll progress drives playback. */
  sectionRef: RefObject<HTMLElement | null>;
  /** Clip URLs, played back to back across the section's progress. */
  parts: readonly string[];
  /** Called with 0..1 scroll progress on every ScrollTrigger update. */
  onProgress?: (progress: number) => void;
};

/**
 * Binds video playback to scroll progress inside a section.
 *
 * Three rules keep this smooth:
 *  - Every clip gets its own <video>. Swapping `src` on the fly forces a
 *    reload and stutters exactly while the user is moving.
 *  - Seeks are gated: the next one is issued only after `seeked` fires.
 *    Without that, rAF queues ~60 seeks a second and each aborts the last.
 *  - Inactive clips hide via `visibility`, not `display`, so their decoded
 *    buffer survives.
 *
 * The clips must be encoded with every frame as a keyframe (`keyint=1`),
 * otherwise seeking decodes from the start of the file and stalls.
 */
export function useVideoScrub({
  containerRef,
  sectionRef,
  parts,
  onProgress,
}: UseVideoScrubOptions) {
  // Kept in a ref so a new callback identity never rebuilds the video elements.
  const onProgressRef = useRef(onProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  // Joining into a string makes the effect depend on the sources themselves
  // rather than on the array's identity.
  const sourcesKey = parts.filter(Boolean).join("|");

  useEffect(() => {
    const container = containerRef.current;
    const section = sectionRef.current;
    if (!container || !section) return;

    const sources = sourcesKey.split("|").filter(Boolean);
    if (sources.length === 0) return;

    const videos = sources.map((src, index) => {
      const video = document.createElement("video");
      video.src = src;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute("aria-hidden", "true");
      video.style.cssText =
        "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;" +
        "transform:translateZ(0);backface-visibility:hidden";
      video.style.visibility = index === 0 ? "visible" : "hidden";
      // Mark readiness so we never seek before the duration is known.
      video.addEventListener("loadedmetadata", () => {
        video.dataset.ready = "1";
      });
      container.appendChild(video);
      return video;
    });

    // Seek gating — at most one in flight per element.
    const busy = new WeakMap<HTMLVideoElement, boolean>();
    videos.forEach((video) => {
      busy.set(video, false);
      video.addEventListener("seeking", () => busy.set(video, true));
      video.addEventListener("seeked", () => busy.set(video, false));
    });

    let target = 0;
    let current = 0;
    let activeIndex = 0;
    let frame = 0;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        target = self.progress;
        onProgressRef.current?.(self.progress);
      },
    });

    const loop = () => {
      current += (target - current) * 0.12;

      const span = 1 / videos.length;
      const index = Math.min(videos.length - 1, Math.floor(current / span));

      if (index !== activeIndex) {
        videos[activeIndex].style.visibility = "hidden";
        videos[index].style.visibility = "visible";
        activeIndex = index;
      }

      const video = videos[index];
      const local = Math.min(1, Math.max(0, (current - index * span) / span));

      if (video.dataset.ready && video.duration && !busy.get(video)) {
        const time = local * (video.duration - 0.05);
        // Roughly half a frame at 25 fps. Below that the seek costs more than
        // the viewer could ever notice.
        if (Math.abs(video.currentTime - time) > 0.02) {
          video.currentTime = time;
        }
      }

      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      trigger.kill();
      videos.forEach((video) => {
        video.removeAttribute("src");
        video.load();
        video.remove();
      });
    };
  }, [containerRef, sectionRef, sourcesKey]);
}
