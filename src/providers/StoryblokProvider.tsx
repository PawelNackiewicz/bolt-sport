import { getStoryblokApi } from "../lib/storyblok";

type StoryblokProviderProps = {
  children: React.ReactNode;
};

export default function StoryblokProvider({
  children,
}: StoryblokProviderProps) {
  getStoryblokApi();
  return children;
}
