import "server-only";

import { getDb } from "@/lib/db";
import { ProjectWriteError } from "@/lib/content/projects";
import { deletePortfolioAsset, storageKeyFromUrl, type PortfolioAsset } from "@/lib/storage";

async function projectOrThrow(projectId: string) {
  const project = await getDb().project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      slug: true,
      coverImageUrl: true,
      heroImageUrl: true,
    },
  });
  if (!project) throw new ProjectWriteError("That project was not found.");
  return project;
}

export async function saveProjectAsset(projectId: string, role: "cover" | "hero", asset: PortfolioAsset) {
  const project = await projectOrThrow(projectId);
  const previousUrl = role === "cover" ? project.coverImageUrl : project.heroImageUrl;
  await getDb().project.update({
    where: { id: projectId },
    data:
      role === "cover"
        ? { coverImageUrl: asset.publicUrl, coverImageWidth: asset.width, coverImageHeight: asset.height }
        : { heroImageUrl: asset.publicUrl, heroImageWidth: asset.width, heroImageHeight: asset.height },
  });
  const warning = await removeStoredFile(previousUrl);
  return { slug: project.slug, warning };
}

export async function clearProjectAsset(projectId: string, role: "cover" | "hero") {
  const project = await projectOrThrow(projectId);
  const previousUrl = role === "cover" ? project.coverImageUrl : project.heroImageUrl;
  await getDb().project.update({
    where: { id: projectId },
    data:
      role === "cover"
        ? { coverImageUrl: null, coverImageWidth: null, coverImageHeight: null }
        : { heroImageUrl: null, heroImageWidth: null, heroImageHeight: null },
  });
  const warning = await removeStoredFile(previousUrl);
  return { slug: project.slug, warning };
}

export async function addProjectGalleryImage(projectId: string, asset: PortfolioAsset) {
  const project = await projectOrThrow(projectId);
  const last = await getDb().projectImage.findFirst({
    where: { projectId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const image = await getDb().projectImage.create({
    data: {
      projectId,
      url: asset.publicUrl,
      altText: "",
      width: asset.width,
      height: asset.height,
      sortOrder: (last?.sortOrder ?? -1) + 1,
    },
    select: { id: true },
  });
  return { slug: project.slug, imageId: image.id };
}

export async function updateProjectGalleryText(imageId: string, altText: string, caption: string | null) {
  const image = await getDb().projectImage.findUnique({
    where: { id: imageId },
    select: { id: true, project: { select: { slug: true } } },
  });
  if (!image) throw new ProjectWriteError("That image was not found.");
  await getDb().projectImage.update({ where: { id: imageId }, data: { altText, caption } });
  return { slug: image.project.slug };
}

export async function moveProjectGalleryImage(imageId: string, direction: "up" | "down") {
  const image = await getDb().projectImage.findUnique({
    where: { id: imageId },
    select: { id: true, projectId: true, project: { select: { slug: true } } },
  });
  if (!image) throw new ProjectWriteError("That image was not found.");
  const images = await getDb().projectImage.findMany({
    where: { projectId: image.projectId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  const index = images.findIndex((item) => item.id === imageId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= images.length) return { slug: image.project.slug };
  const next = images.slice();
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved!);
  await getDb().$transaction(
    next.map((item, sortOrder) => getDb().projectImage.update({ where: { id: item.id }, data: { sortOrder } })),
  );
  return { slug: image.project.slug };
}

export async function deleteProjectGalleryImage(imageId: string) {
  const image = await getDb().projectImage.findUnique({
    where: { id: imageId },
    select: { id: true, url: true, project: { select: { slug: true } } },
  });
  if (!image) throw new ProjectWriteError("That image was not found.");
  await getDb().projectImage.delete({ where: { id: imageId } });
  const warning = await removeStoredFile(image.url);
  return { slug: image.project.slug, warning };
}

export async function removeProjectFiles(urls: Array<string | null>) {
  const warnings: string[] = [];
  for (const url of urls) {
    const warning = await removeStoredFile(url);
    if (warning) warnings.push(warning);
  }
  return warnings[0] ?? null;
}

async function removeStoredFile(url: string | null) {
  const key = storageKeyFromUrl(url);
  if (!key) return null;
  try {
    await deletePortfolioAsset(key);
    return null;
  } catch {
    return "The project was updated, but the previous file could not be removed from storage.";
  }
}
