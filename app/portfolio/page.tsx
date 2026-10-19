import type { Metadata } from "next";
import { PortfolioScreen } from "@/components/portfolio/PortfolioScreen";
import { JsonLd } from "@/components/site/JsonLd";
import { getPublicCta } from "@/lib/content/cta";
import { getPublishedProjects } from "@/lib/content/portfolio";
import { getPublicSite } from "@/lib/content/site";
import { portfolioMeta } from "@/data/portfolio";
import { personIdentity, studioBrand } from "@/data/identity";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: { absolute: portfolioMeta.title },
    description: portfolioMeta.description || site.description,
    alternates: { canonical: "/portfolio" },
  };
}

export default async function PortfolioRoute() {
  const [projects, cta, site] = await Promise.all([
    getPublishedProjects(),
    getPublicCta("portfolio"),
    getPublicSite(),
  ]);
  const origin = site.url.replace(/\/$/, "");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: portfolioMeta.title,
          description: portfolioMeta.description,
          url: `${origin}/portfolio`,
          about: { "@type": "Person", name: personIdentity.name },
          publisher: { "@type": "Organization", name: studioBrand.name, url: origin },
        }}
      />
      <PortfolioScreen projects={projects} ctaHref={cta?.buttonHref ?? "/contact"} />
    </>
  );
}
