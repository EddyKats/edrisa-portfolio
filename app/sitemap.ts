import type { MetadataRoute } from "next";
import { canonicalSiteUrl } from "@/data/identity";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = getDb();
  const [settings, home, about, contact, projects, photos] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "site" }, select: { updatedAt: true } }),
    db.homeContent.findUnique({ where: { id: "home" }, select: { updatedAt: true } }),
    db.aboutContent.findUnique({ where: { id: "about" }, select: { updatedAt: true } }),
    db.contactContent.findUnique({ where: { id: "contact" }, select: { updatedAt: true } }),
    db.project.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: {
        slug: true,
        updatedAt: true,
        coverImageUrl: true,
        heroImageUrl: true,
        images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }], select: { url: true, kind: true } },
      },
    }),
    db.galleryPhoto.findMany({
      where: { published: true, NOT: { imageUrl: null } },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: { imageUrl: true, updatedAt: true },
    }),
  ]);

  const portfolioUpdated = latest(projects.map((project) => project.updatedAt));
  const galleryUpdated = latest(photos.map((photo) => photo.updatedAt));
  const homeUpdated = latest([settings?.updatedAt, home?.updatedAt]);

  const pages: MetadataRoute.Sitemap = [
    entry("/", homeUpdated, 1),
    entry("/about", about?.updatedAt, 0.8),
    entry("/services", settings?.updatedAt, 0.8),
    entry("/portfolio", portfolioUpdated, 0.8),
    entry("/gallery", galleryUpdated, 0.8, photos.flatMap((photo) => (photo.imageUrl ? [absolute(photo.imageUrl)] : []))),
    entry("/contact", contact?.updatedAt, 0.8),
  ];

  for (const project of projects) {
    const images = [
      project.coverImageUrl,
      project.heroImageUrl,
      ...project.images.filter((image) => image.kind === "IMAGE").map((image) => image.url),
    ].flatMap((src) => (src ? [absolute(src)] : []));
    pages.push(entry(`/portfolio/${project.slug}`, project.updatedAt, 0.6, [...new Set(images)]));
  }

  return pages;
}

function entry(path: string, lastModified: Date | undefined, priority: number, images?: string[]): MetadataRoute.Sitemap[number] {
  return {
    url: path === "/" ? canonicalSiteUrl : `${canonicalSiteUrl}${path}`,
    lastModified,
    changeFrequency: "monthly",
    priority,
    ...(images && images.length > 0 ? { images } : {}),
  };
}

function absolute(src: string) {
  if (src.startsWith("https://") || src.startsWith("http://")) return src;
  return new URL(src, `${canonicalSiteUrl}/`).href;
}

function latest(dates: Array<Date | null | undefined>) {
  const stamps = dates.flatMap((date) => (date ? [date.getTime()] : []));
  if (stamps.length === 0) return undefined;
  return new Date(Math.max(...stamps));
}
