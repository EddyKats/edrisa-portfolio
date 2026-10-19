import type { Metadata } from "next";
import { AboutHeroBleed, AboutProfile } from "@/components/about/AboutProfile";
import { InternalCTA } from "@/components/internal/InternalCTA";
import { InternalFooter } from "@/components/internal/InternalFooter";
import { InternalPageLayout } from "@/components/internal/InternalPageLayout";
import { ProjectDetail } from "@/components/portfolio/ProjectDetail";
import { aboutCopy, aboutMeta, aboutProfile } from "@/data/about";
import { publicPortfolioFilters } from "@/data/portfolio";
import { getPublicAbout } from "@/lib/content/about";
import { getPublicCta } from "@/lib/content/cta";
import { getPublishedProjects } from "@/lib/content/portfolio";
import { getPublicSite } from "@/lib/content/site";
import { absoluteAsset, personId, personNode, withGraph } from "@/lib/content/jsonld";
import { JsonLd } from "@/components/site/JsonLd";
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

export default async function AboutRoute({
  searchParams,
}: {
  searchParams: Promise<{ work?: string | string[] }>;
}) {
  const params = await searchParams;
  const workSlug = typeof params.work === "string" ? params.work : undefined;
  const [about, site, projects, cta] = await Promise.all([
    getPublicAbout(),
    getPublicSite(),
    getPublishedProjects(),
    getPublicCta("about"),
  ]);
  const image = profileImage(site.url, about.content?.featureMediaUrl, site.portraitSrc, site.portraitWidth, site.portraitHeight);
  const profileUrl = new URL("/about", site.url).href;
  const person = {
    ...personNode(site, image ? publicAssetUrl(site.url, image.src) : absoluteAsset(site.url, site.portraitSrc)),
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "degree",
        name: aboutProfile.education.credential,
        recognizedBy: {
          "@type": "CollegeOrUniversity",
          name: aboutProfile.education.school,
        },
        dateCreated: "2026-02",
      },
      ...aboutProfile.credentials
        .filter((item) => item.published && item.completed)
        .map((item) => ({
          "@type": "EducationalOccupationalCredential",
          name: item.name,
          recognizedBy: {
            "@type": "Organization",
            name: item.issuer,
          },
          ...(item.credentialUrl ? { url: item.credentialUrl } : {}),
          ...(item.credentialId ? { credentialId: item.credentialId } : {}),
          ...(item.issueDate ? { dateCreated: item.issueDate } : {}),
        })),
    ],
  };
  const jsonLd = withGraph(
    site,
    [
      {
        "@type": "ProfilePage",
        "@id": profileUrl,
        url: profileUrl,
        name: aboutMeta.title,
        mainEntity: { "@id": personId(site.url.replace(/\/$/, "")) },
      },
      person,
    ],
    image ? publicAssetUrl(site.url, image.src) : null,
  );

  const workIndex = workSlug ? projects.findIndex((item) => item.slug === workSlug) : -1;
  const opened = workIndex >= 0 ? projects[workIndex] : null;
  const previous = opened ? projects[(workIndex - 1 + projects.length) % projects.length] ?? opened : null;
  const next = opened ? projects[(workIndex + 1) % projects.length] ?? opened : null;

  return (
    <>
    <InternalPageLayout
      section="about"
      bleed={image ? <AboutHeroBleed image={image} /> : null}
    >
      <JsonLd data={jsonLd} />
      <div className="internal-frame px-5 pt-14 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-8 sm:pt-20 split:pt-8">
        <AboutProfile socials={site.socials} callHref={site.callHref} projects={projects} />
        <div className="about-sheet-continue">
          <InternalCTA
            section="about"
            heading={projectCta.heading}
            body={cta?.body ?? about.content?.ctaText ?? aboutCopy.ctaBody}
            label={projectCta.label}
            href={cta?.buttonHref ?? about.content?.ctaButtonHref ?? "/contact"}
          />
          <InternalFooter />
        </div>
      </div>
    </InternalPageLayout>
    {opened && previous && next ? (
      <ProjectDetail
        source="about"
        project={opened}
        previous={{ slug: previous.slug, title: previous.title }}
        next={{ slug: next.slug, title: next.title }}
        categories={[...publicPortfolioFilters]}
        contact={{
          profiles: site.socials,
          callHref: site.callHref,
        }}
        ctaHref={cta?.buttonHref ?? about.content?.ctaButtonHref ?? "/contact"}
      />
    ) : null}
    </>
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
