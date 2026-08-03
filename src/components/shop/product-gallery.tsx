"use client";

import Image from "next/image";
import { useState } from "react";

import { useI18n } from "@/src/i18n/i18n-provider";
import { cn } from "@/src/lib/utils";

/** Main image plus thumbnails. Falls back to a single static image for one-shot galleries. */
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const { dictionary } = useI18n();
  const [active, setActive] = useState(0);
  const t = dictionary.shop.product;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
        <Image
          src={images[active] ?? images[0]}
          alt={name}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div role="group" aria-label={t.gallery} className="flex gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-current={index === active}
              aria-label={`${name} — ${index + 1}`}
              className={cn(
                "relative aspect-square w-20 overflow-hidden rounded-lg border transition-colors",
                index === active
                  ? "border-primary"
                  : "border-border hover:border-primary/50",
              )}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">{t.imagePlaceholderNote}</p>
    </div>
  );
}
