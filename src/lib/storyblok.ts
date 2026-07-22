import { apiPlugin, storyblokInit } from "@storyblok/react/rsc";
import { Page, Hero } from "@/src/components/storyblok";

export const getStoryblokApi = storyblokInit({
    accessToken: process.env.STORYBLOK_DELIVERY_API_TOKEN,
    use: [apiPlugin],
    apiOptions: {
        region: "eu",
    },
    components: {
        page: Page,
        hero_section: Hero,
    },

});