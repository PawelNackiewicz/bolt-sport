import { createElement } from "react";
import { StoryblokRichText, type SbRichTextDoc } from "@storyblok/react";

import { resolveIcon } from "@/src/lib/icons";
import type { EquipmentCardStoryblok } from "@/src/types/component-types-sb";

type EquipmentCardProps = {
  blok: EquipmentCardStoryblok;
};

export function EquipmentCard({ blok }: EquipmentCardProps) {
  const icon = resolveIcon(blok.icon);

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6">
      {icon && (
        <span className="grid size-11 place-items-center rounded-lg border border-border bg-secondary text-primary">
          {createElement(icon, { className: "size-5" })}
        </span>
      )}
      <div className="flex flex-col gap-1.5">
        {blok.title && (
          <h3 className="font-display text-lg font-semibold uppercase tracking-tight leading-tight">
            {blok.title}
          </h3>
        )}
        {blok.description && (
          <p className="text-muted-foreground text-sm leading-relaxed">
            {blok.description}
          </p>
        )}
      </div>
      {blok.features && (
        <div className="text-muted-foreground text-sm leading-relaxed [&_li]:list-disc [&_li]:ml-4 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5">
          <StoryblokRichText
            document={blok.features as unknown as SbRichTextDoc}
          />
        </div>
      )}
    </div>
  );
}
