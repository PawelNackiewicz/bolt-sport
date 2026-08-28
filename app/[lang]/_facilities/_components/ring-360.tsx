"use client";

import { useCallback, useRef, useState } from "react";

import { useVideoScrub } from "../_hooks/use-video-scrub";
import { facilitiesMedia, ringHotspotPositions } from "../_lib/facilities-data";
import type { FacilitiesDictionary } from "../_lib/types";
import { cn } from "@/src/lib/utils";

const ringParts = [facilitiesMedia.ring360];

type Ring360Props = { content: FacilitiesDictionary["ring360"] };

export function Ring360({ content }: Ring360Props) {
  const section = useRef<HTMLElement>(null);
  const videoLayer = useRef<HTMLDivElement>(null);
  const degrees = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Written straight to the DOM — re-rendering on every scroll frame would
  // throw away the whole point of scrubbing.
  const onProgress = useCallback((progress: number) => {
    if (!degrees.current) return;
    degrees.current.textContent = `${String(Math.round(progress * 360)).padStart(3, "0")}°`;
  }, []);

  useVideoScrub({
    containerRef: videoLayer,
    sectionRef: section,
    parts: ringParts,
    onProgress,
  });

  const detail = content.details[active];

  return (
    <section
      id="obrot"
      ref={section}
      className="dark h-[360vh] bg-background text-foreground"
    >
      <div className="sticky top-0 grid h-svh grid-rows-[1fr_auto] lg:grid-cols-[1fr_minmax(280px,26vw)] lg:grid-rows-1">
        <div className="relative overflow-hidden border-b border-border lg:border-r lg:border-b-0">
          <div
            className="absolute inset-0 z-0 bg-background bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url("${facilitiesMedia.ringPoster}")` }}
          />
          <div ref={videoLayer} className="absolute inset-0 z-10" />

          <div
            ref={degrees}
            // Lifted clear of the sticky CTA bar that sits at the viewport bottom.
            className="kicker absolute bottom-20 left-5 z-20 font-mono text-muted-foreground sm:left-8"
          >
            000°
          </div>

          {content.details.map((hotspot, index) => (
            <button
              key={hotspot.title}
              type="button"
              style={ringHotspotPositions[index]}
              aria-label={hotspot.title}
              aria-pressed={active === index}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              className={cn(
                "absolute z-20 size-8 -translate-x-1/2 -translate-y-1/2 rotate-45 border transition-all duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
                "after:absolute after:inset-3.5 after:transition-colors after:duration-300 after:content-['']",
                active === index
                  ? "scale-125 border-primary after:bg-primary"
                  : "border-foreground after:bg-foreground hover:scale-125 hover:border-primary hover:after:bg-primary",
              )}
            />
          ))}
        </div>

        {/* Extra bottom padding keeps the last spec row clear of the CTA bar. */}
        <div className="flex flex-col justify-center overflow-y-auto px-5 pt-6 pb-24 sm:px-8 lg:py-10">
          <div className="kicker font-mono text-primary">{detail.label}</div>
          <h3 className="my-4 font-display text-xl font-semibold tracking-tight uppercase sm:text-2xl lg:text-3xl">
            {detail.title}
          </h3>
          <p className="text-sm text-muted-foreground">{detail.description}</p>

          <dl className="mt-6 border-t border-border pt-4 font-mono text-xs">
            {detail.spec.map((entry) => (
              <div key={entry.label}>
                <dt className="kicker mt-3 text-muted-foreground">
                  {entry.label}
                </dt>
                <dd className="mt-1 tracking-[0.08em]">{entry.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
