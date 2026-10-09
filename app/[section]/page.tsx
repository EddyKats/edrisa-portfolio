import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionShell } from "@/components/site/SectionShell";
import { getNavItem, isNavId, navigation } from "@/data/navigation";

type SectionRouteProps = {
  params: Promise<{ section: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return navigation
    .filter((item) => item.id !== "about")
    .map((item) => ({ section: item.id }));
}

export async function generateMetadata({
  params,
}: SectionRouteProps): Promise<Metadata> {
  const { section } = await params;

  if (!isNavId(section)) {
    return {};
  }

  const item = getNavItem(section);

  return {
    title: item.title,
    description: item.summary,
    alternates: {
      canonical: item.href,
    },
  };
}

export default async function SectionPage({ params }: SectionRouteProps) {
  const { section } = await params;

  if (!isNavId(section)) {
    notFound();
  }

  return <SectionShell item={getNavItem(section)} />;
}
