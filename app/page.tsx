import { getStoryblokApi } from "@/src/lib/storyblok";
import { StoryblokStory } from "@storyblok/react/rsc";

export default async function Home() {
  const { data } = await fetchData();
  console.log("data", data);

  return (
    <div className="page">
      <StoryblokStory story={data.story} />
    </div>
  );
}

export async function fetchData() {
  const storyblokApi = getStoryblokApi();
  console.log("storyblokApi", storyblokApi);
  return await storyblokApi.get(`cdn/stories/pl/`, { version: "draft" });
}
