import { Suspense } from "react";
import { InternalCTA } from "@/components/internal/InternalCTA";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { InternalTitle } from "@/components/internal/InternalTitle";
import { PortfolioBrowser } from "@/components/portfolio/PortfolioBrowser";
import { portfolioCopy, type PortfolioProject } from "@/data/portfolio";

export function PortfolioScreen({
  projects,
  ctaHref = "/contact",
}: {
  projects: PortfolioProject[];
  ctaHref?: string;
}) {
  return (
    <InternalPageLayout section="portfolio">
      <div className="internal-frame px-5 py-14 sm:px-8 sm:py-20">
        <InternalTitle>
          <span className="block">{portfolioCopy.title}</span>
          <span className="block font-light">{portfolioCopy.titleLine}</span>
        </InternalTitle>
        <Suspense fallback={null}>
          <PortfolioBrowser projects={projects} />
        </Suspense>
        <InternalCTA
          section="portfolio"
          heading={portfolioCopy.ctaHeading}
          body={portfolioCopy.ctaBody}
          label={portfolioCopy.ctaLabel}
          href={ctaHref}
        />
        <InternalFooter />
      </div>
    </InternalPageLayout>
  );
}
