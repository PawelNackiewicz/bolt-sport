import { PageStoryblok } from "@/src/types/component-types-sb";
import { StoryblokServerComponent } from "@storyblok/react/rsc";

type PageProps = {
  blok: PageStoryblok;
};

export default function Page({ blok }: PageProps) {
  return (
    <main>
      <div>
        <h1>{blok.page_title}</h1>
        <p>{blok.seo_description}</p>
      </div>
      {blok.body?.map((nestedBlok) => (
        <StoryblokServerComponent blok={nestedBlok} key={nestedBlok._uid} />
      ))}
    </main>
  );
}
