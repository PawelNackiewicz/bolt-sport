import { notFound } from "next/navigation";
import { StoryblokStory } from "@storyblok/react/rsc";

import { getStoryblokApi, storyblokVersion } from "@/src/lib/storyblok";
import { isLocale, type Locale } from "@/src/i18n/config";

type HomeProps = { params: Promise<{ lang: string }> };

export default async function Home({ params }: HomeProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const { data } = await fetchData(lang);

  return (
    <div className="page">
      <StoryblokStory story={data.story} />
    </div>
  );
}

export async function fetchData(lang: Locale) {
  const storyblokApi = getStoryblokApi();
  return await storyblokApi.get(`cdn/stories/${lang}/`, {
    version: storyblokVersion,
  });
}
