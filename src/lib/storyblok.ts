import { apiPlugin, storyblokInit } from "@storyblok/react/rsc";
import { Page, Hero } from "@/src/components/storyblok";

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
  },
});
