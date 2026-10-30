import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PortfolioScreen } from "@/components/portfolio/PortfolioScreen";
import { JsonLd } from "@/components/site/JsonLd";
import { publicPortfolioFilters } from "@/data/portfolio";
import { ProjectDetail } from "@/components/portfolio/ProjectDetail";
import { getPublicCta } from "@/lib/content/cta";
import { projectSeoTitle, projectWorkNode, publicStoredTitle } from "@/lib/content/jsonld";
import { getPublishedProjects, resolvePublicProjectSlug } from "@/lib/content/portfolio";
import { getPublicSite } from "@/lib/content/site";

export const dynamic = "force-dynamic";

type ProjectRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProjectRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const resolved = await resolvePublicProjectSlug(slug);
  if (resolved.status === "redirect") permanentRedirect(`/portfolio/${resolved.slug}`);
  if (resolved.status === "missing") {
    return { title: "Page not found", robots: { index: false, follow: false } };
  }

  const project = resolved.project;
  const description =
    project.seoDescription || project.shortDescription || `${project.title} by Kasibante Edrisa of Edrisa Studio.`;

  return {
    title: {
      absolute: publicStoredTitle(project.seoTitle, projectSeoTitle(project.title, project.category)),
    },
    description,
    alternates: {
      canonical: `/portfolio/${project.slug}`,
    },
    openGraph: {
      title: publicStoredTitle(project.seoTitle, project.title),
      description,
      url: `/portfolio/${project.slug}`,
      ...(project.coverImage ? { images: [{ url: project.coverImage, alt: project.title }] } : {}),
    },
  };
}

export default async function ProjectRoute({ params }: ProjectRouteProps) {
  const { slug } = await params;
  const resolved = await resolvePublicProjectSlug(slug);
  if (resolved.status === "redirect") permanentRedirect(`/portfolio/${resolved.slug}`);
  if (resolved.status === "missing") notFound();

  const [projects, cta, site] = await Promise.all([
    getPublishedProjects(),
    getPublicCta("portfolio"),
    getPublicSite(),
  ]);
  const index = projects.findIndex((item) => item.slug === slug);
  const project = index >= 0 ? projects[index] : resolved.project;

  const previous = projects[(index - 1 + projects.length) % projects.length] ?? project;
  const next = projects[(index + 1) % projects.length] ?? project;

  return (
    <>
      <JsonLd
        data={projectWorkNode(site, {
          ...project,
          images: [
            project.coverImage,
            project.heroImage,
            ...project.galleryImages.filter((image) => image.kind === "IMAGE").map((image) => image.src),
          ],
        })}
      />
      <PortfolioScreen projects={projects} ctaHref={cta?.buttonHref ?? "/contact"} />
      <ProjectDetail
        project={project}
        previous={{ slug: previous.slug, title: previous.title }}
        next={{ slug: next.slug, title: next.title }}
        categories={[...publicPortfolioFilters]}
        contact={{
          profiles: site.socials,
          callHref: site.callHref,
        }}
        ctaHref={cta?.buttonHref ?? "/contact"}
      />
    </>
  );
}
