import type { NextConfig } from "next";

const WEEK = 60 * 60 * 24 * 7;

const nextConfig: NextConfig = {
  // Dev only: lets the dev server's scripts load when the site is opened through
  // 127.0.0.1 or the LAN IP (phone testing). Without it the page shows but nothing is clickable.
  allowedDevOrigins: ["127.0.0.1", "192.168.*.*", "10.*.*.*"],

  images: {
    formats: ["image/avif", "image/webp"],
    // Optimised images stay cached 31 days (photos in public/ rarely change; rename a file to refresh it)
    minimumCacheTTL: 60 * 60 * 24 * 31,
    qualities: [75, 85],
  },

  experimental: {
    // Client router cache: pages already visited/prefetched open instantly when coming back
    staleTimes: { dynamic: 60, static: 600 },
  },

  async headers() {
    // Files in public/ have no content hash, so a week of cache + background revalidation.
    // (_next/static/* is already cached forever by Next.js.)
    const cache = [{ key: "Cache-Control", value: `public, max-age=${WEEK}, stale-while-revalidate=${WEEK}` }];
    return [
      { source: "/images/:path*", headers: cache },
      { source: "/:file(.*\\.(?:mp4|webm|png|jpg|ico))", headers: cache },
    ];
  },
};

export default nextConfig;
