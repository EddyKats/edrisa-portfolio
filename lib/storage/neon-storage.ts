import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  extensionFor,
  extensionForMedia,
  isContentAssetKey,
  isContentAssetScope,
  isPortfolioAssetKey,
  isPortfolioAssetKeyForRole,
  isDeletableAssetKey,
  matchesMediaSignature,
  mediaBucket,
  namespacedAssetKey,
  readMediaSize,
  uploadKindForRole,
  validateImageUpload,
  validateMediaUpload,
  validateUploadKind,
  type AllowedImageType,
  type AllowedMediaType,
  type ContentAssetScope,
  type PortfolioAssetRole,
  type UploadKind,
} from "./validation";

export type { PortfolioAssetRole };

/**
 * How a stored URL relates to the bucket this deployment can act on. The distinction
 * matters on delete: "external" is a seeded /images/... path we were never meant to
 * touch, while "unconfigured"/"foreign" is our own URL that we cannot remove — silent
 * success there would hide real drift between the database and storage.
 */
export type StoredUrlKind = "none" | "external" | "unconfigured" | "foreign" | "deletable";

export type PortfolioAsset = {
  publicUrl: string;
  key: string;
  mimeType: AllowedMediaType;
  size: number;
  width: number | null;
  height: number | null;
};

const headerBytes = 256 * 1024;
const immutableCache = "public, max-age=31536000, immutable";

export function storageConfigured() {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_ENDPOINT_URL_S3 &&
      process.env.AWS_REGION,
  );
}

export function publicAssetUrl(key: string) {
  const endpoint = storageEndpoint();
  return `${endpoint}/${mediaBucket}/${key}`;
}

export function storageKeyFromUrl(url: string | null | undefined) {
  if (!url || !storageConfigured()) return null;
  const prefix = `${storageEndpoint()}/${mediaBucket}/`;
  if (!url.startsWith(prefix)) return null;
  return decodeURIComponent(url.slice(prefix.length));
}

/**
 * Classifies a stored URL without short-circuiting on storageConfigured(), so callers
 * can tell "this was never ours" from "this is ours but we cannot delete it". Deleting
 * is namespaced, so a URL from another namespace is reported rather than silently kept.
 */
export function describeStoredUrl(url: string | null | undefined): { kind: StoredUrlKind; key: string | null } {
  if (!url) return { kind: "none", key: null };

  // Seeded static paths such as /images/edrisa-portrait.jpg were never in the bucket.
  if (!/^https?:\/\//.test(url)) return { kind: "external", key: null };

  const endpoint = storageEndpoint();
  if (!endpoint) return { kind: "unconfigured", key: null };

  const prefix = `${endpoint}/${mediaBucket}/`;
  if (!url.startsWith(prefix)) return { kind: "external", key: null };

  const key = decodeURIComponent(url.slice(prefix.length));
  if (!storageConfigured()) return { kind: "unconfigured", key };
  return { kind: isDeletableAssetKey(key) ? "deletable" : "foreign", key };
}

export async function createPortfolioUpload(input: {
  projectId: string;
  role: PortfolioAssetRole;
  type: string;
  size: number;
}) {
  // Prepare and confirm must agree on what this role accepts, or a file passes the
  // signed PUT and is then rejected after the bytes have already been uploaded.
  const kind = uploadKindForRole(input.role);
  const error = validateUploadKind(kind, input);
  if (error) return { error };
  assertProjectId(input.projectId);
  const type = input.type as AllowedMediaType;
  const extension = kind === "media" ? extensionForMedia(type) : extensionFor(type as AllowedImageType);
  const key = namespacedAssetKey(
    `projects/${input.projectId}/${input.role}/${crypto.randomUUID()}.${extension}`,
  );
  const command = new PutObjectCommand({
    Bucket: mediaBucket,
    Key: key,
    ContentType: type,
    ContentLength: input.size,
    CacheControl: immutableCache,
  });
  const uploadUrl = await getSignedUrl(client(), command, {
    expiresIn: 300,
    signableHeaders: new Set(["cache-control"]),
  });
  return {
    uploadUrl,
    key,
    cacheControl: immutableCache,
    headers: { "Content-Type": type },
  };
}

export async function createContentUpload(input: {
  scope: string;
  ownerId: string;
  type: string;
  size: number;
}) {
  if (!isContentAssetScope(input.scope)) return { error: "That upload could not be started." };
  const allowVideo = input.scope === "home-media";
  const error = allowVideo ? validateMediaUpload(input) : validateImageUpload(input);
  if (error) return { error };
  assertOwnerId(input.ownerId);
  const type = input.type as AllowedMediaType;
  const extension = allowVideo ? extensionForMedia(type) : extensionFor(type as AllowedImageType);
  const key = namespacedAssetKey(`content/${input.scope}/${input.ownerId}/${crypto.randomUUID()}.${extension}`);
  const command = new PutObjectCommand({
    Bucket: mediaBucket,
    Key: key,
    ContentType: type,
    ContentLength: input.size,
    CacheControl: immutableCache,
  });
  const uploadUrl = await getSignedUrl(client(), command, {
    expiresIn: 300,
    signableHeaders: new Set(["cache-control"]),
  });
  return { uploadUrl, key, cacheControl: immutableCache, headers: { "Content-Type": type } };
}

export async function inspectContentAsset(
  scope: ContentAssetScope,
  ownerId: string,
  key: string,
): Promise<PortfolioAsset | { error: string }> {
  if (!storageConfigured()) return { error: "Image storage is not configured." };
  if (!isContentAssetKey(scope, ownerId, key)) return { error: "That upload could not be verified." };
  return inspectStoredImage(key);
}

export async function inspectPortfolioAsset(
  projectId: string,
  key: string,
  role?: PortfolioAssetRole,
): Promise<PortfolioAsset | { error: string }> {
  if (!storageConfigured()) return { error: "Image storage is not configured." };
  const matches = role ? isPortfolioAssetKeyForRole(projectId, role, key) : isPortfolioAssetKey(projectId, key);
  if (!matches) return { error: "That upload could not be verified." };

  return inspectStoredImage(key, role ? uploadKindForRole(role) : "media");
}

async function inspectStoredImage(key: string, kind: UploadKind = "media"): Promise<PortfolioAsset | { error: string }> {
  // The upload is already in the bucket by this point, so a failure here must be
  // reported rather than thrown: the caller needs to clean the object up.
  let stored;
  try {
    stored = await client().send(new HeadObjectCommand({ Bucket: mediaBucket, Key: key }));
  } catch {
    return { error: "That upload could not be verified. Try again." };
  }

  const type = stored.ContentType ?? "";
  const size = stored.ContentLength ?? 0;
  const invalid = validateUploadKind(kind, { type, size });
  if (invalid) return { error: invalid };

  let sample: Uint8Array;
  try {
    sample = await readObjectStart(key);
  } catch {
    return { error: "That upload could not be verified. Try again." };
  }

  const mediaType = type as AllowedMediaType;
  if (!matchesMediaSignature(mediaType, sample)) return { error: "That file does not match an allowed format." };
  const dimensions = readMediaSize(mediaType, sample);
  return {
    publicUrl: publicAssetUrl(key),
    key,
    mimeType: mediaType,
    size,
    width: dimensions?.width ?? null,
    height: dimensions?.height ?? null,
  };
}

export async function deletePortfolioAsset(key: string) {
  if (!storageConfigured()) return;
  if (!isDeletableAssetKey(key)) {
    throw new Error("Refusing to delete an object outside the active media namespace.");
  }
  await client().send(new DeleteObjectCommand({ Bucket: mediaBucket, Key: key }));
}

/**
 * One-time bucket bootstrap. Browser uploads PUT straight to storage, so the bucket
 * needs this CORS rule before any of that works. Run once per bucket, not per request.
 */
export async function allowBrowserUploads() {
  await client().send(
    new PutBucketCorsCommand({
      Bucket: mediaBucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "HEAD"],
            AllowedOrigins: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    }),
  );
}

function client() {
  if (!storageConfigured()) throw new Error("Image storage is not configured.");
  return new S3Client({
    region: process.env.AWS_REGION,
    endpoint: storageEndpoint(),
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
    },
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  });
}

function storageEndpoint() {
  return (process.env.AWS_ENDPOINT_URL_S3 ?? "").replace(/\/$/, "");
}

function assertProjectId(projectId: string) {
  if (!/^[A-Za-z0-9]+$/.test(projectId)) throw new Error("That project could not be found.");
}

function assertOwnerId(ownerId: string) {
  if (!/^[A-Za-z0-9-]+$/.test(ownerId)) throw new Error("That record could not be found.");
}

async function readObjectStart(key: string) {
  const response = await client().send(
    new GetObjectCommand({
      Bucket: mediaBucket,
      Key: key,
      Range: `bytes=0-${headerBytes - 1}`,
    }),
  );
  return response.Body ? response.Body.transformToByteArray() : new Uint8Array();
}
