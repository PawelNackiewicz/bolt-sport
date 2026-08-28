import type { Metadata } from "next";

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
} from "./_components";
import { getDictionary } from "@/src/i18n/dictionaries";
import { locales, type Locale } from "@/src/i18n/config";
import { facilitiesSlugs } from "@/src/lib/site-data";

/**
 * Shared between the three locale-specific route folders
 * (`wyposazenie-sal`, `gym-fit-out`, `hallenausstattung`) — each locale gets
 * its own translated URL slug instead of one shared Polish path, so the page
 * itself lives here and every route folder is a thin, locale-pinned wrapper.
 */
export async function buildFacilitiesMetadata(lang: Locale): Promise<Metadata> {
  const { facilities } = await getDictionary(lang);

  return {
    title: facilities.meta.title,
    description: facilities.meta.description,
    openGraph: {
      type: "website",
      title: facilities.meta.title,
      description: facilities.meta.description,
    },
    alternates: {
      canonical: `/${lang}/${facilitiesSlugs[lang]}`,
      languages: Object.fromEntries(
        locales.map((locale) => [locale, `/${locale}/${facilitiesSlugs[locale]}`]),
      ),
    },
  };
}

export async function FacilitiesView({ lang }: { lang: Locale }) {
  const { facilities } = await getDictionary(lang);

  return (
    <main className="overflow-x-clip">
      <ScrollEffects />
      <FacilitiesHero content={facilities.hero} />
      <FacilitiesStats stats={facilities.stats} />
      <AssemblySteps content={facilities.assembly} />
      <ProductionSite content={facilities.production} />
      <FacilityTypes content={facilities.facilityTypes} />
      <Ring360 content={facilities.ring360} />
      <ProjectsList content={facilities.projects} />
      <CoverageMap content={facilities.coverageMap} />
      <ProcessTimeline content={facilities.process} />
      <Qualifier content={facilities.qualifier} />
      <FacilitiesFaq content={facilities.faq} />
      <FacilitiesContact content={facilities.contact} />
      <ClosingCta content={facilities.closing} />
      <StickyCta content={facilities.stickyCta} />
    </main>
  );
}
