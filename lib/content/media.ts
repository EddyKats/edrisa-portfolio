import "server-only";

import { getDb } from "@/lib/db";
import {
  deletePortfolioAsset,
  describeStoredUrl,
  inspectContentAsset,
  inspectPortfolioAsset,
  publicAssetUrl,
  type ContentAssetScope,
  type PortfolioAsset,
  type PortfolioAssetRole,
} from "@/lib/storage";

export const storageWarning = "The record was updated, but the previous file could not be removed from storage.";
export const storageDriftWarning =
  "The record was updated, but the previous file could not be removed because storage is not configured for this environment.";
export const storageForeignWarning =
  "The record was updated, but the previous file belongs to another environment and was left in storage.";

/**
 * Every column in schema.prisma that stores a media URL. A URL missing from this list
 * would be treated as unreferenced and deleted out from under a live page, so keep it
 * in step with the schema — lib/storage/media.test.ts asserts the count.
 */
export const storageUrlColumns = [
  "SiteSettings.homepagePortraitUrl",
  "SiteSettings.logoUrl",
  "HomeContent.portraitUrl",
  "HomeContent.logoUrl",
  "HomePortrait.imageUrl",
  "AboutContent.featureMediaUrl",
  "Experience.imageUrl",
  "Client.logoUrl",
  "Project.coverImageUrl",
  "Project.heroImageUrl",
  "ProjectImage.url",
  "GalleryPhoto.imageUrl",
] as const;

/**
 * Which of `urls` are still referenced by a row. One query per table regardless of how
 * many URLs are passed, so bulk paths such as deleting a project with forty boards stay
 * cheap — no URL column is indexed, so a per-URL check would be a sequential scan each.
 */
export async function usedStorageUrls(urls: Array<string | null | undefined>): Promise<Set<string>> {
  const wanted = [...new Set(urls.filter((url): url is string => Boolean(url)))];
  if (wanted.length === 0) return new Set();

  const db = getDb();
  const [settings, home, portraits, about, experience, clients, projects, images, gallery] = await Promise.all([
    db.siteSettings.findMany({
      where: { OR: [{ homepagePortraitUrl: { in: wanted } }, { logoUrl: { in: wanted } }] },
      select: { homepagePortraitUrl: true, logoUrl: true },
    }),
    db.homeContent.findMany({
      where: { OR: [{ portraitUrl: { in: wanted } }, { logoUrl: { in: wanted } }] },
      select: { portraitUrl: true, logoUrl: true },
    }),
    db.homePortrait.findMany({ where: { imageUrl: { in: wanted } }, select: { imageUrl: true } }),
    db.aboutContent.findMany({ where: { featureMediaUrl: { in: wanted } }, select: { featureMediaUrl: true } }),
    db.experience.findMany({ where: { imageUrl: { in: wanted } }, select: { imageUrl: true } }),
    db.client.findMany({ where: { logoUrl: { in: wanted } }, select: { logoUrl: true } }),
    db.project.findMany({
      where: { OR: [{ coverImageUrl: { in: wanted } }, { heroImageUrl: { in: wanted } }] },
      select: { coverImageUrl: true, heroImageUrl: true },
    }),
    db.projectImage.findMany({ where: { url: { in: wanted } }, select: { url: true } }),
    db.galleryPhoto.findMany({ where: { imageUrl: { in: wanted } }, select: { imageUrl: true } }),
  ]);

  const used = new Set<string>();
  const keep = (value: string | null) => {
    if (value) used.add(value);
  };
  for (const row of settings) {
    keep(row.homepagePortraitUrl);
    keep(row.logoUrl);
  }
  for (const row of home) {
    keep(row.portraitUrl);
    keep(row.logoUrl);
  }
  for (const row of portraits) keep(row.imageUrl);
  for (const row of about) keep(row.featureMediaUrl);
  for (const row of experience) keep(row.imageUrl);
  for (const row of clients) keep(row.logoUrl);
  for (const row of projects) {
    keep(row.coverImageUrl);
    keep(row.heroImageUrl);
  }
  for (const row of images) keep(row.url);
  for (const row of gallery) keep(row.imageUrl);
  return used;
}

export async function urlInUse(url: string | null | undefined) {
  if (!url) return false;
  return (await usedStorageUrls([url])).has(url);
}

/**
 * Deletes the object behind a URL. Reports drift instead of silently doing nothing when
 * the URL belongs to our bucket but this deployment cannot act on it; stays quiet for
 * seeded static paths such as /images/edrisa-portrait.jpg, which were never stored.
 */
export async function removeStoredFile(url: string | null | undefined) {
  const { kind, key } = describeStoredUrl(url);
  if (kind === "none" || kind === "external") return null;
  if (kind === "foreign") return storageForeignWarning;
  if (kind === "unconfigured" || !key) return storageDriftWarning;
  try {
    await deletePortfolioAsset(key);
    return null;
  } catch {
    return storageWarning;
  }
}

/**
 * The safe delete. Callers MUST have already committed the row change that dropped the
 * reference, otherwise the row still counts itself and nothing is ever cleaned up.
 * Shared URLs are real here: syncHeroStill copies one hero URL into HomeContent and
 * SiteSettings, and saveSiteLogo writes one logo URL to two columns.
 */
export async function removeStoredFileIfUnused(url: string | null | undefined) {
  if (!url) return null;
  // Called after the row change has committed, so throwing here would report failure
  // for a save that already succeeded. If the check cannot run, keep the file: an
  // orphan is sweepable, a file deleted while still referenced is a broken page.
  const inUse = await urlInUse(url).catch(() => true);
  if (inUse) return null;
  return removeStoredFile(url);
}

/** Batched removeStoredFileIfUnused. Returns the first warning, like the single-URL form. */
export async function removeStoredFilesIfUnused(urls: Array<string | null | undefined>) {
  const candidates = [...new Set(urls.filter((url): url is string => Boolean(url)))];
  if (candidates.length === 0) return null;

  // Fail safe, as in removeStoredFileIfUnused: treat every URL as referenced if the
  // check cannot run, so nothing live is removed on the strength of a failed query.
  const used = await usedStorageUrls(candidates).catch(() => new Set(candidates));
  let warning: string | null = null;
  for (const url of candidates) {
    if (used.has(url)) continue;
    const next = await removeStoredFile(url);
    warning ??= next;
  }
  return warning;
}

/**
 * Runs the database write that claims a freshly uploaded object. Uploads are storage
 * first and database second, so a failed write would strand the object: clean it up,
 * but only once nothing references it — some writers create the row before a later step
 * throws, and deleting then would break a live page.
 */
export async function commitUpload<T>(key: string, write: () => Promise<T>): Promise<T> {
  try {
    return await write();
  } catch (error) {
    if (!(await urlInUse(publicAssetUrl(key)).catch(() => true))) {
      await deletePortfolioAsset(key).catch(() => undefined);
    }
    throw error;
  }
}

/**
 * Verify an uploaded project asset, then record it. Verification failures return an
 * error and drop the object; write failures rethrow unchanged so each caller's own
 * error mapping (ProjectWriteError, ContentWriteError, Zod) still applies.
 */
export async function withPortfolioAsset<T>(
  projectId: string,
  role: PortfolioAssetRole,
  key: string,
  write: (asset: PortfolioAsset) => Promise<T>,
): Promise<{ value: T } | { error: string }> {
  const asset = await inspectPortfolioAsset(projectId, key, role);
  if ("error" in asset) {
    await deletePortfolioAsset(key).catch(() => undefined);
    return { error: asset.error };
  }
  return { value: await commitUpload(key, () => write(asset)) };
}

/** withPortfolioAsset for the content scopes: about, experience, client, home media and logos. */
export async function withContentAsset<T>(
  scope: ContentAssetScope,
  ownerId: string,
  key: string,
  write: (asset: PortfolioAsset) => Promise<T>,
): Promise<{ value: T } | { error: string }> {
  const asset = await inspectContentAsset(scope, ownerId, key);
  if ("error" in asset) {
    await deletePortfolioAsset(key).catch(() => undefined);
    return { error: asset.error };
  }
  return { value: await commitUpload(key, () => write(asset)) };
}
