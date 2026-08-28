import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { buildFacilitiesMetadata, FacilitiesView } from "../_facilities/view";

/** This slug is Polish-only — `/en` and `/de` live at their own translated route. */
const LOCALE = "pl" as const;

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
