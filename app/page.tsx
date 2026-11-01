import type { Metadata } from "next";
import { HomeStage } from "@/components/home/HomeStage";
import { canonicalSiteUrl } from "@/data/identity";
import { getHomeLabels } from "@/lib/content/home";
import { shareImage } from "@/lib/content/share-image";
import { getPublicSite } from "@/lib/content/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: { absolute: site.title },
    description: site.description,
    alternates: { canonical: "/" },
    openGraph: {
      title: site.title,
      description: site.description,
      url: canonicalSiteUrl,
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: site.title,
      description: site.description,
      images: [shareImage.url],
    },
  };
}

export default async function HomePage() {
  const [site, labels] = await Promise.all([getPublicSite(), getHomeLabels()]);
  return <HomeStage site={site} labels={labels} />;
}
