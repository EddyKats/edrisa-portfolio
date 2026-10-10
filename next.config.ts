import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    minimumCacheTTL: isDev ? 0 : 14400,
    remotePatterns: storageRemotePatterns(),
  },
  async headers() {
    if (!isDev) {
      return [];
    }

    return [
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

function storageRemotePatterns() {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  if (!endpoint) return [];

  try {
    return [
      {
        protocol: "https" as const,
        hostname: new URL(endpoint).hostname,
        pathname: "/edrisa-media/**",
      },
    ];
  } catch {
    return [];
  }
}
