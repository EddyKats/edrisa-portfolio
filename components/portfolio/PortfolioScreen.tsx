import { Suspense } from "react";
import { InternalCTA } from "@/components/internal/InternalCTA";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { InternalTitle } from "@/components/internal/InternalTitle";
import { PortfolioBrowser } from "@/components/portfolio/PortfolioBrowser";
import { portfolioCopy } from "@/data/portfolio";

export function PortfolioScreen() {
  return (
    <InternalPageLayout section="portfolio">
      <div className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <InternalTitle>{portfolioCopy.title}</InternalTitle>
        <Suspense fallback={null}>
          <PortfolioBrowser />
        </Suspense>
        <InternalCTA
          section="portfolio"
          heading={portfolioCopy.ctaHeading}
          body={portfolioCopy.ctaBody}
          label={portfolioCopy.ctaLabel}
          href="/contact"
        />
        <InternalFooter />
      </div>
    </InternalPageLayout>
  );
}
