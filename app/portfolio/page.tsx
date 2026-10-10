import type { Metadata } from "next";
import { PortfolioScreen } from "@/components/portfolio/PortfolioScreen";
import { getPublicCta } from "@/lib/content/cta";
import { getPublishedCategories, getPublishedProjects } from "@/lib/content/portfolio";
import { getPublicSite } from "@/lib/content/site";
import { portfolioMeta } from "@/data/portfolio";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: { absolute: portfolioMeta.title },
    description: site.description || portfolioMeta.description,
    alternates: { canonical: "/portfolio" },
  };
}

export default async function PortfolioRoute() {
  const [projects, categories, cta] = await Promise.all([
    getPublishedProjects(),
    getPublishedCategories(),
    getPublicCta("portfolio"),
  ]);

  return (
    <PortfolioScreen
      projects={projects}
      categories={["All", ...categories]}
      cta={
        cta
          ? { heading: cta.heading, body: cta.body, buttonLabel: cta.buttonLabel, href: cta.buttonHref }
          : undefined
      }
    />
  );
}
