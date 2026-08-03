import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import React from "react";

/**
 * `next/link` and `next/image` expect the App Router runtime; the components
 * under test only care that they render an anchor and an image.
 */
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  } & Record<string, unknown>) => React.createElement("a", { href, ...props }, children),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) =>
    React.createElement("img", { src, alt, ...props }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/pl/koszyk",
  useSearchParams: () => new URLSearchParams(),
}));

beforeEach(() => {
  // happy-dom keeps cookies between tests in the same file.
  for (const entry of document.cookie.split(/;\s*/)) {
    const name = entry.split("=")[0];
    if (name) document.cookie = `${name}=; max-age=0; path=/`;
  }
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
