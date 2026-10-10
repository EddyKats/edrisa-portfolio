import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/content/portfolio";
import { getPublicSite } from "@/lib/content/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, site] = await Promise.all([getPublishedProjects(), getPublicSite()]);
  const pages = ["", "/about", "/services", "/contact", "/portfolio", ...projects.map((project) => `/portfolio/${project.slug}`)];

  return pages.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : path.startsWith("/portfolio/") ? 0.6 : 0.8,
  }));
}
