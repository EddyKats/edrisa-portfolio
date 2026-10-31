import type { ReactNode } from "react";
import { PortfolioScreen } from "@/components/portfolio/PortfolioScreen";
import { getPublicCta } from "@/lib/content/cta";
import { getPublishedProjects } from "@/lib/content/portfolio";

export const dynamic = "force-dynamic";

export default async function PortfolioLayout({ children }: { children: ReactNode }) {
  const [projects, cta] = await Promise.all([getPublishedProjects(), getPublicCta("portfolio")]);

  return (
    <>
      <PortfolioScreen projects={projects} ctaHref={cta?.buttonHref ?? "/contact"} />
      {children}
    </>
  );
}
