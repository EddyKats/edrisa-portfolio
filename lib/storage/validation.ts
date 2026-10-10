export const mediaBucket = "edrisa-media";

export const maxImageBytes = 12 * 1024 * 1024;

export const maxImageLabel = "12 MB";

export const allowedImageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
} as const;

export type AllowedImageType = keyof typeof allowedImageTypes;

const keyPattern =
  /^projects\/[A-Za-z0-9]+\/(?:cover|hero|gallery)\/[0-9a-f-]{36}\.(?:jpg|png|webp|avif)$/;

export function isAllowedImageType(value: string): value is AllowedImageType {
  return value in allowedImageTypes;
}

export function extensionFor(type: AllowedImageType) {
  return allowedImageTypes[type];
}

export function validateImageUpload(input: { type: string; size: number }) {
  if (!isAllowedImageType(input.type)) {
    return "Use a JPEG, PNG, WebP, or AVIF image.";
  }
  if (!Number.isFinite(input.size) || input.size <= 0) {
    return "That file is empty.";
  }
  if (input.size > maxImageBytes) {
    return `Images must be ${maxImageLabel} or smaller.`;
  }
  return null;
}

export function isPortfolioAssetKey(projectId: string, key: string) {
  return key.startsWith(`projects/${projectId}/`) && keyPattern.test(key);
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
  return ascii(bytes, 4, 4) === "ftyp" && /avif|avis/.test(ascii(bytes, 8, 4));
}

export function readImageSize(type: AllowedImageType, bytes: Uint8Array) {
  if (type === "image/png") return readPng(bytes);
  if (type === "image/jpeg") return readJpeg(bytes);
  if (type === "image/webp") return readWebp(bytes);
  return readAvif(bytes);
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
