import { cn } from "@/src/lib/utils";
import type { CtaGroupStoryblok } from "@/src/types/component-types-sb";
import { ActionButton } from "./action-button";

type CtaGroupProps = {
  blok: CtaGroupStoryblok;
};

export function CtaGroup({ blok }: CtaGroupProps) {
  const buttons = [
    ...(blok.primary_button ?? []),
    ...(blok.secondary_button ?? []),
  ];

  if (buttons.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
        blok.alignment === "right" && "sm:justify-end",
      )}
    >
      {buttons.map((button) => (
        <ActionButton key={button._uid} blok={button} />
      ))}
    </div>
  );
}
