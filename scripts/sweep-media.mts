/**
 * Reconciles object storage against the database for the active media namespace.
 *
 *   node --env-file=.env.local --import tsx scripts/sweep-media.ts [--delete] [--grace-hours=24]
 *
 * Reports both directions of the diff:
 *   orphans  - objects no row references. Harmless, but they accumulate: an upload
 *              whose browser tab closed before the record was written leaves one.
 *              Removed only with --delete, and only past the grace window so uploads
 *              still in flight are never touched.
 *   dangling - rows pointing at an object that is gone. These are broken images on the
 *              public site and are never fixed automatically: deciding what a page
 *              should show instead is an editorial call, not a script's.
 */
import { ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { getDb } from "../lib/prisma";
import { describeStoredUrl } from "../lib/storage/neon-storage";
import { activeMediaNamespace, mediaBucket } from "../lib/storage/validation";

type Reference = { table: string; id: string; column: string; url: string; key: string };

const args = process.argv.slice(2);
const shouldDelete = args.includes("--delete");
const graceHours = Number(args.find((arg) => arg.startsWith("--grace-hours="))?.split("=")[1] ?? 24);

if (!Number.isFinite(graceHours) || graceHours < 0) {
  console.error("--grace-hours must be a non-negative number.");
  process.exit(1);
}

const namespace = activeMediaNamespace();
if (!namespace) {
  console.error("MEDIA_NAMESPACE must be development, preview, or production.");
  process.exit(1);
}

const endpoint = (process.env.AWS_ENDPOINT_URL_S3 ?? "").replace(/\/$/, "");
if (!endpoint || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
  console.error("Object storage is not configured. Set AWS_* in the environment first.");
  process.exit(1);
}

console.log(`namespace : ${namespace}`);
console.log(`bucket    : ${mediaBucket}`);
console.log(`endpoint  : ${endpoint}`);
console.log(`mode      : ${shouldDelete ? `DELETE orphans older than ${graceHours}h` : "dry run"}`);
console.log("");

if (shouldDelete) {
  // Deleting against the wrong namespace, or a database older than the bucket, would
  // remove objects that are still live. Make the operator look at the header first.
  console.log("Deleting in 5 seconds. Check the namespace above, then press Ctrl+C to stop.");
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

const client = new S3Client({
  region: process.env.AWS_REGION,
  endpoint,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const stored = await listStoredObjects();
const references = await listReferences();

const referencedKeys = new Set(references.map((reference) => reference.key));
const orphans = [...stored].filter(([key]) => !referencedKeys.has(key));
const dangling = references.filter((reference) => !stored.has(reference.key));

const cutoff = Date.now() - graceHours * 60 * 60 * 1000;
const sweepable = orphans.filter(([, modified]) => modified.getTime() < cutoff);
const recent = orphans.length - sweepable.length;

console.log(`objects in bucket     : ${stored.size}`);
console.log(`referenced by database: ${referencedKeys.size}`);
console.log(`orphans               : ${orphans.length}${recent > 0 ? ` (${recent} within the grace window)` : ""}`);
console.log(`dangling references   : ${dangling.length}`);
console.log("");

if (sweepable.length > 0) {
  console.log(shouldDelete ? "Removing orphans:" : "Orphans (re-run with --delete to remove):");
  for (const [key, modified] of sweepable) console.log(`  ${key}  (${modified.toISOString()})`);
  console.log("");
}

if (shouldDelete && sweepable.length > 0) {
  const { deletePortfolioAsset } = await import("../lib/storage/neon-storage");
  let removed = 0;
  for (const [key] of sweepable) {
    try {
      // Routed through deletePortfolioAsset so the namespace guard still applies.
      await deletePortfolioAsset(key);
      removed += 1;
    } catch (error) {
      console.error(`  failed: ${key} — ${error instanceof Error ? error.message : error}`);
    }
  }
  console.log(`Removed ${removed} of ${sweepable.length}.`);
  console.log("");
}

if (dangling.length > 0) {
  console.log("Dangling references — these render as broken images and need a new file:");
  for (const reference of dangling) {
    console.log(`  ${reference.table}.${reference.column}  id=${reference.id}`);
    console.log(`    ${reference.url}`);
  }
  console.log("");
}

await getDb().$disconnect();
// Non-zero on dangling references only, so this can gate a deploy.
process.exit(dangling.length > 0 ? 1 : 0);

async function listStoredObjects() {
  const objects = new Map<string, Date>();
  let token: string | undefined;
  do {
    const page = await client.send(
      new ListObjectsV2Command({ Bucket: mediaBucket, Prefix: `${namespace}/`, ContinuationToken: token }),
    );
    for (const object of page.Contents ?? []) {
      if (object.Key) objects.set(object.Key, object.LastModified ?? new Date(0));
    }
    token = page.NextContinuationToken;
  } while (token);
  return objects;
}

/** Every URL column in schema.prisma. Keep in step with storageUrlColumns in lib/content/media.ts. */
async function listReferences() {
  const db = getDb();
  const [settings, home, portraits, about, experience, clients, projects, images, gallery] = await Promise.all([
    db.siteSettings.findMany({ select: { id: true, homepagePortraitUrl: true, logoUrl: true } }),
    db.homeContent.findMany({ select: { id: true, portraitUrl: true, logoUrl: true } }),
    db.homePortrait.findMany({ select: { id: true, imageUrl: true } }),
    db.aboutContent.findMany({ select: { id: true, featureMediaUrl: true } }),
    db.experience.findMany({ select: { id: true, imageUrl: true } }),
    db.client.findMany({ select: { id: true, logoUrl: true } }),
    db.project.findMany({ select: { id: true, coverImageUrl: true, heroImageUrl: true } }),
    db.projectImage.findMany({ select: { id: true, url: true } }),
    db.galleryPhoto.findMany({ select: { id: true, imageUrl: true } }),
  ]);

  const found: Reference[] = [];
  const add = (table: string, column: string, id: string, url: string | null) => {
    const { kind, key } = describeStoredUrl(url);
    // Only keys this namespace owns; seeded /images/... paths were never in the bucket.
    if (kind === "deletable" && key && url) found.push({ table, column, id, url, key });
  };

  for (const row of settings) {
    add("SiteSettings", "homepagePortraitUrl", row.id, row.homepagePortraitUrl);
    add("SiteSettings", "logoUrl", row.id, row.logoUrl);
  }
  for (const row of home) {
    add("HomeContent", "portraitUrl", row.id, row.portraitUrl);
    add("HomeContent", "logoUrl", row.id, row.logoUrl);
  }
  for (const row of portraits) add("HomePortrait", "imageUrl", row.id, row.imageUrl);
  for (const row of about) add("AboutContent", "featureMediaUrl", row.id, row.featureMediaUrl);
  for (const row of experience) add("Experience", "imageUrl", row.id, row.imageUrl);
  for (const row of clients) add("Client", "logoUrl", row.id, row.logoUrl);
  for (const row of projects) {
    add("Project", "coverImageUrl", row.id, row.coverImageUrl);
    add("Project", "heroImageUrl", row.id, row.heroImageUrl);
  }
  for (const row of images) add("ProjectImage", "url", row.id, row.url);
  for (const row of gallery) add("GalleryPhoto", "imageUrl", row.id, row.imageUrl);
  return found;
}
