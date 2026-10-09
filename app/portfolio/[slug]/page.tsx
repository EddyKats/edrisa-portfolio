import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioScreen } from "@/components/portfolio/PortfolioScreen";
import { ProjectDetail } from "@/components/portfolio/ProjectDetail";
import { getPortfolioProject, getProjectMeta, portfolioProjects } from "@/data/portfolio";

type ProjectRouteProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return portfolioProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: ProjectRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getPortfolioProject(slug);

  if (!project) {
    return {};
  }

  const meta = getProjectMeta(project);

  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: {
      canonical: meta.canonical,
    },
  };
}

export default async function ProjectRoute({ params }: ProjectRouteProps) {
  const { slug } = await params;
  const project = getPortfolioProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <>
      <PortfolioScreen />
      <ProjectDetail project={project} />
    </>
  );
}
