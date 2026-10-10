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
  isContentAssetKey,
  isContentAssetScope,
  isPortfolioAssetKey,
  isDeletableAssetKey,
  matchesImageSignature,
  mediaBucket,
  namespacedAssetKey,
  readImageSize,
  validateImageUpload,
  type AllowedImageType,
  type ContentAssetScope,
} from "./validation";

export type PortfolioAssetRole = "cover" | "hero" | "gallery";

export type PortfolioAsset = {
  publicUrl: string;
  key: string;
  mimeType: AllowedImageType;
  size: number;
  width: number | null;
  height: number | null;
};

const headerBytes = 256 * 1024;

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

export async function createPortfolioUpload(input: {
  projectId: string;
  role: PortfolioAssetRole;
  type: string;
  size: number;
}) {
  const error = validateImageUpload(input);
  if (error) return { error };
  assertProjectId(input.projectId);
  const type = input.type as AllowedImageType;
  const key = namespacedAssetKey(
    `projects/${input.projectId}/${input.role}/${crypto.randomUUID()}.${extensionFor(type)}`,
  );
  const command = new PutObjectCommand({
    Bucket: mediaBucket,
    Key: key,
    ContentType: type,
    ContentLength: input.size,
  });
  const uploadUrl = await getSignedUrl(client(), command, { expiresIn: 300 });
  return {
    uploadUrl,
    key,
    headers: { "Content-Type": type },
  };
}

export async function createContentUpload(input: {
  scope: string;
  ownerId: string;
  type: string;
  size: number;
}) {
  const error = validateImageUpload(input);
  if (error || !isContentAssetScope(input.scope)) return { error: error ?? "That upload could not be started." };
  assertOwnerId(input.ownerId);
  const type = input.type as AllowedImageType;
  const key = namespacedAssetKey(
    `content/${input.scope}/${input.ownerId}/${crypto.randomUUID()}.${extensionFor(type)}`,
  );
  const command = new PutObjectCommand({
    Bucket: mediaBucket,
    Key: key,
    ContentType: type,
    ContentLength: input.size,
  });
  const uploadUrl = await getSignedUrl(client(), command, { expiresIn: 300 });
  return { uploadUrl, key, headers: { "Content-Type": type } };
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

export async function uploadPortfolioAsset(input: {
  projectId: string;
  role: PortfolioAssetRole;
  type: AllowedImageType;
  body: Uint8Array;
}) {
  const error = validateImageUpload({ type: input.type, size: input.body.byteLength });
  if (error) throw new Error(error);
  if (!matchesImageSignature(input.type, input.body)) throw new Error("That file is not an allowed image.");
  assertProjectId(input.projectId);
  const key = namespacedAssetKey(
    `projects/${input.projectId}/${input.role}/${crypto.randomUUID()}.${extensionFor(input.type)}`,
  );
  await client().send(
    new PutObjectCommand({
      Bucket: mediaBucket,
      Key: key,
      Body: input.body,
      ContentType: input.type,
    }),
  );
  const inspected = await inspectPortfolioAsset(input.projectId, key);
  if ("error" in inspected) {
    await deletePortfolioAsset(key);
    throw new Error(inspected.error);
  }
  return inspected;
}

export async function inspectPortfolioAsset(projectId: string, key: string): Promise<PortfolioAsset | { error: string }> {
  if (!storageConfigured()) return { error: "Image storage is not configured." };
  if (!isPortfolioAssetKey(projectId, key)) return { error: "That upload could not be verified." };

  return inspectStoredImage(key);
}

async function inspectStoredImage(key: string): Promise<PortfolioAsset | { error: string }> {
  const stored = await client().send(new HeadObjectCommand({ Bucket: mediaBucket, Key: key }));
  const type = stored.ContentType ?? "";
  const size = stored.ContentLength ?? 0;
  const invalid = validateImageUpload({ type, size });
  if (invalid) return { error: invalid };

  const sample = await readObjectStart(key);
  const imageType = type as AllowedImageType;
  if (!matchesImageSignature(imageType, sample)) return { error: "That file is not an allowed image." };
  const dimensions = readImageSize(imageType, sample);
  return {
    publicUrl: publicAssetUrl(key),
    key,
    mimeType: imageType,
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
