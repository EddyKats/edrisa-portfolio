import type { MetadataRoute } from "next";
import { getPublicSite } from "@/lib/content/site";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getPublicSite();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/studio",
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
