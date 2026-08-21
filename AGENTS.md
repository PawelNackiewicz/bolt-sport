<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Tailwind CSS conventions

Prefer default shadcn/Tailwind design tokens over arbitrary-value classes (`text-[0.95rem]`, `h-[3px]`, `leading-[1.75]`, ...). Before reaching for a bracketed arbitrary value, check whether an existing token already covers it:

- Font size / line height: use the named scale (`text-xs`…`text-9xl`, `leading-none`/`tight`/`snug`/`normal`/`relaxed`/`loose`) instead of a custom rem/unitless value. Pick the closest step rather than inventing an in-between number.
- Spacing, sizing, translate/inset: use the spacing scale (`h-1`, `w-10`, `gap-6`, `translate-x-10`, ...) — it's a 0.25rem grid, so most "custom" pixel values already have an exact or near match.
- Border, ring and outline width: this project's Tailwind v4 setup accepts bare integers directly as pixel widths (`border-3`, `ring-3`, `border-l-3`), so use those instead of `border-l-[3px]` / `ring-[3px]`.
- Colors: use semantic tokens (`bg-card`, `text-muted-foreground`, `text-primary`, ...) defined in `app/globals.css`, never raw `oklch(...)`/hex values in a class. If a section must render in a fixed dark appearance regardless of the site theme, wrap it with the `dark` class (see `HighlightedCta`) so the existing `.dark` variable overrides apply, rather than hardcoding the dark token values inline.
- Grid ratios: prefer `grid-cols-12` plus `col-span-*` over fractional arbitrary values (`grid-cols-[1.4fr_1fr]`) when a whole-number column split gives an equivalent ratio.

Arbitrary values are still the right tool when there's genuinely no token for the job — aspect ratios (`aspect-[16/10]`), decorative gradients, `calc()`/viewport expressions (`min-h-[calc(100svh-4rem)]`), image `object-position` focal points, or values computed from a CSS variable (`rounded-[min(var(--radius-md),10px)]`). Don't force those into the default scale; just don't reach for brackets when a token already matches.
