import { StoryblokRichText, type SbRichTextDoc } from "@storyblok/react";

import type { RichTextSectionStoryblok } from "@/src/types/component-types-sb";

type RichTextSectionProps = {
  blok: RichTextSectionStoryblok;
};

const PROSE = [
  "flex flex-col gap-5 text-[0.95rem] leading-[1.75] text-muted-foreground sm:text-base",
  "[&_:is(h2,h3,h4):empty]:hidden [&_p:empty]:hidden",
  "[&_h2]:relative [&_h2]:mt-4 [&_h2]:pt-5 [&_h2]:font-sans [&_h2]:text-xl [&_h2]:font-bold [&_h2]:leading-snug [&_h2]:tracking-tight [&_h2]:text-foreground sm:[&_h2]:text-2xl",
  "[&_h2]:before:absolute [&_h2]:before:left-0 [&_h2]:before:top-0 [&_h2]:before:h-[3px] [&_h2]:before:w-10 [&_h2]:before:bg-primary [&_h2]:before:content-['']",
  "[&_h3]:mt-2 [&_h3]:font-sans [&_h3]:text-lg [&_h3]:font-bold [&_h3]:leading-snug [&_h3]:tracking-tight [&_h3]:text-foreground",
  "[&_h4]:mt-2 [&_h4]:font-sans [&_h4]:text-base [&_h4]:font-bold [&_h4]:tracking-tight [&_h4]:text-foreground",
  "[&_strong]:font-semibold [&_strong]:text-foreground",
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
  "[&_ul]:flex [&_ul]:list-none [&_ul]:flex-col [&_ul]:gap-3",
  "[&_ul_li]:relative [&_ul_li]:pl-5",
  "[&_ul_li]:before:absolute [&_ul_li]:before:left-0 [&_ul_li]:before:top-[0.65em] [&_ul_li]:before:size-1.5 [&_ul_li]:before:bg-primary [&_ul_li]:before:content-['']",
  "[&_ol]:flex [&_ol]:flex-col [&_ol]:gap-3 [&_ol]:pl-5 [&_ol_li]:list-decimal [&_ol_li]:marker:font-medium [&_ol_li]:marker:text-primary",
  "[&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-5 [&_blockquote]:italic",
].join(" ");

export function RichTextSection({ blok }: RichTextSectionProps) {
  if (!blok.content) return null;

  return (
    <div className={PROSE}>
      <StoryblokRichText document={blok.content as unknown as SbRichTextDoc} />
    </div>
  );
}
