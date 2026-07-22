import { StoryblokStory } from 'storyblok-generate-ts'

export interface ActionButtonStoryblok {
  text?: string;
  link?: string;
  variant?: "" | "primary" | "secondary";
  icon_left?: string;
  icon_right?: string;
  aria_label?: string;
  _uid: string;
  component: "action_button";
  [k: string]: unknown;
}

export interface ActionCardStoryblok {
  icon?: string;
  title?: string;
  text?: string;
  linkLabel?: string;
  link?: string;
  _uid: string;
  component: "action_card";
  [k: string]: unknown;
}

export interface ActionCardsSectionStoryblok {
  pre_title?: string;
  title?: string;
  description?: string;
  cards?: ActionCardStoryblok[];
  _uid: string;
  component: "action_cards_section";
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
    | ActionCardStoryblok
    | ActionCardsSectionStoryblok
    | BlogPostStoryblok
    | CtaGroupStoryblok
    | EquipmentCardStoryblok
    | EquipmentSectionStoryblok
    | HeroBodyStoryblok
    | HeroHeadlineGroupStoryblok
    | HeroSectionStoryblok
    | IconTextRowStoryblok
    | ImageTextSectionStoryblok
    | PageStoryblok
    | ProcessSectionStoryblok
    | ProcessStepStoryblok
    | TrustBarStoryblok
    | TrustItemStoryblok
  )[];
  _uid: string;
  component: "blog_post";
  [k: string]: unknown;
}

export interface CtaGroupStoryblok {
  alignment?: "" | "left" | "right";
  primary_button?: ActionButtonStoryblok[];
  secondary_button?: ActionButtonStoryblok[];
  _uid: string;
  component: "cta_group";
  [k: string]: unknown;
}

export interface EquipmentCardStoryblok {
  icon?: string;
  title?: string;
  description?: string;
  features?: RichtextStoryblok;
  _uid: string;
  component: "equipment_card";
  [k: string]: unknown;
}

export interface EquipmentSectionStoryblok {
  pre_title?: string;
  title?: string;
  description?: string;
  cards?: EquipmentCardStoryblok[];
  cta_button?: ActionButtonStoryblok[];
  _uid: string;
  component: "equipment_section";
  [k: string]: unknown;
}

export interface HeroBodyStoryblok {
  description?: string;
  _uid: string;
  component: "hero_body";
  [k: string]: unknown;
}

export interface HeroHeadlineGroupStoryblok {
  eyebrow?: string;
  eyebrow_icon?: string;
  title_prefix?: string;
  title_highlight?: string;
  title?: string;
  title_seo_override?: string;
  _uid: string;
  component: "hero_headline_group";
  [k: string]: unknown;
}

export interface HeroSectionStoryblok {
  content_alignment?: "" | "left" | "right";
  background_image_dark?: AssetStoryblok;
  background_image_light?: AssetStoryblok;
  background_image_alt?: string;
  body?: (
    | ActionButtonStoryblok
    | ActionCardStoryblok
    | ActionCardsSectionStoryblok
    | BlogPostStoryblok
    | CtaGroupStoryblok
    | EquipmentCardStoryblok
    | EquipmentSectionStoryblok
    | HeroBodyStoryblok
    | HeroHeadlineGroupStoryblok
    | HeroSectionStoryblok
    | IconTextRowStoryblok
    | ImageTextSectionStoryblok
    | PageStoryblok
    | ProcessSectionStoryblok
    | ProcessStepStoryblok
    | TrustBarStoryblok
    | TrustItemStoryblok
  )[];
  _uid: string;
  component: "hero_section";
  [k: string]: unknown;
}

export interface IconTextRowStoryblok {
  icon?: string;
  title?: string;
  description?: string;
  _uid: string;
  component: "icon_text_row";
  [k: string]: unknown;
}

export interface ImageTextSectionStoryblok {
  image?: AssetStoryblok;
  badge_subtitle?: string;
  badge_title?: string;
  pre_title?: string;
  title?: string;
  features?: IconTextRowStoryblok[];
  image_position?: "" | "left" | "right";
  cta_button?: ActionButtonStoryblok[];
  _uid: string;
  component: "image_text_section";
  [k: string]: unknown;
}

export interface PageStoryblok {
  page_title?: string;
  seo_description?: string;
  body?: (
    | ActionButtonStoryblok
    | ActionCardStoryblok
    | ActionCardsSectionStoryblok
    | BlogPostStoryblok
    | CtaGroupStoryblok
    | EquipmentCardStoryblok
    | EquipmentSectionStoryblok
    | HeroBodyStoryblok
    | HeroHeadlineGroupStoryblok
    | HeroSectionStoryblok
    | IconTextRowStoryblok
    | ImageTextSectionStoryblok
    | PageStoryblok
    | ProcessSectionStoryblok
    | ProcessStepStoryblok
    | TrustBarStoryblok
    | TrustItemStoryblok
  )[];
  _uid: string;
  component: "page";
  uuid?: string;
  [k: string]: unknown;
}

export interface ProcessSectionStoryblok {
  pre_title?: string;
  title?: string;
  description?: string;
  steps?: ProcessStepStoryblok[];
  _uid: string;
  component: "process_section";
  [k: string]: unknown;
}

export interface ProcessStepStoryblok {
  icon?: string;
  title?: string;
  description?: string;
  _uid: string;
  component: "process_step";
  [k: string]: unknown;
}

export interface TrustBarStoryblok {
  items?: TrustItemStoryblok[];
  _uid: string;
  component: "trust_bar";
  [k: string]: unknown;
}

export interface TrustItemStoryblok {
  icon?: string;
  label?: string;
  value?: string;
  link?: string;
  highlight: boolean;
  _uid: string;
  component: "trust_item";
  [k: string]: unknown;
}
