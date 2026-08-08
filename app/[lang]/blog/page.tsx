import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPostCard, Breadcrumbs, Container } from "@/src/components/ui";
import { getDictionary } from "@/src/i18n/dictionaries";
import { isLocale, locales, localePath } from "@/src/i18n/config";
import { formatPublishedAt, getBlogPosts, toBlogPostSummary } from "@/src/lib/blog";

type BlogIndexProps = { params: Promise<{ lang: string }> };

/**
 * Storyblok has no publish webhook wired up, so the listing is rebuilt on a
 * timer — without this the page is frozen at build time and a newly published
 * article never shows up. Must stay a literal for Next to read it statically.
 */
export const revalidate = 300;

export async function generateMetadata({
  params,
}: BlogIndexProps): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};

  const { blog } = await getDictionary(lang);

  return {
    title: blog.title,
    description: blog.description,
    openGraph: {
      type: "website",
      title: blog.title,
      description: blog.description,
    },
    alternates: {
      canonical: `/${lang}/blog`,
      languages: Object.fromEntries(
        locales.map((locale) => [locale, `/${locale}/blog`]),
      ),
    },
  };
}

export default async function BlogIndex({ params }: BlogIndexProps) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const { blog } = await getDictionary(lang);
  const stories = await getBlogPosts(lang);

  return (
    <main className="pb-20 pt-6 sm:pb-24">
      <Container className="flex flex-col gap-10">
        <Breadcrumbs
          label={blog.breadcrumbLabel}
          items={[
            { label: blog.home, href: localePath(lang, "/") },
            { label: blog.title },
          ]}
        />

        <header className="border-b border-border pb-10">
          <h1 className="font-sans text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
            {blog.title}
          </h1>
        </header>

        {stories.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed border-border p-10 text-center">
            {blog.empty}
          </p>
        ) : (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => {
              const post = toBlogPostSummary(story);
              return (
                <BlogPostCard
                  key={post.uuid}
                  post={post}
                  publishedLabel={formatPublishedAt(post.publishedAt, lang)}
                />
              );
            })}
          </div>
        )}
      </Container>
    </main>
  );
}
