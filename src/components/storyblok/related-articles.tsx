import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { BlogPostCard } from "@/src/components/ui";
import { getDictionary } from "@/src/i18n/dictionaries";
import { localePath, type Locale } from "@/src/i18n/config";
import { toBlogPostSummary, toResolvedStories } from "@/src/lib/blog";
import type { RelatedArticlesStoryblok } from "@/src/types/component-types-sb";

type RelatedArticlesProps = {
  blok: RelatedArticlesStoryblok;
  /** Podaje `BlogPost` — blok sam nie wie, w jakim jest locale. */
  locale?: Locale;
};

export async function RelatedArticles({ blok, locale }: RelatedArticlesProps) {
  const stories = toResolvedStories(blok.articles);

  if (stories.length === 0) return null;

  const seeAll = locale ? (await getDictionary(locale)).blog.seeAll : undefined;

  return (
    <section className="flex flex-col gap-8 border-t border-border pt-10">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        {blok.title && (
          <h2 className="font-sans text-xl font-bold tracking-tight sm:text-2xl">
            {blok.title}
          </h2>
        )}
        {locale && seeAll && (
          <Link
            href={localePath(locale, "/blog")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          >
            {seeAll}
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((story) => (
          <BlogPostCard key={story.uuid} post={toBlogPostSummary(story)} />
        ))}
      </div>
    </section>
  );
}
