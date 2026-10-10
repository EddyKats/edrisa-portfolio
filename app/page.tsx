import type { Metadata } from "next";
import { HomeStage } from "@/components/home/HomeStage";
import { getHomeLabels } from "@/lib/content/home";
import { getPublicSite } from "@/lib/content/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getPublicSite();
  return {
    title: { absolute: site.title },
    description: site.description,
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const [site, labels] = await Promise.all([getPublicSite(), getHomeLabels()]);
  return <HomeStage site={site} labels={labels} />;
}
