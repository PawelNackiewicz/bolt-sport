"use client";

import { useRef, useState } from "react";

import { Container } from "@/src/components/ui";
import { beforeAfter, projectRows } from "@/src/lib/facilities-data";
import { SectionHeading } from "./section-heading";

export function ProjectsList() {
  const stage = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [split, setSplit] = useState(50);

  const setFromPointer = (clientX: number) => {
    const bounds = stage.current?.getBoundingClientRect();
    if (!bounds) return;
    setSplit(
      Math.min(100, Math.max(0, ((clientX - bounds.left) / bounds.width) * 100)),
    );
  };

  return (
    <section
      id="realizacje"
      className="dark bg-background py-24 text-foreground sm:py-32 lg:py-44"
    >
      <Container>
        <SectionHeading
          title={
            <>
              Ostatnie
              <br />
              realizacje.
            </>
          }
          eyebrow="Wybór z sześciu ostatnich kwartałów"
        />

        <div className="border-t border-border">
          {projectRows.map((row, index) => (
            <div
              key={row.city}
              data-reveal
              className="grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1.5 border-b border-border py-5 transition-[padding,background-color] duration-300 ease-[cubic-bezier(.16,1,.3,1)] hover:bg-foreground/3 hover:pl-5 sm:py-7 lg:grid-cols-[0.6fr_1.5fr_1fr_1fr_auto] lg:gap-5"
            >
              <div className="font-mono text-xs text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="font-display text-xl font-semibold tracking-tight uppercase sm:text-2xl">
                {row.city}
              </div>
              <div className="col-start-2 text-sm text-muted-foreground lg:col-auto">
                {row.scope}
              </div>
              <div className="col-start-2 text-sm text-muted-foreground lg:col-auto">
                {row.area}
              </div>
              <div className="col-start-2 font-mono whitespace-nowrap text-primary lg:col-auto">
                {row.value}
              </div>
            </div>
          ))}
        </div>

        <div data-reveal className="mt-12 border border-border p-5 lg:mt-20">
          <div
            ref={stage}
            className="relative aspect-video cursor-ew-resize touch-none overflow-hidden bg-muted select-none"
            onPointerDown={(event) => {
              dragging.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              setFromPointer(event.clientX);
            }}
            onPointerMove={(event) => {
              if (dragging.current) setFromPointer(event.clientX);
            }}
            onPointerUp={() => {
              dragging.current = false;
            }}
          >
            <div className="kicker absolute inset-0 grid place-items-center bg-card p-5 text-center font-mono text-muted-foreground">
              {beforeAfter.before}
            </div>
            <div
              className="kicker absolute inset-0 grid place-items-center bg-accent p-5 text-center font-mono text-accent-foreground"
              style={{ clipPath: `inset(0 0 0 ${split}%)` }}
            >
              {beforeAfter.after}
            </div>
            <div
              className="absolute inset-y-0 w-px bg-primary after:absolute after:top-1/2 after:left-1/2 after:size-9 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:border after:border-primary after:bg-background after:content-['']"
              style={{ left: `${split}%` }}
            />
          </div>
          <div className="kicker mt-3.5 flex justify-between gap-4 font-mono text-muted-foreground">
            <span>{beforeAfter.caption}</span>
            <span>{beforeAfter.hint}</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
