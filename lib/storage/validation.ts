export const mediaBucket = "edrisa-media";

export const maxImageBytes = 12 * 1024 * 1024;
export const maxGifBytes = 25 * 1024 * 1024;
export const maxVideoBytes = 100 * 1024 * 1024;

export const maxImageLabel = "12 MB";
export const maxGifLabel = "25 MB";
export const maxVideoLabel = "100 MB";

export const allowedImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

export const allowedMediaTypes = {
  ...allowedImageTypes,
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
} as const;

export type AllowedImageType = keyof typeof allowedImageTypes;
export type AllowedMediaType = keyof typeof allowedMediaTypes;
export type PresentationKind = "IMAGE" | "GIF" | "VIDEO";
export type PortfolioAssetRole = "cover" | "hero" | "gallery" | "presentation";

/** Stills only, or stills plus GIF and video. Decides which limits and types apply. */
export type UploadKind = "image" | "media";

const portfolioAssetRoles = ["cover", "hero", "gallery", "presentation"] as const;

const mediaNamespaces = ["development", "preview", "production"] as const;

export type MediaNamespace = (typeof mediaNamespaces)[number];

const namespaceName = mediaNamespaces.join("|");
const stillName = String.raw`[0-9a-f-]{36}\.(?:jpg|png|webp|avif)`;
const mediaName = String.raw`[0-9a-f-]{36}\.(?:jpg|png|webp|avif|gif|mp4|webm)`;
const keyPattern = new RegExp(
  String.raw`^(?:${namespaceName})\/projects\/[A-Za-z0-9]+\/(?:cover|hero|gallery|presentation)\/${mediaName}$`,
);
const contentKeyPattern = new RegExp(
  String.raw`^(?:${namespaceName})\/content\/(?:about-feature|experience|client|home-portrait|home-logo|gallery)\/[A-Za-z0-9-]+\/${stillName}$`,
);
const homeMediaKeyPattern = new RegExp(
  String.raw`^(?:${namespaceName})\/content\/home-media\/[A-Za-z0-9-]+\/${mediaName}$`,
);

export const contentAssetScopes = ["about-feature", "experience", "client", "home-portrait", "home-logo", "home-media", "gallery"] as const;

export type ContentAssetScope = (typeof contentAssetScopes)[number];

export function isAllowedImageType(value: string): value is AllowedImageType {
  return value in allowedImageTypes;
}

export function isAllowedMediaType(value: string): value is AllowedMediaType {
  return value in allowedMediaTypes;
}

export function extensionFor(type: AllowedImageType) {
  return allowedImageTypes[type];
}

export function extensionForMedia(type: AllowedMediaType) {
  return allowedMediaTypes[type];
}

export function presentationKindFor(type: AllowedMediaType): PresentationKind {
  if (type === "image/gif") return "GIF";
  if (type === "video/mp4" || type === "video/webm") return "VIDEO";
  return "IMAGE";
}

export function mediaLimit(type: AllowedMediaType) {
  if (type === "image/gif") return { bytes: maxGifBytes, label: maxGifLabel };
  if (type === "video/mp4" || type === "video/webm") return { bytes: maxVideoBytes, label: maxVideoLabel };
  return { bytes: maxImageBytes, label: maxImageLabel };
}

export function isPortfolioAssetRole(value: string): value is PortfolioAssetRole {
  return portfolioAssetRoles.includes(value as PortfolioAssetRole);
}

/** The role segment of a namespaced key, e.g. `.../projects/<id>/cover/<uuid>.jpg` -> "cover". */
export function roleFromAssetKey(key: string): PortfolioAssetRole | null {
  const role = key.split("/").at(-2) ?? "";
  return isPortfolioAssetRole(role) ? role : null;
}

/**
 * Gallery and presentation share a key prefix and both accept video, so they map to
 * the same kind. Cover and hero are stills: the public grid feeds them to next/image.
 */
export function uploadKindForRole(role: PortfolioAssetRole): UploadKind {
  return role === "gallery" || role === "presentation" ? "media" : "image";
}

export function validateUploadKind(kind: UploadKind, input: { type: string; size: number }) {
  return kind === "media" ? validateMediaUpload(input) : validateImageUpload(input);
}

export function validateImageUpload(input: { type: string; size: number }) {
  if (!isAllowedImageType(input.type)) {
    return "Use a JPEG, PNG, WebP, or AVIF image.";
  }
  return validateSizedUpload(input.size, maxImageBytes, `Images must be ${maxImageLabel} or smaller.`);
}

export function validateMediaUpload(input: { type: string; size: number }) {
  if (!isAllowedMediaType(input.type)) {
    return "Use a JPEG, PNG, WebP, AVIF, GIF, MP4, or WebM file.";
  }
  const limit = mediaLimit(input.type);
  const noun = input.type.startsWith("video/") ? "Videos" : input.type === "image/gif" ? "GIFs" : "Images";
  return validateSizedUpload(input.size, limit.bytes, `${noun} must be ${limit.label} or smaller.`);
}

function validateSizedUpload(size: number, max: number, tooLarge: string) {
  if (!Number.isFinite(size) || size <= 0) return "That file is empty.";
  if (size > max) return tooLarge;
  return null;
}

export function naturalFileNameCompare(a: string, b: string) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function boardWidthMismatch(reference: number | null, width: number | null) {
  if (!reference || !width || reference <= 0) return false;
  return Math.abs(width - reference) / reference > 0.01;
}

export function activeMediaNamespace(): MediaNamespace | null {
  const value = process.env.MEDIA_NAMESPACE;
  return mediaNamespaces.includes(value as MediaNamespace) ? (value as MediaNamespace) : null;
}

export function namespacedAssetKey(relativeKey: string) {
  const namespace = activeMediaNamespace();
  if (!namespace) throw new Error("MEDIA_NAMESPACE must be development, preview, or production.");
  return `${namespace}/${relativeKey}`;
}

export function isDeletableAssetKey(key: string) {
  const namespace = activeMediaNamespace();
  if (!namespace || !key.startsWith(`${namespace}/`)) return false;
  return keyPattern.test(key) || contentKeyPattern.test(key) || homeMediaKeyPattern.test(key);
}

export function isPortfolioAssetKey(projectId: string, key: string) {
  const namespace = activeMediaNamespace();
  return Boolean(namespace) && key.startsWith(`${namespace}/projects/${projectId}/`) && keyPattern.test(key);
}

/**
 * keyPattern accepts any role segment and any extension, so a key alone cannot say
 * which slot it belongs to. Without this check a presentation .mp4 could be confirmed
 * as a cover, and the Selected Works grid would hand that video to next/image.
 */
export function isPortfolioAssetKeyForRole(projectId: string, role: PortfolioAssetRole, key: string) {
  return isPortfolioAssetKey(projectId, key) && roleFromAssetKey(key) === role;
}

export function isContentAssetScope(value: string): value is ContentAssetScope {
  return contentAssetScopes.includes(value as ContentAssetScope);
}

export function isContentAssetKey(scope: ContentAssetScope, ownerId: string, key: string) {
  const namespace = activeMediaNamespace();
  if (!namespace || !key.startsWith(`${namespace}/content/${scope}/${ownerId}/`)) return false;
  return scope === "home-media" ? homeMediaKeyPattern.test(key) : contentKeyPattern.test(key);
}

export function matchesImageSignature(type: AllowedImageType, bytes: Uint8Array) {
  if (type === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }
  if (type === "image/webp") {
    return (
      ascii(bytes, 0, 4) === "RIFF" &&
      ascii(bytes, 8, 4) === "WEBP"
    );
  }
  return matchesAvifBrand(bytes);
}

/**
 * AVIF carries its brands in the leading `ftyp` box: the major brand at offset 8 and
 * compatible brands from offset 16. Testing only the major brand rejects the very
 * common `mif1`-major file that lists `avif` as compatible, so scan the whole box.
 * Still requires avif/avis, which keeps HEIC (heic/heix) and plain MP4 (isom/mp42) out.
 */
function matchesAvifBrand(bytes: Uint8Array) {
  if (ascii(bytes, 4, 4) !== "ftyp") return false;
  const declared = readUint32(bytes, 0);
  const end = Math.min(declared > 0 ? declared : bytes.length, bytes.length);
  if (ascii(bytes, 8, 4) === "avif" || ascii(bytes, 8, 4) === "avis") return true;
  for (let offset = 16; offset + 4 <= end; offset += 4) {
    const brand = ascii(bytes, offset, 4);
    if (brand === "avif" || brand === "avis") return true;
  }
  return false;
}

export function readImageSize(type: AllowedImageType, bytes: Uint8Array) {
  if (type === "image/png") return readPng(bytes);
  if (type === "image/jpeg") return readJpeg(bytes);
  if (type === "image/webp") return readWebp(bytes);
  return readAvif(bytes);
}

export function matchesMediaSignature(type: AllowedMediaType, bytes: Uint8Array) {
  if (type === "image/gif") return ascii(bytes, 0, 6) === "GIF87a" || ascii(bytes, 0, 6) === "GIF89a";
  if (type === "video/webm") return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
  if (type === "video/mp4") return ascii(bytes, 4, 4) === "ftyp";
  return matchesImageSignature(type, bytes);
}

export function readMediaSize(type: AllowedMediaType, bytes: Uint8Array) {
  if (type === "image/gif") return readGif(bytes);
  if (type === "video/mp4" || type === "video/webm") return null;
  return readImageSize(type, bytes);
}

function readGif(bytes: Uint8Array) {
  if (bytes.length < 10) return null;
  const width = bytes[6]! + (bytes[7]! << 8);
  const height = bytes[8]! + (bytes[9]! << 8);
  if (width <= 0 || height <= 0) return null;
  return { width, height };
}

function readPng(bytes: Uint8Array) {
  if (bytes.length < 24) return null;
  return { width: readUint32(bytes, 16), height: readUint32(bytes, 20) };
}

function readJpeg(bytes: Uint8Array) {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = bytes[offset + 1] ?? 0;
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }
    const length = readUint16(bytes, offset + 2);
    if (length < 2) return null;
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isStartOfFrame && offset + 9 < bytes.length) {
      return { width: readUint16(bytes, offset + 7), height: readUint16(bytes, offset + 5) };
    }
    offset += 2 + length;
  }
  return null;
}

function readWebp(bytes: Uint8Array) {
  const format = ascii(bytes, 12, 4);
  if (format === "VP8X" && bytes.length >= 30) {
    return {
      width: 1 + bytes[24]! + (bytes[25]! << 8) + (bytes[26]! << 16),
      height: 1 + bytes[27]! + (bytes[28]! << 8) + (bytes[29]! << 16),
    };
  }
  if (format === "VP8 " && bytes.length >= 30) {
    return { width: readUint16(bytes, 26) & 0x3fff, height: readUint16(bytes, 28) & 0x3fff };
  }
  if (format === "VP8L" && bytes.length >= 25) {
    const word = bytes[21]! + (bytes[22]! << 8) + (bytes[23]! << 16) + (bytes[24]! << 24);
    return { width: (word & 0x3fff) + 1, height: ((word >> 14) & 0x3fff) + 1 };
  }
  return null;
}

function readAvif(bytes: Uint8Array) {
  const marker = [0x69, 0x73, 0x70, 0x65];
  for (let index = 0; index < bytes.length - 20; index += 1) {
    if (marker.every((value, offset) => bytes[index + offset] === value)) {
      return { width: readUint32(bytes, index + 8), height: readUint32(bytes, index + 12) };
    }
  }
  return null;
}

function readUint16(bytes: Uint8Array, offset: number) {
  return (bytes[offset]! << 8) + bytes[offset + 1]!;
}

function readUint32(bytes: Uint8Array, offset: number) {
  return ((bytes[offset]! << 24) + (bytes[offset + 1]! << 16) + (bytes[offset + 2]! << 8) + bytes[offset + 3]!) >>> 0;
}

function ascii(bytes: Uint8Array, offset: number, length: number) {
  return String.fromCharCode(...bytes.slice(offset, offset + length));
}
