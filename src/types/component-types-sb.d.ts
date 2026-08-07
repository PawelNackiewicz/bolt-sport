import { StoryblokStory } from 'storyblok-generate-ts'

export interface ActionButtonStoryblok {
  text?: string;
  link?: string;
  variant?: "" | "primary" | "secondary" | "link";
  icon_left?: string;
  icon_right?: string;
  aria_label?: string;
  _uid: string;
  component: "action_button";
  [k: string]: unknwon;
}

export interface ActionCardStoryblok {
  icon?: string;
  title?: string;
  text?: string;
  linkLabel?: string;
  link?: string;
  _uid: string;
  component: "action_card";
  [k: string]: unknwon;
}

export interface ActionCardsSectionStoryblok {
  pre_title?: string;
  title?: string;
  description?: string;
  cards?: ActionCardStoryblok[];
  _uid: string;
  component: "action_cards_section";
  [k: string]: unknwon;
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
    [k: string]: unknwon;
  };
  is_external_url?: boolean;
  [k: string]: unknwon;
}

export interface BlogPostStoryblok {
  title?: string;
  category?: string;
  cover_image?: AssetStoryblok;
  image_caption?: string;
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
    | HighlightedCtaStoryblok
    | IconTextRowStoryblok
    | ImageTextSectionStoryblok
    | InlineCtaStoryblok
    | NumberedFeatureItemStoryblok
    | NumberedFeaturesStoryblok
    | PageStoryblok
    | ProcessSectionStoryblok
    | ProcessStepStoryblok
    | RelatedArticlesStoryblok
    | RichTextSectionStoryblok
    | ShopSectionStoryblok
    | TrustBarStoryblok
    | TrustItemStoryblok
  )[];
  _uid: string;
  component: "blog_post";
  [k: string]: unknwon;
}

export interface CtaGroupStoryblok {
  alignment?: "" | "left" | "right";
  primary_button?: ActionButtonStoryblok[];
  secondary_button?: ActionButtonStoryblok[];
  _uid: string;
  component: "cta_group";
  [k: string]: unknwon;
}

export interface RichtextStoryblok {
  type: string;
  content?: RichtextStoryblok[];
  marks?: RichtextStoryblok[];
  attrs?: unknwon;
  text?: string;
  [k: string]: unknwon;
}

export interface EquipmentCardStoryblok {
  icon?: string;
  title?: string;
  description?: string;
  features?: RichtextStoryblok;
  _uid: string;
  component: "equipment_card";
  [k: string]: unknwon;
}

export interface EquipmentSectionStoryblok {
  pre_title?: string;
  title?: string;
  description?: string;
  cards?: EquipmentCardStoryblok[];
  cta_button?: ActionButtonStoryblok[];
  _uid: string;
  component: "equipment_section";
  [k: string]: unknwon;
}

export interface HeroBodyStoryblok {
  description?: string;
  _uid: string;
  component: "hero_body";
  [k: string]: unknwon;
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
  [k: string]: unknwon;
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
    | HighlightedCtaStoryblok
    | IconTextRowStoryblok
    | ImageTextSectionStoryblok
    | InlineCtaStoryblok
    | NumberedFeatureItemStoryblok
    | NumberedFeaturesStoryblok
    | PageStoryblok
    | ProcessSectionStoryblok
    | ProcessStepStoryblok
    | RelatedArticlesStoryblok
    | RichTextSectionStoryblok
    | ShopSectionStoryblok
    | TrustBarStoryblok
    | TrustItemStoryblok
  )[];
  _uid: string;
  component: "hero_section";
  [k: string]: unknwon;
}

export interface HighlightedCtaStoryblok {
  pre_title?: string;
  title?: string;
  description?: string;
  button_primary?: ActionButtonStoryblok[];
  button_secondary?: ActionButtonStoryblok[];
  _uid: string;
  component: "highlighted_cta";
  [k: string]: unknwon;
}

export interface IconTextRowStoryblok {
  icon?: string;
  title?: string;
  description?: string;
  _uid: string;
  component: "icon_text_row";
  [k: string]: unknwon;
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
  [k: string]: unknwon;
}

export interface InlineCtaStoryblok {
  pre_title?: string;
  title?: string;
  cta_button?: ActionButtonStoryblok[];
  phone?: string;
  _uid: string;
  component: "inline_cta";
  [k: string]: unknwon;
}

export interface NumberedFeatureItemStoryblok {
  title?: string;
  description?: string;
  _uid: string;
  component: "numbered_feature_item";
  [k: string]: unknwon;
}

export interface NumberedFeaturesStoryblok {
  title?: string;
  items?: NumberedFeatureItemStoryblok[];
  _uid: string;
  component: "numbered_features";
  [k: string]: unknwon;
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
    | HighlightedCtaStoryblok
    | IconTextRowStoryblok
    | ImageTextSectionStoryblok
    | InlineCtaStoryblok
    | NumberedFeatureItemStoryblok
    | NumberedFeaturesStoryblok
    | PageStoryblok
    | ProcessSectionStoryblok
    | ProcessStepStoryblok
    | RelatedArticlesStoryblok
    | RichTextSectionStoryblok
    | ShopSectionStoryblok
    | TrustBarStoryblok
    | TrustItemStoryblok
  )[];
  _uid: string;
  component: "page";
  uuid?: string;
  [k: string]: unknwon;
}

export interface ProcessSectionStoryblok {
  pre_title?: string;
  title?: string;
  description?: string;
  steps?: ProcessStepStoryblok[];
  _uid: string;
  component: "process_section";
  [k: string]: unknwon;
}

export interface ProcessStepStoryblok {
  icon?: string;
  title?: string;
  description?: string;
  _uid: string;
  component: "process_step";
  [k: string]: unknwon;
}

export interface RelatedArticlesStoryblok {
  title?: string;
  articles?: any[];
  _uid: string;
  component: "related_articles";
  [k: string]: unknwon;
}

export interface RichTextSectionStoryblok {
  content?: RichtextStoryblok;
  _uid: string;
  component: "rich_text_section";
  [k: string]: unknwon;
}

export interface ShopSectionStoryblok {
  _uid: string;
  component: "shop_section";
  [k: string]: unknwon;
}

export interface TrustBarStoryblok {
  items?: TrustItemStoryblok[];
  _uid: string;
  component: "trust_bar";
  [k: string]: unknwon;
}

export interface TrustItemStoryblok {
  icon?: string;
  label?: string;
  value?: string;
  link?: string;
  highlight: boolean;
  _uid: string;
  component: "trust_item";
  [k: string]: unknwon;
}
