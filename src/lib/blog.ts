import { cache } from "react";
import type { ISbStoryData } from "@storyblok/react/rsc";

import type {
  BlogPostStoryblok,
  RichtextStoryblok,
} from "@/src/types/component-types-sb";
import { getStories, getStory } from "./storyblok";
import { locales, type Locale } from "@/src/i18n/config";

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

/** Search engines cut meta descriptions around here. */
const EXCERPT_MAX_LENGTH = 160;

/** Concatenates every text leaf below a richtext node. */
function nodeText(node: RichtextStoryblok): string {
  if (typeof node.text === "string") return node.text;
  if (!Array.isArray(node.content)) return "";

  return node.content.map(nodeText).join("");
}

function truncateAtWord(text: string, maxLength: number): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;

  const cut = normalized.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  const trimmed = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;

  return `${trimmed.replace(/[\s.,;:–—-]+$/, "")}…`;
}

/**
 * Meta description for an article. The `blog_post` schema carries no SEO field,
 * so the opening paragraphs of the body are the only per-article copy there is.
 * Give the content type a real excerpt field and this should read that instead.
 */
export function toExcerpt(content: BlogPostStoryblok): string | undefined {
  const paragraphs: string[] = [];

  for (const blok of content.body ?? []) {
    if (blok.component !== "rich_text_section") continue;

    for (const node of blok.content?.content ?? []) {
      if (node.type !== "paragraph") continue;

      const text = nodeText(node).trim();
      if (text) paragraphs.push(text);
    }

    if (paragraphs.join(" ").length >= EXCERPT_MAX_LENGTH) break;
  }

  if (paragraphs.length === 0) return undefined;

  return truncateAtWord(paragraphs.join(" "), EXCERPT_MAX_LENGTH);
}

/**
 * Locales that publish an article under this slug. Each locale lives in its own
 * Storyblok folder with no cross-links (the CDN returns `alternates: []` and
 * `translated_slugs: null`), so a shared slug is the only evidence of a
 * translation — anything else would emit hreflang pointing at 404s.
 */
export const getBlogPostLocales = cache(
  async (slug: string): Promise<Locale[]> => {
    const matches = await Promise.all(
      locales.map(async (locale) => {
        const stories = await getBlogPosts(locale);
        return stories.some((story) => story.slug === slug) ? locale : null;
      }),
    );

    return matches.filter((locale): locale is Locale => locale !== null);
  },
);

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
