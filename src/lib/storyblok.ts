import { apiPlugin, storyblokInit } from "@storyblok/react/rsc";
import Page from "../components/storyblok/Page";

export const getStoryblokApi = storyblokInit({
    accessToken: process.env.STORYBLOK_DELIVERY_API_TOKEN,
    use: [apiPlugin],
    apiOptions: {
        region: "eu",
    },
    components: {
        page: Page,
    },

});