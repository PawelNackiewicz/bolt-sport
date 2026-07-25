import { Container } from "@/src/components/ui";
import type { EquipmentSectionStoryblok } from "@/src/types/component-types-sb";
import { ActionButton } from "./action-button";
import { EquipmentCard } from "./equipment-card";

type EquipmentSectionProps = {
  blok: EquipmentSectionStoryblok;
};

export function EquipmentSection({ blok }: EquipmentSectionProps) {
  const cards = blok.cards ?? [];
  const ctaButton = blok.cta_button?.[0];

  if (cards.length === 0) return null;

  const hasHeading = blok.pre_title || blok.title || blok.description;

  return (
    <section className="py-16 sm:py-20">
      <Container className="flex flex-col gap-10">
        {hasHeading && (
          <div className="flex flex-col gap-3">
            {blok.pre_title && (
              <span className="kicker flex items-center gap-2 text-primary">
                <span className="inline-block h-px w-6 bg-primary" />
                {blok.pre_title}
              </span>
            )}
            {blok.title && (
              <h2 className="text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                {blok.title}
              </h2>
            )}
            {blok.description && (
              <p className="text-muted-foreground max-w-2xl leading-relaxed">
                {blok.description}
              </p>
            )}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <EquipmentCard key={card._uid} blok={card} />
          ))}
        </div>

        {ctaButton && <ActionButton blok={ctaButton} />}
      </Container>
    </section>
  );
}
