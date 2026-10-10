import { AboutStudio } from "@/components/studio/AboutStudio";
import { dateField, getStudioAbout } from "@/lib/content/about";
import { getPublicCta } from "@/lib/content/cta";

export default async function StudioAboutPage() {
  const [{ content, stats, experience }, cta] = await Promise.all([getStudioAbout(), getPublicCta("about")]);

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">About</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#1c120e]/70">
        The page layout stays in code. Video is not supported for the feature area.
      </p>
      <div className="mt-8">
        <AboutStudio
          content={{
            pageTitle: content.pageTitle,
            introHeading: content.introHeading,
            introParagraph: content.introParagraph,
            storyHeading: content.storyHeading,
            storyBody: content.storyBody,
            featureMediaUrl: content.featureMediaType === "image" ? content.featureMediaUrl : null,
            seoTitle: content.seoTitle ?? "",
            seoDescription: content.seoDescription ?? "",
            ctaHeading: cta?.heading ?? content.ctaHeading ?? "",
            ctaText: cta?.body ?? content.ctaText ?? "",
            ctaButtonLabel: cta?.buttonLabel ?? content.ctaButtonLabel ?? "",
            ctaButtonHref: cta?.buttonHref ?? content.ctaButtonHref ?? "/contact",
          }}
          stats={stats}
          experience={experience.map((entry) => ({
            id: entry.id,
            company: entry.company,
            role: entry.role,
            microcopy: entry.microcopy ?? "",
            imageUrl: entry.imageUrl,
            startDate: dateField(entry.startDate),
            endDate: dateField(entry.endDate),
            published: entry.published,
          }))}
        />
      </div>
    </section>
  );
}
