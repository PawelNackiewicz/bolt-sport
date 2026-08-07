import { cache } from "react";
import type { ISbStoryData } from "@storyblok/react/rsc";

import type { BlogPostStoryblok } from "@/src/types/component-types-sb";
import { getStories, getStory } from "./storyblok";
import type { Locale } from "@/src/i18n/config";

/** Content type of a single article in Storyblok. */
export const BLOG_CONTENT_TYPE = "blog_post";

/** `articles` in `related_articles` holds story UUIDs — this resolves them to full stories. */
export const BLOG_RELATIONS = "related_articles.articles";

export type BlogStory = ISbStoryData<BlogPostStoryblok>;

/** Flattened article, ready for a listing card. */
export type BlogPostSummary = {
  uuid: string;
  /** Locale-prefixed path, e.g. `/pl/blog/jak-wycenic-ring`. */
  href: string;
  title: string;
  category?: string;
  imageUrl?: string;
  imageAlt: string;
  publishedAt?: string;
};

/** Root of the blog for a given locale, as used by the Storyblok CDN (`pl/blog/`). */
function blogRoot(locale: Locale): string {
  return `${locale}/blog/`;
}

/** `cache` dedupes — `generateMetadata` i sam route pytają o tę samą historię. */
export const getBlogPosts = cache(
  async (locale: Locale): Promise<BlogStory[]> => {
    const stories = await getStories({
      starts_with: blogRoot(locale),
      content_type: BLOG_CONTENT_TYPE,
      sort_by: "first_published_at:desc",
      per_page: 100,
    });

    return stories as BlogStory[];
  },
);

export const getBlogPost = cache(
  async (locale: Locale, slug: string): Promise<BlogStory | null> => {
    const story = await getStory(`${blogRoot(locale)}${slug}`, {
      resolve_relations: BLOG_RELATIONS,
    });

    return story as BlogStory | null;
  },
);

export function toBlogPostSummary(story: BlogStory): BlogPostSummary {
  const content = story.content;
  const filename = content?.cover_image?.filename;

  return {
    uuid: story.uuid,
    // `full_slug` already carries the locale prefix, so no `localePath` needed.
    href: `/${story.full_slug}`,
    title: content?.title || story.name,
    category: content?.category || undefined,
    imageUrl: filename || undefined,
    imageAlt: content?.cover_image?.alt || content?.title || story.name,
    publishedAt: story.first_published_at ?? story.published_at ?? undefined,
  };
}

/**
 * `related_articles.articles` arrives either as resolved stories (when
 * `resolve_relations` matched) or as bare UUID strings — keep only the former.
 */
export function toResolvedStories(articles: unknown): BlogStory[] {
  if (!Array.isArray(articles)) return [];

  return articles.filter(
    (entry): entry is BlogStory =>
      typeof entry === "object" && entry !== null && "full_slug" in entry,
  );
}

export function formatPublishedAt(
  value: string | undefined,
  locale: Locale,
): string | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
