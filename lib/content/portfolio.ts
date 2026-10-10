import "server-only";

import { getDb } from "@/lib/db";
import type { PortfolioProject, ProjectSize } from "@/data/portfolio";
import type { SoftwareId } from "@/data/software";
import { softwareIds } from "@/data/software";

const sizes: Record<string, ProjectSize> = {
  STANDARD: "standard",
  LARGE: "large",
  WIDE: "wide",
  TALL: "tall",
};

function projectQuery() {
  return {
    category: { select: { name: true, published: true } },
    images: { orderBy: [{ sortOrder: "asc" as const }, { id: "asc" as const }] },
    services: {
      orderBy: [{ sortOrder: "asc" as const }, { serviceId: "asc" as const }],
      include: { service: { select: { title: true, published: true } } },
    },
    software: {
      orderBy: [{ sortOrder: "asc" as const }, { softwareId: "asc" as const }],
      include: { software: { select: { key: true, published: true } } },
    },
    credits: { orderBy: [{ sortOrder: "asc" as const }, { id: "asc" as const }] },
  };
}

export async function getPublishedProjects() {
  const projects = await getDb().project.findMany({
    where: { published: true, category: { published: true } },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: projectQuery(),
  });
  return projects.map(toPublicProject);
}

export async function getPublishedProjectBySlug(slug: string) {
  const project = await getDb().project.findUnique({
    where: { slug },
    include: projectQuery(),
  });
  if (!project || !project.published || !project.category.published) return null;
  return toPublicProject(project);
}

export async function getPublishedCategories() {
  const categories = await getDb().portfolioCategory.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { name: true },
  });
  return categories.map((category) => category.name);
}

function toPublicProject(project: {
  slug: string;
  title: string;
  client: string;
  year: number | null;
  role: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  coverImageUrl: string | null;
  heroImageUrl: string | null;
  heroImageWidth: number | null;
  heroImageHeight: number | null;
  size: string;
  seoTitle: string | null;
  seoDescription: string | null;
  category: { name: string };
  images: { url: string; altText: string; caption: string | null; width: number | null; height: number | null }[];
  services: { service: { title: string; published: boolean } }[];
  software: { software: { key: string; published: boolean } }[];
  credits: { label: string; value: string }[];
}): PortfolioProject {
  return {
    slug: project.slug,
    title: project.title,
    category: project.category.name,
    client: project.client,
    year: project.year,
    role: project.role,
    services: project.services.filter((item) => item.service.published).map((item) => item.service.title),
    shortDescription: project.shortDescription,
    fullDescription: project.fullDescription,
    coverImage: project.coverImageUrl,
    heroImage: project.heroImageUrl,
    heroWidth: project.heroImageWidth,
    heroHeight: project.heroImageHeight,
    galleryImages: project.images.map((image) => ({
      src: image.url,
      alt: image.altText,
      caption: image.caption,
      width: image.width,
      height: image.height,
    })),
    credits: project.credits.map((credit) => ({ role: credit.label, name: credit.value })),
    software: project.software.flatMap((item) => {
      const key = item.software.key;
      return item.software.published && isSoftwareId(key) ? [key] : [];
    }),
    size: sizes[project.size] ?? "standard",
    seoTitle: project.seoTitle,
    seoDescription: project.seoDescription,
  };
}

function isSoftwareId(key: string): key is SoftwareId {
  return (softwareIds as readonly string[]).includes(key);
}
