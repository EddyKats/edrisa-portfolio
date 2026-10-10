import type { SoftwareId } from "@/data/software";

export const portfolioMeta = {
  title: "Portfolio | Edrisa",
  description: "Selected brand, campaign, and digital work by Edrisa.",
} as const;

export const portfolioCopy = {
  title: "Proof I Wasn't Just Moving Pixels Around",
  emptyLabel: "Nothing filed here yet.",
  ctaHeading: "Want the next one to be yours?",
  ctaBody: "Bring the brief. I'll bring the unreasonable attention to detail.",
  ctaLabel: "Start a Project",
  pending: "To be added",
} as const;

export const portfolioCategories = [
  "All",
  "Branding",
  "Advertising",
  "Print",
  "Digital",
  "UI/UX",
  "Creative Direction",
] as const;

export type PortfolioFilter = (typeof portfolioCategories)[number];
export type PortfolioCategory = Exclude<PortfolioFilter, "All">;

export type ProjectSize = "large" | "wide" | "tall" | "standard";

export type PortfolioCredit = {
  role: string;
  name: string;
};

export type PortfolioGalleryImage = {
  src: string;
  alt: string;
  caption: string | null;
  width: number | null;
  height: number | null;
};

export type PortfolioProject = {
  slug: string;
  title: string;
  category: string;
  client: string;
  year: number | null;
  role: string | null;
  services: string[];
  shortDescription: string | null;
  fullDescription: string | null;
  coverImage: string | null;
  heroImage: string | null;
  heroWidth?: number | null;
  heroHeight?: number | null;
  galleryImages: PortfolioGalleryImage[];
  credits: PortfolioCredit[];
  software: SoftwareId[];
  size: ProjectSize;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

/**
 * Names already in this project. Categories and sizes are filing labels for the grid.
 * They are not claims about finished work.
 * Covers: add files under public/images/portfolio/, then set coverImage and heroImage.
 * Example: "/images/portfolio/washo.jpg"
 * Software: set software to ids from data/software.ts, for example ["photoshop", "illustrator"].
 * Leave software empty until the tools for that project are known.
 * Order is curated so the large tile, two standards, and the wide tile lock together.
 */
export const portfolioProjects: PortfolioProject[] = [
  {
    slug: "washo",
    title: "Washo",
    category: "Branding",
    client: "Washo",
    year: null,
    role: "Founder / Brand & Product Direction",
    services: [],
    shortDescription: null,
    fullDescription: null,
    coverImage: null,
    heroImage: null,
    galleryImages: [],
    credits: [],
    software: [],
    size: "large",
  },
  {
    slug: "spiro",
    title: "Spiro",
    category: "Advertising",
    client: "Spiro",
    year: null,
    role: null,
    services: [],
    shortDescription: null,
    fullDescription: null,
    coverImage: null,
    heroImage: null,
    galleryImages: [],
    credits: [],
    software: [],
    size: "standard",
  },
  {
    slug: "gline",
    title: "GLine",
    category: "Digital",
    client: "GLine",
    year: null,
    role: null,
    services: [],
    shortDescription: null,
    fullDescription: null,
    coverImage: null,
    heroImage: null,
    galleryImages: [],
    credits: [],
    software: [],
    size: "standard",
  },
  {
    slug: "edutech-media-group",
    title: "Edutech Media Group",
    category: "Creative Direction",
    client: "Edutech Media Group",
    year: null,
    role: null,
    services: [],
    shortDescription: null,
    fullDescription: null,
    coverImage: null,
    heroImage: null,
    galleryImages: [],
    credits: [],
    software: [],
    size: "wide",
  },
];

export function getPortfolioProject(slug: string) {
  return portfolioProjects.find((project) => project.slug === slug);
}

export function getProjectNeighbors(slug: string) {
  const index = portfolioProjects.findIndex((project) => project.slug === slug);
  const count = portfolioProjects.length;
  const previous = portfolioProjects[(index - 1 + count) % count];
  const next = portfolioProjects[(index + 1) % count];

  if (!previous || !next || index < 0) {
    throw new Error(`Unknown project: ${slug}`);
  }

  return { previous, next };
}

export function getProjectMeta(project: PortfolioProject) {
  return {
    title: `${project.title} | Edrisa`,
    description: project.fullDescription ?? project.shortDescription ?? `${project.title}. ${project.category}.`,
    canonical: `/portfolio/${project.slug}`,
  };
}
