import type { Metadata } from "next";
import { JsonLd } from "@/components/site/JsonLd";
import { getPublicSite } from "@/lib/content/site";
import { portfolioMeta } from "@/data/portfolio";
import { personId, studioId } from "@/lib/content/jsonld";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: { absolute: portfolioMeta.title },
    description: portfolioMeta.description || site.description,
    alternates: { canonical: "/portfolio" },
    openGraph: {
      title: portfolioMeta.title,
      description: portfolioMeta.description || site.description,
      url: "/portfolio",
    },
  };
}

export default async function PortfolioRoute() {
  const site = await getPublicSite();
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
          about: { "@id": personId(origin) },
          publisher: { "@id": studioId(origin) },
        }}
      />
    </>
  );
}
