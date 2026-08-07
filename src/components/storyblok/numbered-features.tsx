import type { NumberedFeaturesStoryblok } from "@/src/types/component-types-sb";
import { NumberedFeatureItem } from "./numbered-feature-item";

type NumberedFeaturesProps = {
  blok: NumberedFeaturesStoryblok;
};

export function NumberedFeatures({ blok }: NumberedFeaturesProps) {
  const items = blok.items ?? [];

  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      {blok.title && (
        <h2 className="relative pt-6 font-sans text-xl font-bold leading-snug tracking-tight before:absolute before:left-0 before:top-0 before:h-[3px] before:w-10 before:bg-primary before:content-[''] sm:text-2xl">
          {blok.title}
        </h2>
      )}
      <ol className="flex flex-col">
        {items.map((item, index) => (
          <NumberedFeatureItem key={item._uid} blok={item} index={index} />
        ))}
      </ol>
    </section>
  );
}
