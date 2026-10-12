import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioScreen } from "@/components/portfolio/PortfolioScreen";
import { publicPortfolioFilters } from "@/data/portfolio";
import { ProjectDetail } from "@/components/portfolio/ProjectDetail";
import { getPublicCta } from "@/lib/content/cta";
import { getPublishedProjects } from "@/lib/content/portfolio";
import { getPublicSite } from "@/lib/content/site";

export const dynamic = "force-dynamic";

type ProjectRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProjectRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const projects = await getPublishedProjects();
  const project = projects.find((item) => item.slug === slug);

  if (!project) return {};

  const site = await getPublicSite();

  return {
    title: { absolute: project.seoTitle || `${project.title} | Edrisa` },
    description: project.seoDescription || project.shortDescription || site.description,
    alternates: {
      canonical: `/portfolio/${project.slug}`,
    },
  };
}

export default async function ProjectRoute({ params }: ProjectRouteProps) {
  const { slug } = await params;
  const [projects, cta, site] = await Promise.all([
    getPublishedProjects(),
    getPublicCta("portfolio"),
    getPublicSite(),
  ]);
  const index = projects.findIndex((item) => item.slug === slug);
  const project = index >= 0 ? projects[index] : null;

  if (!project) notFound();

  const previous = projects[(index - 1 + projects.length) % projects.length] ?? project;
  const next = projects[(index + 1) % projects.length] ?? project;

  return (
    <>
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
