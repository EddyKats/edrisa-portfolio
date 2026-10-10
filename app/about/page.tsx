import type { Metadata } from "next";
import { AboutFeatureMedia } from "@/components/about/AboutFeatureMedia";
import { AboutIntro } from "@/components/about/AboutIntro";
import { AboutJourney } from "@/components/about/AboutJourney";
import { AboutStats } from "@/components/about/AboutStats";
import { InternalCTA } from "@/components/internal/InternalCTA";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { InternalTitle } from "@/components/internal/InternalTitle";
import { aboutCopy } from "@/data/about";
import { getPublicAbout } from "@/lib/content/about";
import { getPublicCta } from "@/lib/content/cta";
import { getPublicSite } from "@/lib/content/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [about, site] = await Promise.all([getPublicAbout(), getPublicSite()]);
  return {
    title: { absolute: about.content?.seoTitle || site.title },
    description: about.content?.seoDescription || site.description,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutRoute() {
  const [about, cta] = await Promise.all([getPublicAbout(), getPublicCta("about")]);
  const content = about.content;
  const feature = content?.featureMediaType === "image" ? content.featureMediaUrl : null;

  return (
    <InternalPageLayout section="about">
      <div className="mx-auto w-full max-w-[48rem] px-5 py-14 sm:px-8 sm:py-20">
        <InternalTitle>{content?.pageTitle ?? aboutCopy.title}</InternalTitle>
        <AboutFeatureMedia src={feature} />
        <AboutIntro
          heading={content?.introHeading ?? aboutCopy.introHeading}
          intro={content?.introParagraph ?? aboutCopy.intro}
          storyHeading={content?.storyHeading ?? aboutCopy.storyHeading}
          story={content?.storyBody ?? aboutCopy.story}
        />
        <AboutStats stats={about.stats} />
        <AboutJourney title={aboutCopy.journeyTitle} entries={about.experience} />
        <InternalCTA
          section="about"
          heading={cta?.heading ?? content?.ctaHeading ?? aboutCopy.ctaHeading}
          body={cta?.body ?? content?.ctaText ?? aboutCopy.ctaBody}
          label={cta?.buttonLabel ?? content?.ctaButtonLabel ?? aboutCopy.ctaLabel}
          href={cta?.buttonHref ?? content?.ctaButtonHref ?? "/contact"}
        />
        <InternalFooter />
      </div>
    </InternalPageLayout>
  );
}
