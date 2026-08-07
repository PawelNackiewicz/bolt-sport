import type { NumberedFeatureItemStoryblok } from "@/src/types/component-types-sb";

type NumberedFeatureItemProps = {
  blok: NumberedFeatureItemStoryblok;
  index?: number;
};

export function NumberedFeatureItem({ blok, index }: NumberedFeatureItemProps) {
  return (
    <li className="flex flex-col gap-2 border-t border-border py-5">
      <div className="flex items-baseline gap-3">
        {index !== undefined && (
          <span className="font-mono text-sm font-medium text-primary tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
        {blok.title && (
          <h3 className="font-sans text-base font-bold leading-snug tracking-tight text-foreground">
            {blok.title}
          </h3>
        )}
      </div>
      {blok.description && (
        <p className="text-muted-foreground text-[0.95rem] leading-[1.75]">
          {blok.description}
        </p>
      )}
    </li>
  );
}
