"use client";

import { useMemo, useState } from "react";

import { Container } from "@/src/components/ui";
import { mapCities, type MapCity } from "../_lib/facilities-data";
import type { FacilitiesDictionary } from "../_lib/types";
import { cn } from "@/src/lib/utils";
import { SectionHeading } from "./section-heading";

/**
 * Simplified outline of Poland in geographic degrees. Both the border and the
 * cities go through the same linear lon/lat → x/y projection, so every dot
 * lands where the city actually is.
 */
const border: Array<[lon: number, lat: number]> = [
  [14.25, 53.92], [14.2, 54.02], [15.3, 54.2], [16.2, 54.55], [17.0, 54.75],
  [18.3, 54.83], [19.2, 54.42], [20.6, 54.4], [22.8, 54.36], [23.5, 54.0],
  [23.9, 53.0], [23.6, 52.6], [23.2, 52.3], [23.6, 51.5], [24.1, 50.85],
  [23.7, 50.4], [22.6, 49.6], [22.9, 49.1], [22.55, 49.09], [21.8, 49.4],
  [20.9, 49.3], [20.1, 49.2], [19.8, 49.2], [19.5, 49.6], [18.85, 49.5],
  [18.6, 49.9], [18.05, 50.0], [17.7, 50.3], [16.9, 50.45], [16.7, 50.1],
  [16.3, 50.65], [15.3, 51.0], [15.0, 51.3], [14.7, 51.55], [14.6, 52.0],
  [14.15, 52.9], [14.4, 53.3], [14.25, 53.92],
];

const projectX = (lon: number) => (lon - 13.9) * 40;
const projectY = (lat: number) => (55.1 - lat) * 60;

type CoverageMapProps = { content: FacilitiesDictionary["coverageMap"] };

export function CoverageMap({ content }: CoverageMapProps) {
  const [selected, setSelected] = useState<MapCity | null>(null);

  const outline = useMemo(
    () =>
      border
        .map(
          ([lon, lat], index) =>
            `${index ? "L" : "M"}${projectX(lon).toFixed(1)} ${projectY(lat).toFixed(1)}`,
        )
        .join(" ") + " Z",
    [],
  );

  return (
    <section
      id="mapa"
      className="dark bg-background py-24 text-foreground sm:py-32 lg:py-44"
    >
      <Container>
        <SectionHeading
          title={
            <>
              {content.heading[0]}
              <br />
              {content.heading[1]}
            </>
          }
          eyebrow={content.eyebrow}
        />

        <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_0.8fr] lg:gap-20">
          <svg
            viewBox="0 0 412 372"
            role="img"
            aria-label={content.ariaLabel}
            className="h-auto w-full"
          >
            <path
              d={outline}
              className="fill-foreground/4 stroke-border"
              strokeWidth={1.2}
              vectorEffect="non-scaling-stroke"
            />
            {mapCities.map((city) => {
              const [name, lon, lat, isReference] = city;
              return (
                <circle
                  key={name}
                  cx={projectX(lon).toFixed(1)}
                  cy={projectY(lat).toFixed(1)}
                  r={isReference ? 4 : 2.6}
                  tabIndex={0}
                  role="button"
                  aria-label={name}
                  onMouseEnter={() => setSelected(city)}
                  onFocus={() => setSelected(city)}
                  className={cn(
                    "cursor-pointer transition-colors duration-200 hover:fill-primary",
                    isReference || selected?.[0] === name
                      ? "fill-primary"
                      : "fill-muted-foreground",
                  )}
                />
              );
            })}
          </svg>

          <div>
            <p className="max-w-[56ch] text-muted-foreground">
              {content.paragraph}
            </p>
            <div className="mt-6 border-t border-border pt-5 font-mono">
              <div className="kicker text-muted-foreground">
                {selected ? content.selectedKicker : content.hoverPrompt}
              </div>
              <b className="block text-2xl font-bold tracking-tight sm:text-3xl">
                {selected ? selected[0] : content.defaultRegion}
              </b>
              <div className="kicker mt-2.5 text-muted-foreground">
                {selected
                  ? selected[3]
                    ? content.referenceLabel
                    : content.installedLabel
                  : content.footerStat}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
