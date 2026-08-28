"use client";

import { useEffect, useRef } from "react";

import { gsap, ScrollTrigger } from "../_lib/gsap";
import type { FacilitiesDictionary } from "../_lib/types";
import { cn } from "@/src/lib/utils";

type FacilitiesStatsProps = { stats: FacilitiesDictionary["stats"] };

export function FacilitiesStats({ stats }: FacilitiesStatsProps) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const numbers =
      root.current?.querySelectorAll<HTMLElement>("[data-count]") ?? [];

    const triggers = Array.from(numbers).map((element) => {
      const end = Number(element.dataset.count);
      const suffix = element.dataset.suffix ?? "";

      return ScrollTrigger.create({
        trigger: element,
        start: "top 88%",
        once: true,
        onEnter: () => {
          const counter = { value: 0 };
          gsap.to(counter, {
            value: end,
            duration: 1.3,
            ease: "power2.out",
            onUpdate: () => {
              element.textContent = Math.round(counter.value) + suffix;
            },
          });
        },
      });
    });

    return () => triggers.forEach((trigger) => trigger.kill());
  }, []);

  return (
    <section
      id="liczby"
      ref={root}
      className="dark relative border-y border-border bg-background text-foreground"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4">
        {stats.map((cell, index) => (
          <div
            key={cell.label}
            className={cn(
              "border-border px-4 py-9 sm:px-6 md:px-10 md:py-14 lg:border-t-0",
              // Two columns on small screens, four from lg up — the dividers
              // have to follow the wrap, hence the index arithmetic.
              index % 2 !== 0 && "border-l",
              index >= 2 && "border-t",
              index > 0 && "lg:border-l",
            )}
          >
            <div
              className="font-mono text-4xl leading-[0.9] font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl"
              data-count={cell.countTo}
              data-suffix={cell.suffix}
            >
              {cell.value}
            </div>
            <div className="kicker mt-3.5 font-mono text-muted-foreground">
              {cell.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
