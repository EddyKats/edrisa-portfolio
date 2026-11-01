import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 90],
    // 2880 covers a 1400px presentation slot at 2x. 3840 stays for full-viewport images.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2880, 3840],
    minimumCacheTTL: isDev ? 0 : 31 * 24 * 60 * 60,
    remotePatterns: storageRemotePatterns(),
  },
  async headers() {
    const headers = [
      { source: "/:path*", headers: securityHeaders(isDev) },
    ];
    if (!isDev) return headers;

    return [
      ...headers,
      {
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

function securityHeaders(dev: boolean) {
  const headers = [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  ];
  if (dev) return headers;

  headers.push({
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'self'",
      "form-action 'self' https://github.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob: https:",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms https://va.vercel-scripts.com",
      "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com https://www.clarity.ms https://c.clarity.ms https://scripts.clarity.ms https://*.clarity.ms https://va.vercel-scripts.com https://vitals.vercel-insights.com",
      "frame-src 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  });
  return headers;
}

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
