import type { Metadata } from "next";
import { AboutFeatureMedia } from "@/components/about/AboutFeatureMedia";
import { AboutIntro } from "@/components/about/AboutIntro";
import { AboutJourney } from "@/components/about/AboutJourney";
import { AboutStats } from "@/components/about/AboutStats";
import { InternalCTA } from "@/components/internal/InternalCTA";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { InternalTitle } from "@/components/internal/InternalTitle";
import { aboutCopy, aboutMeta } from "@/data/about";

export const metadata: Metadata = {
  title: { absolute: aboutMeta.title },
  description: aboutMeta.description,
  alternates: {
    canonical: "/about",
  },
};

export default function AboutRoute() {
  return (
    <InternalPageLayout section="about">
      <div className="mx-auto w-full max-w-[48rem] px-5 py-14 sm:px-8 sm:py-20">
        <InternalTitle>{aboutCopy.title}</InternalTitle>
        <AboutFeatureMedia />
        <AboutIntro />
        <AboutStats />
        <AboutJourney />
        <InternalCTA
          section="about"
          heading={aboutCopy.ctaHeading}
          body={aboutCopy.ctaBody}
          label={aboutCopy.ctaLabel}
          href="/contact"
        />
        <InternalFooter />
      </div>
    </InternalPageLayout>
  );
}
