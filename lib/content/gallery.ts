import "server-only";

import { getDb } from "@/lib/db";
import { ContentWriteError } from "@/lib/content/errors";
import { removeStoredFileIfUnused } from "@/lib/content/media";
import { slugify } from "@/lib/studio/slug";

const titleLimit = 120;
const altLimit = 300;
const captionLimit = 500;
const categoryLimit = 80;

export async function listStudioGallery() {
  return getDb().galleryPhoto.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
}

export async function listPublishedGallery() {
  const photos = await getDb().galleryPhoto.findMany({
    where: { published: true, NOT: { imageUrl: null } },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  return photos.flatMap((photo) => {
    if (!photo.imageUrl) return [];
    return [
      {
        id: photo.id,
        slug: photo.slug,
        title: photo.title,
        alt: photo.altText || photo.title,
        caption: photo.caption,
        category: photo.category,
        src: photo.imageUrl,
        width: photo.width,
        height: photo.height,
        updatedAt: photo.updatedAt,
      },
    ];
  });
}

export async function saveGalleryPhoto(input: {
  id?: string;
  title: string;
  altText: string;
  caption: string | null;
  category: string | null;
  published: boolean;
}) {
  const title = required(input.title, "Add a title.");
  if (title.length > titleLimit) throw new ContentWriteError(`Keep the title under ${titleLimit} characters.`);
  const altText = input.altText.trim();
  if (altText.length > altLimit) throw new ContentWriteError(`Keep the alt text under ${altLimit} characters.`);
  const caption = bounded(input.caption, captionLimit, "caption");
  const category = bounded(input.category, categoryLimit, "category");
  if (input.published && !altText) throw new ContentWriteError("Add alt text before publishing.");

  const db = getDb();
  if (input.id) {
    const current = await db.galleryPhoto.findUnique({ where: { id: input.id }, select: { id: true, imageUrl: true } });
    if (!current) throw new ContentWriteError("That photograph could not be found.");
    if (input.published && !current.imageUrl) throw new ContentWriteError("Upload the photograph before publishing.");
    await db.galleryPhoto.update({
      where: { id: input.id },
      data: { title, altText, caption, category, published: input.published },
    });
    return input.id;
  }

  if (input.published) throw new ContentWriteError("Upload the photograph before publishing.");
  const count = await db.galleryPhoto.count();
  const created = await db.galleryPhoto.create({
    data: {
      title,
      slug: await uniqueSlug(title),
      altText,
      caption,
      category,
      published: false,
      sortOrder: count,
    },
  });
  return created.id;
}

export async function saveGalleryImage(
  id: string,
  asset: { publicUrl: string; width: number | null; height: number | null },
) {
  const db = getDb();
  const current = await db.galleryPhoto.findUnique({ where: { id }, select: { imageUrl: true } });
  if (!current) throw new ContentWriteError("That photograph could not be found.");
  await db.galleryPhoto.update({
    where: { id },
    data: { imageUrl: asset.publicUrl, width: asset.width, height: asset.height },
  });
  return {
    warning: current.imageUrl && current.imageUrl !== asset.publicUrl ? await removeStoredFileIfUnused(current.imageUrl) : null,
  };
}

export async function clearGalleryImage(id: string) {
  const db = getDb();
  const current = await db.galleryPhoto.findUnique({ where: { id }, select: { imageUrl: true } });
  if (!current) throw new ContentWriteError("That photograph could not be found.");
  await db.galleryPhoto.update({
    where: { id },
    data: { imageUrl: null, width: null, height: null, published: false },
  });
  return { warning: await removeStoredFileIfUnused(current.imageUrl) };
}

export async function deleteGalleryPhoto(id: string) {
  const db = getDb();
  const current = await db.galleryPhoto.findUnique({ where: { id }, select: { imageUrl: true } });
  if (!current) throw new ContentWriteError("That photograph could not be found.");
  await db.galleryPhoto.delete({ where: { id } });
  return { warning: await removeStoredFileIfUnused(current.imageUrl) };
}

export async function moveGalleryPhoto(id: string, direction: "up" | "down") {
  const db = getDb();
  const rows = await db.galleryPhoto.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  const index = rows.findIndex((row) => row.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= rows.length) return;
  const next = rows.slice();
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item!);
  await db.$transaction(next.map((row, sortOrder) => db.galleryPhoto.update({ where: { id: row.id }, data: { sortOrder } })));
}

async function uniqueSlug(title: string) {
  const base = slugify(title) || "photograph";
  const db = getDb();
  const taken = new Set(
    (await db.galleryPhoto.findMany({ where: { slug: { startsWith: base } }, select: { slug: true } })).map((row) => row.slug),
  );
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

function required(value: string, message: string) {
  const trimmed = value.trim();
  if (!trimmed) throw new ContentWriteError(message);
  return trimmed;
}

function bounded(value: string | null, limit: number, label: string) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return null;
  if (trimmed.length > limit) throw new ContentWriteError(`Keep the ${label} under ${limit} characters.`);
  return trimmed;
}
