import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildFacilitiesMetadata, FacilitiesView } from "../_facilities/view";

/** German translation of `/wyposazenie-sal` — see that folder's page.tsx. */
const LOCALE = "de" as const;

type FacilitiesPageProps = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return [{ lang: LOCALE }];
}

export async function generateMetadata({
  params,
}: FacilitiesPageProps): Promise<Metadata> {
  const { lang } = await params;
  if (lang !== LOCALE) return {};

  return buildFacilitiesMetadata(LOCALE);
}

export default async function FacilitiesPage({ params }: FacilitiesPageProps) {
  const { lang } = await params;
  if (lang !== LOCALE) notFound();

  return <FacilitiesView lang={LOCALE} />;
}
