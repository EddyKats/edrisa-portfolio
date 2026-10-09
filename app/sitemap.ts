import type { MetadataRoute } from "next";
import { portfolioProjects } from "@/data/portfolio";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/services", "/contact", "/portfolio"];
  const projects = portfolioProjects.map((project) => `/portfolio/${project.slug}`);

  return [...pages, ...projects].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly",
    priority: path === "" ? 1 : path.startsWith("/portfolio/") ? 0.6 : 0.8,
  }));
}
