import type { MetadataRoute } from "next";
import { canonicalSiteUrl } from "@/data/identity";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/api/"],
    },
    sitemap: `${canonicalSiteUrl}/sitemap.xml`,
  };
}
