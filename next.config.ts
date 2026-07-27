import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.storyblok.com",
      },
    ],
  },
  experimental: {
    // Root layout lives at app/[lang]/layout.tsx (a dynamic segment), so
    // Next can't compose a normal not-found.tsx boundary for unmatched
    // routes or an invalid `lang` param — see app/global-not-found.tsx.
    globalNotFound: true,
  },
};

export default nextConfig;
