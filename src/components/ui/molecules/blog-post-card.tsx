import Image from "next/image";
import Link from "next/link";

import type { BlogPostSummary } from "@/src/lib/blog";

type BlogPostCardProps = {
  post: BlogPostSummary;
  /** Already localized — the caller formats it, so this stays a server component. */
  publishedLabel?: string;
};

export function BlogPostCard({ post, publishedLabel }: BlogPostCardProps) {
  return (
    <article className="group relative flex h-full flex-col gap-4">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
        {post.imageUrl && (
          <Image
            src={post.imageUrl}
            alt={post.imageAlt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {post.category && (
          <span className="kicker text-primary">{post.category}</span>
        )}

        <h3 className="font-sans text-base font-bold leading-snug tracking-tight text-foreground">
          <Link
            href={post.href}
            className="transition-colors after:absolute after:inset-0 group-hover:text-primary"
          >
            {post.title}
          </Link>
        </h3>

        {publishedLabel && (
          <time
            dateTime={post.publishedAt}
            className="text-muted-foreground mt-auto pt-1 text-xs"
          >
            {publishedLabel}
          </time>
        )}
      </div>
    </article>
  );
}
