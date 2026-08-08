import type { MetadataRoute } from "next";

import { locales } from "@/src/i18n/config";
import { getBlogPosts } from "@/src/lib/blog";
import { absoluteUrl } from "@/src/lib/site-url";

/** Matches the blog routes — a sitemap frozen at build time misses new articles. */
export const revalidate = 300;

/** `{ pl: "/pl/blog", de: "/de/blog", … }` for a path shared by every locale. */
function languageAlternates(path: string): Record<string, string> {
  return Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(`/${locale}${path}`)]),
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const postsByLocale = await Promise.all(
    locales.map(async (locale) => ({
      locale,
      stories: await getBlogPosts(locale),
    })),
  );

  const landingPages: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    {
      url: absoluteUrl(`/${locale}`),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: languageAlternates("") },
    },
    {
      url: absoluteUrl(`/${locale}/blog`),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages: languageAlternates("/blog") },
    },
  ]);

  /**
   * Articles carry no cross-locale link in Storyblok, so each one is listed on
   * its own — see `getBlogPostLocales` for why a shared slug is the only hint
   * that a translation exists.
   */
  const articles: MetadataRoute.Sitemap = postsByLocale.flatMap(
    ({ locale, stories }) =>
      stories.map((story) => ({
        url: absoluteUrl(`/${locale}/blog/${story.slug}`),
        lastModified: story.published_at ?? story.first_published_at ?? undefined,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })),
  );

  return [...landingPages, ...articles];
}
