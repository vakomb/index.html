import type { NextConfig } from "next";

/**
 * Lenkynas Next.js configuration.
 *
 * Product imagery is rendered with plain <img> tags (Allegro CDN or the local
 * SVG placeholder route), so no remote image patterns are required.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
