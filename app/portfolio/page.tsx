import type { Metadata } from "next";
import { PortfolioScreen } from "@/components/portfolio/PortfolioScreen";
import { getPublicCta } from "@/lib/content/cta";
import { getPublishedProjects } from "@/lib/content/portfolio";
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
  const [projects, cta] = await Promise.all([getPublishedProjects(), getPublicCta("portfolio")]);

  return <PortfolioScreen projects={projects} ctaHref={cta?.buttonHref ?? "/contact"} />;
}
