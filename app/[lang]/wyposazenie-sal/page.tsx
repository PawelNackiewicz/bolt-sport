import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  AssemblySteps,
  ClosingCta,
  CoverageMap,
  FacilitiesContact,
  FacilitiesFaq,
  FacilitiesHero,
  FacilitiesStats,
  FacilityTypes,
  ProcessTimeline,
  ProductionSite,
  ProjectsList,
  Qualifier,
  Ring360,
  ScrollEffects,
  StickyCta,
} from "@/src/components/facilities";
import { isLocale, locales } from "@/src/i18n/config";

type FacilitiesPageProps = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Copy on this page is Polish under every locale for now — so is the metadata.
export const metadata: Metadata = {
  title:
    "Wyposażenie sal bokserskich i MMA — ringi, klatki, worki, maty | bolt-sport",
  description:
    "Projektujemy, produkujemy i montujemy wyposażenie sal bokserskich i MMA. Ringi, klatki, worki i maty. Produkcja w Krasiejowie, montaż w całej Polsce.",
};

export default async function FacilitiesPage({ params }: FacilitiesPageProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <main className="overflow-x-clip">
      <ScrollEffects />
      <FacilitiesHero />
      <FacilitiesStats />
      <AssemblySteps />
      <ProductionSite />
      <FacilityTypes />
      <Ring360 />
      <ProjectsList />
      <CoverageMap />
      <ProcessTimeline />
      <Qualifier />
      <FacilitiesFaq />
      <FacilitiesContact />
      <ClosingCta />
      <StickyCta />
    </main>
  );
}
