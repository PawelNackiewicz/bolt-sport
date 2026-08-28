"use client";

import { useEffect, useState } from "react";

import { ScrollTrigger } from "../_lib/gsap";
import type { FacilitiesDictionary } from "../_lib/types";
import { company } from "@/src/lib/site-data";
import { cn } from "@/src/lib/utils";
import { CtaLink } from "./cta-link";

type StickyCtaProps = { content: FacilitiesDictionary["stickyCta"] };

/**
 * Slides in once the visitor is past the hero and hides again near the closing
 * section, where the same call to action is already on screen.
 */
export function StickyCta({ content }: StickyCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      start: () => document.documentElement.scrollHeight * 0.3,
      end: () => document.documentElement.scrollHeight - window.innerHeight * 1.6,
      onToggle: (self) => setVisible(self.isActive),
    });
    return () => trigger.kill();
  }, []);

  return (
    <div
      className={cn(
        "dark fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-4 border-t border-border bg-background px-5 py-3 text-foreground transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] sm:px-8",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <p className="kicker hidden font-mono text-muted-foreground md:block">
        {content.stat}
      </p>
      <div className="flex flex-1 gap-3 md:flex-none">
        <CtaLink
          href={company.phoneHref}
          tone="outline"
          className="flex-1 md:flex-none"
        >
          {content.call}
        </CtaLink>
        <CtaLink href="#kwalifikator" className="flex-1 md:flex-none">
          {content.bookVisit}
        </CtaLink>
      </div>
    </div>
  );
}
