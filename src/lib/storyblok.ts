import { apiPlugin, storyblokInit } from "@storyblok/react/rsc";
import {
  Page,
  Hero,
  ActionCard,
  ActionCardsSection,
  EquipmentCard,
  EquipmentSection,
  IconTextRow,
  ImageTextSection,
  ProcessStep,
  ProcessSection,
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
    hero_section: Hero,
    action_card: ActionCard,
    action_cards_section: ActionCardsSection,
    equipment_card: EquipmentCard,
    equipment_section: EquipmentSection,
    icon_text_row: IconTextRow,
    image_text_section: ImageTextSection,
    process_step: ProcessStep,
    process_section: ProcessSection,
    shop_section: ShopSection,
  },
});

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
