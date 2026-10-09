import type { Metadata } from "next";
import { PortfolioScreen } from "@/components/portfolio/PortfolioScreen";
import { portfolioMeta } from "@/data/portfolio";

export const metadata: Metadata = {
  title: { absolute: portfolioMeta.title },
  description: portfolioMeta.description,
  alternates: {
    canonical: "/portfolio",
  },
};

export default function PortfolioRoute() {
  return <PortfolioScreen />;
}
