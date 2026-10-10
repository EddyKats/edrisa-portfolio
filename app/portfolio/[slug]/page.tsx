import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioScreen } from "@/components/portfolio/PortfolioScreen";
import { ProjectDetail } from "@/components/portfolio/ProjectDetail";
import { getPublishedCategories, getPublishedProjects } from "@/lib/content/portfolio";

export const dynamic = "force-dynamic";

type ProjectRouteProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProjectRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const projects = await getPublishedProjects();
  const project = projects.find((item) => item.slug === slug);

  if (!project) return {};

  return {
    title: { absolute: project.seoTitle || `${project.title} | Edrisa` },
    description: project.seoDescription || project.shortDescription || `${project.title}. ${project.category}.`,
    alternates: {
      canonical: `/portfolio/${project.slug}`,
    },
  };
}

export default async function ProjectRoute({ params }: ProjectRouteProps) {
  const { slug } = await params;
  const [projects, categories] = await Promise.all([getPublishedProjects(), getPublishedCategories()]);
  const index = projects.findIndex((item) => item.slug === slug);
  const project = index >= 0 ? projects[index] : null;

  if (!project) notFound();

  const previous = projects[(index - 1 + projects.length) % projects.length] ?? project;
  const next = projects[(index + 1) % projects.length] ?? project;

  return (
    <>
      <PortfolioScreen projects={projects} categories={["All", ...categories]} />
      <ProjectDetail
        project={project}
        previous={{ slug: previous.slug, title: previous.title }}
        next={{ slug: next.slug, title: next.title }}
        categories={categories}
      />
    </>
  );
}
