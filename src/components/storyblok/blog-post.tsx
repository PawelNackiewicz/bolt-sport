import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { StoryblokServerComponent } from "@storyblok/react/rsc";

import { Breadcrumbs, Container, type Crumb } from "@/src/components/ui";
import { localePath, type Dictionary, type Locale } from "@/src/i18n/config";
import type { BlogPostStoryblok } from "@/src/types/component-types-sb";

type BlogPostProps = {
  blok: BlogPostStoryblok;
  locale?: Locale;
  dictionary?: Dictionary;
  publishedAt?: string;
  publishedLabel?: string;
};

export function BlogPost({
  blok,
  locale,
  dictionary,
  publishedAt,
  publishedLabel,
}: BlogPostProps) {
  const coverUrl = blok.cover_image?.filename || undefined;
  const t = dictionary?.blog;

  const crumbs: Crumb[] =
    locale && t
      ? [
          { label: t.home, href: localePath(locale, "/") },
          { label: t.title, href: localePath(locale, "/blog") },
          ...(blok.title ? [{ label: blok.title }] : []),
        ]
      : [];

  return (
    <article className="pb-16 pt-6 sm:pb-24">
      <Container className="flex max-w-3xl flex-col gap-8">
        {crumbs.length > 0 && t && (
          <Breadcrumbs label={t.breadcrumbLabel} items={crumbs} />
        )}

        <header className="flex flex-col gap-4">
          {blok.category && (
            <span className="kicker text-primary">{blok.category}</span>
          )}
          {blok.title && (
            <h1 className="font-sans text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
              {blok.title}
            </h1>
          )}

          {publishedLabel && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <CalendarDays className="size-4 text-primary" aria-hidden />
              <time dateTime={publishedAt}>{publishedLabel}</time>
            </div>
          )}
        </header>

        {coverUrl && (
          <figure className="flex flex-col gap-3">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={coverUrl}
                alt={blok.cover_image?.alt || blok.title || ""}
                fill
                priority
                sizes="(min-width: 768px) 768px, 100vw"
                className="object-cover"
              />
            </div>
            {blok.image_caption && (
              <figcaption className="text-muted-foreground text-center text-xs">
                {blok.image_caption}
              </figcaption>
            )}
          </figure>
        )}

        <div className="flex flex-col gap-8">
          {blok.body?.map((nestedBlok) => (
            <StoryblokServerComponent
              blok={nestedBlok}
              key={nestedBlok._uid}
              locale={locale}
            />
          ))}
        </div>
      </Container>
    </article>
  );
}
