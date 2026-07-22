"use client";

import { createElement } from "react";
import Link from "next/link";

import { Button } from "@/src/components/ui";
import { cn } from "@/src/lib/utils";
import { resolveIcon } from "@/src/lib/icons";
import { useI18n } from "@/src/i18n/i18n-provider";
import type { ActionButtonStoryblok } from "@/src/types/component-types-sb";

type ActionButtonProps = {
  blok: ActionButtonStoryblok;
};

export function ActionButton({ blok }: ActionButtonProps) {
  const { href } = useI18n();
  const isSecondary = blok.variant === "secondary";
  const iconLeft = resolveIcon(blok.icon_left);
  const iconRight = resolveIcon(blok.icon_right);

  return (
    <Button
      size="lg"
      variant={isSecondary ? "outline" : "default"}
      aria-label={blok.aria_label || undefined}
      className={cn(
        isSecondary &&
          "border-primary/60 bg-background/30 text-primary backdrop-blur-sm hover:bg-primary/10 hover:text-primary",
      )}
      render={<Link href={href(blok.link ?? "/")} />}
    >
      {iconLeft && createElement(iconLeft, { className: "size-4" })}
      {blok.text}
      {iconRight && createElement(iconRight, { className: "size-4" })}
    </Button>
  );
}
