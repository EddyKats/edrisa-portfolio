import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/lib/content/portfolio";
import { site } from "@/data/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getPublishedProjects();
  const pages = ["", "/about", "/services", "/contact", "/portfolio", ...projects.map((project) => `/portfolio/${project.slug}`)];

  return pages.map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : path.startsWith("/portfolio/") ? 0.6 : 0.8,
  }));
}
