"use client";

import { useEffect, useRef, useState } from "react";

import { Container } from "@/src/components/ui";
import { assemblySteps } from "@/src/lib/facilities-data";
import { ScrollTrigger } from "@/src/lib/gsap";
import { cn } from "@/src/lib/utils";
import { SectionHeading } from "./section-heading";

/**
 * Technical line drawings, one per stage. `currentColor` for the structure and
 * `--primary` for whatever the stage is actually about.
 */
const figures = [
  <svg viewBox="0 0 200 200" fill="none" key="measure">
    <rect x="20" y="20" width="160" height="160" stroke="currentColor" />
    <path d="M20 100h160M100 20v160" stroke="var(--primary)" strokeDasharray="4 5" />
    <path d="M20 12h160M20 8v8M180 8v8" stroke="currentColor" />
    <path d="M188 20v160M184 20h8M184 180h8" stroke="currentColor" />
  </svg>,
  <svg viewBox="0 0 200 200" fill="none" key="mats">
    <rect x="24" y="70" width="152" height="16" stroke="currentColor" />
    <rect x="24" y="90" width="152" height="16" stroke="currentColor" />
    <rect x="24" y="110" width="152" height="16" stroke="var(--primary)" />
    <rect x="24" y="130" width="152" height="16" stroke="currentColor" />
    <path d="M24 60h152" stroke="currentColor" strokeDasharray="3 4" />
  </svg>,
  <svg viewBox="0 0 200 200" fill="none" key="mounts">
    <path d="M40 30v140M160 30v140" stroke="currentColor" />
    <path d="M40 60h120M40 100h120M40 140h120" stroke="currentColor" strokeDasharray="2 6" />
    <circle cx="40" cy="60" r="5" stroke="var(--primary)" />
    <circle cx="160" cy="100" r="5" stroke="var(--primary)" />
    <circle cx="40" cy="140" r="5" stroke="var(--primary)" />
  </svg>,
  <svg viewBox="0 0 200 200" fill="none" key="ring">
    <path d="M30 150h140M30 150V70h140v80" stroke="currentColor" />
    <path d="M30 82h140M30 94h140M30 106h140" stroke="var(--primary)" />
    <path d="M30 70v-14M170 70v-14" stroke="currentColor" />
  </svg>,
  <svg viewBox="0 0 200 200" fill="none" key="handover">
    <rect x="40" y="40" width="120" height="120" stroke="currentColor" />
    <path d="M70 100l22 22 42-48" stroke="var(--primary)" strokeWidth="2" />
  </svg>,
];

export function AssemblySteps() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const steps = root.current?.querySelectorAll<HTMLElement>("[data-step]") ?? [];

    const triggers = Array.from(steps).map((step, index) =>
      ScrollTrigger.create({
        trigger: step,
        start: "top 62%",
        end: "bottom 42%",
        onToggle: (self) => {
          if (self.isActive) setActive(index);
        },
      }),
    );

    return () => triggers.forEach((trigger) => trigger.kill());
  }, []);

  return (
    <section
      id="montaz"
      ref={root}
      className="dark bg-background py-24 text-foreground sm:py-32 lg:py-44"
    >
      <Container>
        <SectionHeading
          title={
            <>
              Pięć etapów.
              <br />
              Bez niespodzianek.
            </>
          }
          eyebrow="Jak powstaje sala — od pomiaru do odbioru"
        />

        <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-20">
          <div
            aria-hidden="true"
            className="sticky top-24 mb-5 grid aspect-16/10 place-items-center border border-border lg:top-[14vh] lg:mb-0 lg:aspect-square"
          >
            {figures.map((figure, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-[12%] transition-opacity duration-500 ease-[cubic-bezier(.16,1,.3,1)]",
                  active === index ? "opacity-100" : "opacity-0",
                )}
              >
                {figure}
              </div>
            ))}
          </div>

          <div>
            {assemblySteps.map((step, index) => (
              <div
                key={step.stage}
                data-step
                className={cn(
                  "border-b border-border py-12 transition-opacity duration-500 ease-[cubic-bezier(.16,1,.3,1)] lg:py-[11vh]",
                  active === index ? "opacity-100" : "opacity-30",
                )}
              >
                <div className="kicker font-mono text-primary">{step.stage}</div>
                <h3 className="my-3 font-display text-xl font-semibold tracking-tight uppercase sm:text-2xl">
                  {step.title}
                </h3>
                <p className="max-w-[44ch] text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
