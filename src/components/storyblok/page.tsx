import { PageStoryblok } from "@/src/types/component-types-sb";
import { StoryblokServerComponent } from "@storyblok/react/rsc";

type PageProps = {
  blok: PageStoryblok;
};

export function Page({ blok }: PageProps) {
  return (
    <main>
      {blok.body?.map((nestedBlok) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </main>
  );
}
