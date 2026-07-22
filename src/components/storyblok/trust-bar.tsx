import type { TrustBarStoryblok } from "@/src/types/component-types-sb";
import { TrustItem } from "./trust-item";

type TrustBarProps = {
  blok: TrustBarStoryblok;
};

export function TrustBar({ blok }: TrustBarProps) {
  const items = blok.items ?? [];

  if (items.length === 0) return null;

  return (
    <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-3 border-t border-border/70 pt-6">
      {items.map((item) => (
        <TrustItem key={item._uid} blok={item} />
      ))}
    </ul>
  );
}
