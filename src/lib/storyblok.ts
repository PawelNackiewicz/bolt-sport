import {
  apiPlugin,
  storyblokInit,
  type ISbStoriesParams,
  type ISbStoryData,
} from "@storyblok/react/rsc";
import {
  Page,
  Hero,
  ActionCard,
  ActionCardsSection,
  BlogPost,
  EquipmentCard,
  EquipmentSection,
  HighlightedCta,
  IconTextRow,
  ImageTextSection,
  InlineCta,
  NumberedFeatureItem,
  NumberedFeatures,
  ProcessStep,
  ProcessSection,
  RelatedArticles,
  RichTextSection,
  ShopSection,
} from "@/src/components/storyblok";

const accessToken = process.env.STORYBLOK_DELIVERY_API_TOKEN;

if (!accessToken) {
  throw new Error(
    "Brak STORYBLOK_DELIVERY_API_TOKEN w env — dodaj token do .env.local (Storyblok → Settings → Access Tokens).",
  );
}

/**
 * Na produkcji czytamy tylko opublikowane historie; lokalnie `draft`,
 * żeby widzieć zmiany z Visual Editora bez publikowania.
 */
export const storyblokVersion =
  process.env.NODE_ENV === "production" ? "published" : "draft";

export const getStoryblokApi = storyblokInit({
  accessToken,
  use: [apiPlugin],
  apiOptions: {
    region: "eu",
  },
  components: {
    page: Page,
    blog_post: BlogPost,
    hero_section: Hero,
    action_card: ActionCard,
    action_cards_section: ActionCardsSection,
    equipment_card: EquipmentCard,
    equipment_section: EquipmentSection,
    highlighted_cta: HighlightedCta,
    icon_text_row: IconTextRow,
    image_text_section: ImageTextSection,
    inline_cta: InlineCta,
    numbered_feature_item: NumberedFeatureItem,
    numbered_features: NumberedFeatures,
    process_step: ProcessStep,
    process_section: ProcessSection,
    related_articles: RelatedArticles,
    rich_text_section: RichTextSection,
    shop_section: ShopSection,
  },
});

/** Storyblok's client rejects with this shape on a non-2xx response. */
function statusOf(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const { status } = error as { status?: unknown };
    return typeof status === "number" ? status : undefined;
  }
  return undefined;
}

/**
 * Zwraca `null` tylko dla brakującej historii (404). Każdy inny błąd —
 * zły token, padnięte API — leci dalej, żeby nie udawał pustej strony.
 */
export async function getStory(
  slug: string,
  params: ISbStoriesParams = {},
): Promise<ISbStoryData | null> {
  const storyblokApi = getStoryblokApi();

  try {
    const { data } = await storyblokApi.get(`cdn/stories/${slug}`, {
      version: storyblokVersion,
      ...params,
    });
    return data.story ?? null;
  } catch (error) {
    if (statusOf(error) === 404) return null;
    throw error;
  }
}

export async function getStories(
  params: ISbStoriesParams = {},
): Promise<ISbStoryData[]> {
  const storyblokApi = getStoryblokApi();
  const { data } = await storyblokApi.get("cdn/stories", {
    version: storyblokVersion,
    ...params,
  });

  return data.stories ?? [];
}

export type ContactData = {
  phone: string;
  email: string;
  address: string;
  nip: string;
  krs: string;
  regon: string;
  legalName: string;
};

type DatasourceEntry = {
  name: string;
  value: string;
};

/**
 * Dane kontaktowe utrzymywane w Storyblok jako datasource `contact-data`
 * (Settings → Datasources), żeby dało się je edytować bez deployu.
 */
export async function getContactData(): Promise<ContactData> {
  const storyblokApi = getStoryblokApi();
  const { data } = await storyblokApi.get("cdn/datasource_entries", {
    datasource: "contact-data",
    version: storyblokVersion,
  });

  const entries: DatasourceEntry[] = data.datasource_entries;
  const byName = Object.fromEntries(
    entries.map((entry) => [entry.name, entry.value]),
  );

  return {
    phone: byName.phone ?? "",
    email: byName.email ?? "",
    address: byName.address ?? "",
    nip: byName.nip ?? "",
    krs: byName.krs ?? "",
    regon: byName.regon ?? "",
    legalName: byName.legal_name ?? "",
  };
}
