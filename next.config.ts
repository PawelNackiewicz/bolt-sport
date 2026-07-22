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
};

export default nextConfig;
