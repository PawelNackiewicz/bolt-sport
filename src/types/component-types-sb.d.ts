import { StoryblokStory } from 'storyblok-generate-ts'

export type MultilinkStoryblok =
  | {
    id?: string;
    cached_url?: string;
    anchor?: string;
    linktype?: "story";
    target?: "_self" | "_blank";
    [k: string]: unknown;
  }
  | {
    url?: string;
    cached_url?: string;
    anchor?: string;
    linktype?: "asset" | "url";
    target?: "_self" | "_blank";
    [k: string]: unknown;
  }
  | {
    email?: string;
    linktype?: "email";
    target?: "_self" | "_blank";
    [k: string]: unknown;
  };

export interface ActionButtonStoryblok {
  text?: string;
  link?: Exclude<MultilinkStoryblok, { linktype?: "email" } | { linktype?: "asset" }>;
  link_target?: Exclude<MultilinkStoryblok, { linktype?: "email" } | { linktype?: "asset" }>;
  style_variant?: "" | "primary" | "secondary";
  icon?: string;
  aria_label?: string;
  _uid: string;
  component: "Action Button";
  [k: string]: unknown;
}

export interface AssetStoryblok {
  _uid?: string;
  id: number | null;
  alt: string | null;
  name: string;
  focus: string | null;
  source: string | null;
  title: string | null;
  filename: string;
  copyright: string | null;
  fieldtype?: string;
  meta_data?: null | {
    [k: string]: unknown;
  };
  is_external_url?: boolean;
  [k: string]: unknown;
}

export interface RichtextStoryblok {
  type: string;
  content?: RichtextStoryblok[];
  marks?: RichtextStoryblok[];
  attrs?: unknown;
  text?: string;
  [k: string]: unknown;
}

export interface BlogPostStoryblok {
  title?: string;
  featured_image?: AssetStoryblok;
  featured_image_alt?: string;
  seo_title?: string;
  seo_description?: string;
  canonical_url?: string;
  faq_items?: RichtextStoryblok;
  body?: (
    | ActionButtonStoryblok
    | BlogPostStoryblok
    | CtaBannerStoryblok
    | HeroFeaturedPostStoryblok
    | HeroImageStoryblok
    | PageStoryblok
  )[];
  _uid: string;
  component: "blog_post";
  [k: string]: unknown;
}

export interface CtaBannerStoryblok {
  headline?: string;
  text?: string;
  secondary_cta_button?: (
    | ActionButtonStoryblok
    | BlogPostStoryblok
    | CtaBannerStoryblok
    | HeroFeaturedPostStoryblok
    | HeroImageStoryblok
    | PageStoryblok
  )[];
  _uid: string;
  component: "CTA Banner";
  [k: string]: unknown;
}

export interface HeroFeaturedPostStoryblok {
  headline?: string;
  intro?: string;
  background_image?: AssetStoryblok;
  background_image_alt?: string;
  CTA?: (
    | ActionButtonStoryblok
    | BlogPostStoryblok
    | CtaBannerStoryblok
    | HeroFeaturedPostStoryblok
    | HeroImageStoryblok
    | PageStoryblok
  )[];
  _uid: string;
  component: "Hero Featured Post";
  [k: string]: unknown;
}

export interface HeroImageStoryblok {
  headline?: string;
  subheadline?: string;
  image?: AssetStoryblok;
  image_alt?: string;
  image_title?: string;
  primary_cta?: unknown[];
  secondary_cta?: (
    | ActionButtonStoryblok
    | BlogPostStoryblok
    | CtaBannerStoryblok
    | HeroFeaturedPostStoryblok
    | HeroImageStoryblok
    | PageStoryblok
  )[];
  _uid: string;
  component: "Hero Image";
  [k: string]: unknown;
}

export interface PageStoryblok {
  page_title?: string;
  seo_description?: string;
  body?: (
    | ActionButtonStoryblok
    | BlogPostStoryblok
    | CtaBannerStoryblok
    | HeroFeaturedPostStoryblok
    | HeroImageStoryblok
    | PageStoryblok
  )[];
  _uid: string;
  component: "page";
  uuid?: string;
  [k: string]: unknown;
}
