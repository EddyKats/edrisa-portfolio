import type { Metadata } from "next";
import { AboutHeroBleed, AboutProfile } from "@/components/about/AboutProfile";
import { InternalCTA } from "@/components/internal/InternalCTA";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { aboutCopy, aboutMeta, aboutProfile } from "@/data/about";
import { getPublicAbout } from "@/lib/content/about";
import { getPublicCta } from "@/lib/content/cta";
import { getPublishedProjects } from "@/lib/content/portfolio";
import { getPublicSite } from "@/lib/content/site";
import { projectCta } from "@/data/project-cta";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { absolute: aboutMeta.title },
    description: aboutMeta.description,
    alternates: { canonical: "/about" },
    openGraph: {
      title: aboutMeta.title,
      description: aboutMeta.description,
      url: "/about",
    },
  };
}

export default async function AboutRoute() {
  const [about, site, projects, cta] = await Promise.all([
    getPublicAbout(),
    getPublicSite(),
    getPublishedProjects(),
    getPublicCta("about"),
  ]);
  const image = profileImage(site.url, about.content?.featureMediaUrl, site.portraitSrc, site.portraitWidth, site.portraitHeight);
  const profileUrl = new URL("/about", site.url).href;
  const sameAs = site.socials.filter((item) => item.id === "linkedin" || item.id === "behance").map((item) => item.href);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: profileUrl,
    mainEntity: {
      "@type": "Person",
      name: aboutProfile.name,
      alternateName: aboutProfile.alternateName,
      url: profileUrl,
      jobTitle: aboutProfile.title,
      description:
        "Ugandan multidisciplinary designer and software developer working across graphic design, branding, web development and digital products.",
      ...(image ? { image: publicAssetUrl(site.url, image.src) } : {}),
      sameAs,
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: aboutProfile.education.school,
      },
      hasCredential: {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "degree",
        name: aboutProfile.education.credential,
        recognizedBy: {
          "@type": "CollegeOrUniversity",
          name: aboutProfile.education.school,
        },
        dateCreated: "2026-02",
      },
    },
  };

  return (
    <InternalPageLayout
      section="about"
      bleed={image ? <AboutHeroBleed image={image} /> : null}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="internal-frame px-5 py-14 sm:px-8 sm:py-20 split:pt-8">
        <AboutProfile
          image={image}
          socials={site.socials}
          callHref={site.callHref}
          projects={projects.slice(0, 4)}
        />
        <InternalCTA
          section="about"
          heading={projectCta.heading}
          body={cta?.body ?? about.content?.ctaText ?? aboutCopy.ctaBody}
          label={projectCta.label}
          href={cta?.buttonHref ?? about.content?.ctaButtonHref ?? "/contact"}
        />
        <InternalFooter />
      </div>
    </InternalPageLayout>
  );
}

function profileImage(
  siteUrl: string,
  feature: string | null | undefined,
  portrait: string,
  width: number,
  height: number,
) {
  const src = crawlable(feature) ? feature! : crawlable(portrait) ? portrait : null;
  if (!src) return null;
  return {
    src,
    width,
    height,
    alt: "Portrait of Kasibante Edrisa",
  };
}

function crawlable(src: string | null | undefined) {
  return Boolean(src && (src.startsWith("https://") || src.startsWith("/")));
}

function publicAssetUrl(siteUrl: string, src: string) {
  if (src.startsWith("https://")) return src;
  return new URL(src, siteUrl).href;
}
