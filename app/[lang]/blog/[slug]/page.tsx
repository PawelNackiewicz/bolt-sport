import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryblokStory } from "@storyblok/react/rsc";

import { JsonLd } from "@/src/components/ui";
import { getDictionary } from "@/src/i18n/dictionaries";
import { isLocale, locales } from "@/src/i18n/config";
import {
  BLOG_RELATIONS,
  formatPublishedAt,
  getBlogPost,
  getBlogPostLocales,
  getBlogPosts,
  toExcerpt,
} from "@/src/lib/blog";
import { articleJsonLd } from "@/src/lib/seo";

type BlogPostPageProps = { params: Promise<{ lang: string; slug: string }> };

/** See the blog listing — the CMS has no publish webhook, so this runs on a timer. */
export const revalidate = 300;

export async function generateStaticParams() {
  const params = await Promise.all(
    locales.map(async (lang) => {
      const stories = await getBlogPosts(lang);
      return stories.map((story) => ({ lang, slug: story.slug }));
    }),
  );

  return params.flat();
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};

  const story = await getBlogPost(lang, slug);
  if (!story) return {};

  const { title, cover_image } = story.content;
  const coverUrl = cover_image?.filename || undefined;
  const description = toExcerpt(story.content);
  const publishedAt =
    story.first_published_at ?? story.published_at ?? undefined;
  const translations = await getBlogPostLocales(slug);

  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}/blog/${slug}`,
      /**
       * Next replaces the parent `alternates` object wholesale rather than
       * merging it, so hreflang has to be restated here. A single self-
       * referencing entry says nothing, hence the `> 1` guard.
       */
      languages:
        translations.length > 1
          ? Object.fromEntries(
              translations.map((locale) => [locale, `/${locale}/blog/${slug}`]),
            )
          : undefined,
    },
    openGraph: {
      type: "article",
      title,
      description,
      publishedTime: publishedAt,
      modifiedTime: story.published_at ?? undefined,
      images: coverUrl ? [{ url: coverUrl }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();

  const story = await getBlogPost(lang, slug);
  if (!story) notFound();

  const dictionary = await getDictionary(lang);
  const publishedAt =
    story.first_published_at ?? story.published_at ?? undefined;

  return (
    <main>
      {/* BreadcrumbList ships with `<Breadcrumbs>` inside the `blog_post` blok. */}
      <JsonLd
        data={articleJsonLd({
          path: `/${lang}/blog/${slug}`,
          headline: story.content.title || story.name,
          locale: lang,
          description: toExcerpt(story.content),
          imageUrl: story.content.cover_image?.filename || undefined,
          publishedAt,
          modifiedAt: story.published_at ?? undefined,
          section: story.content.category || undefined,
        })}
      />
      <StoryblokStory
        story={story}
        locale={lang}
        dictionary={dictionary}
        publishedAt={publishedAt}
        publishedLabel={formatPublishedAt(publishedAt, lang)}
        bridgeOptions={{ resolveRelations: [BLOG_RELATIONS] }}
      />
    </main>
  );
}
