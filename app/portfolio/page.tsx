import type { Metadata } from "next";
import { PortfolioScreen } from "@/components/portfolio/PortfolioScreen";
import { getPublishedCategories, getPublishedProjects } from "@/lib/content/portfolio";
import { portfolioMeta } from "@/data/portfolio";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: portfolioMeta.title },
  description: portfolioMeta.description,
  alternates: {
    canonical: "/portfolio",
  },
};

export default async function PortfolioRoute() {
  const [projects, categories] = await Promise.all([getPublishedProjects(), getPublishedCategories()]);

  return <PortfolioScreen projects={projects} categories={["All", ...categories]} />;
}
