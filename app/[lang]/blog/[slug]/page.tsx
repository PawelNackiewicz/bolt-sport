import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryblokStory } from "@storyblok/react/rsc";

import { getDictionary } from "@/src/i18n/dictionaries";
import { isLocale, locales } from "@/src/i18n/config";
import {
  BLOG_RELATIONS,
  formatPublishedAt,
  getBlogPost,
  getBlogPosts,
} from "@/src/lib/blog";

type BlogPostPageProps = { params: Promise<{ lang: string; slug: string }> };

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

  return {
    title,
    alternates: { canonical: `/${lang}/blog/${slug}` },
    openGraph: {
      type: "article",
      title,
      publishedTime: story.first_published_at ?? undefined,
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
