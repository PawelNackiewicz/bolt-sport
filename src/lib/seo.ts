import type { Locale } from "@/src/i18n/config";
import { absoluteUrl } from "./site-url";

type JsonLdPayload = Record<string, unknown>;

const PUBLISHER = {
  "@type": "Organization",
  name: "Bolt-Sport",
  url: absoluteUrl("/"),
} as const;

export type BreadcrumbEntry = {
  label: string;
  /** Missing on the current page — that entry gets no `item`. */
  href?: string;
};

/** schema.org BreadcrumbList mirroring the breadcrumb trail actually rendered. */
export function breadcrumbJsonLd(items: BreadcrumbEntry[]): JsonLdPayload {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
}

export type ArticleJsonLdInput = {
  /** Internal path of the article, e.g. `/pl/blog/jak-wycenic-ring`. */
  path: string;
  headline: string;
  locale: Locale;
  description?: string;
  imageUrl?: string;
  publishedAt?: string;
  modifiedAt?: string;
  section?: string;
};

export function articleJsonLd(article: ArticleJsonLdInput): JsonLdPayload {
  const url = absoluteUrl(article.path);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: article.headline,
    inLanguage: article.locale,
    publisher: PUBLISHER,
    ...(article.description ? { description: article.description } : {}),
    ...(article.imageUrl ? { image: [article.imageUrl] } : {}),
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    ...(article.modifiedAt ? { dateModified: article.modifiedAt } : {}),
    ...(article.section ? { articleSection: article.section } : {}),
  };
}
