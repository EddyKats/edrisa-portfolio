import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  boardWidthMismatch,
  isPortfolioAssetKey,
  isPortfolioAssetKeyForRole,
  matchesMediaSignature,
  maxGifBytes,
  maxImageBytes,
  maxVideoBytes,
  naturalFileNameCompare,
  readMediaSize,
  roleFromAssetKey,
  uploadKindForRole,
  validateImageUpload,
  validateMediaUpload,
  validateUploadKind,
} from "./validation";

const projectId = "project1";

test("still images stay within the existing limit and reject video", () => {
  assert.equal(validateImageUpload({ type: "image/jpeg", size: maxImageBytes }), null);
  assert.match(validateImageUpload({ type: "image/jpeg", size: maxImageBytes + 1 }) ?? "", /12 MB/);
  assert.match(validateImageUpload({ type: "image/gif", size: 100 }) ?? "", /JPEG/);
  assert.match(validateImageUpload({ type: "video/mp4", size: 100 }) ?? "", /JPEG/);
});

test("presentation media uses separate limits", () => {
  assert.equal(validateMediaUpload({ type: "image/png", size: maxImageBytes }), null);
  assert.match(validateMediaUpload({ type: "image/png", size: maxImageBytes + 1 }) ?? "", /12 MB/);
  assert.equal(validateMediaUpload({ type: "image/gif", size: maxGifBytes }), null);
  assert.match(validateMediaUpload({ type: "image/gif", size: maxGifBytes + 1 }) ?? "", /25 MB/);
  assert.equal(validateMediaUpload({ type: "video/mp4", size: maxVideoBytes }), null);
  assert.equal(validateMediaUpload({ type: "video/webm", size: 1024 }), null);
  assert.match(validateMediaUpload({ type: "video/mp4", size: maxVideoBytes + 1 }) ?? "", /100 MB/);
  assert.match(validateMediaUpload({ type: "image/svg+xml", size: 10 }) ?? "", /WebM/);
});

test("signatures distinguish stills, gif, and video", () => {
  const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x02, 0x00, 0x03, 0x00]);
  const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
  const webm = new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]);
  const mp4 = new Uint8Array(16);
  mp4.set([0x66, 0x74, 0x79, 0x70], 4);
  assert.equal(matchesMediaSignature("image/gif", gif), true);
  assert.equal(matchesMediaSignature("image/jpeg", gif), false);
  assert.equal(matchesMediaSignature("image/jpeg", jpeg), true);
  assert.equal(matchesMediaSignature("video/webm", webm), true);
  assert.equal(matchesMediaSignature("video/mp4", mp4), true);
  assert.deepEqual(readMediaSize("image/gif", gif), { width: 2, height: 3 });
  assert.equal(readMediaSize("video/mp4", mp4), null);
});

test("legacy gallery keys stay deletable and presentation keys are accepted", () => {
  const previous = process.env.MEDIA_NAMESPACE;
  process.env.MEDIA_NAMESPACE = "development";
  const id = "11111111-1111-1111-1111-111111111111";
  try {
  assert.equal(isPortfolioAssetKey(projectId, `development/projects/${projectId}/gallery/${id}.jpg`), true);
  assert.equal(isPortfolioAssetKey(projectId, `development/projects/${projectId}/presentation/${id}.gif`), true);
  assert.equal(isPortfolioAssetKey(projectId, `development/projects/${projectId}/presentation/${id}.mp4`), true);
  assert.equal(isPortfolioAssetKey(projectId, `development/projects/${projectId}/presentation/${id}.webm`), true);
  assert.equal(isPortfolioAssetKey(projectId, `production/projects/${projectId}/gallery/${id}.png`), false);
  assert.equal(isPortfolioAssetKey(projectId, `development/projects/other/presentation/${id}.mp4`), false);
  } finally {
    process.env.MEDIA_NAMESPACE = previous;
  }
});

test("a key is bound to the role it was uploaded for", () => {
  const previous = process.env.MEDIA_NAMESPACE;
  process.env.MEDIA_NAMESPACE = "development";
  const id = "11111111-1111-1111-1111-111111111111";
  const presentation = `development/projects/${projectId}/presentation/${id}.mp4`;
  const cover = `development/projects/${projectId}/cover/${id}.jpg`;
  try {
    assert.equal(roleFromAssetKey(presentation), "presentation");
    assert.equal(roleFromAssetKey(cover), "cover");
    assert.equal(roleFromAssetKey("development/projects/x/nonsense/file.jpg"), null);

    assert.equal(isPortfolioAssetKeyForRole(projectId, "presentation", presentation), true);
    assert.equal(isPortfolioAssetKeyForRole(projectId, "cover", cover), true);
    // The hole this closes: a presentation video must not be confirmable as a cover.
    assert.equal(isPortfolioAssetKeyForRole(projectId, "cover", presentation), false);
    assert.equal(isPortfolioAssetKeyForRole(projectId, "presentation", cover), false);
  } finally {
    process.env.MEDIA_NAMESPACE = previous;
  }
});

test("roles map to the limits their slot can actually render", () => {
  assert.equal(uploadKindForRole("cover"), "image");
  assert.equal(uploadKindForRole("hero"), "image");
  assert.equal(uploadKindForRole("gallery"), "media");
  assert.equal(uploadKindForRole("presentation"), "media");

  assert.match(validateUploadKind("image", { type: "video/mp4", size: 100 }) ?? "", /JPEG/);
  assert.equal(validateUploadKind("media", { type: "video/mp4", size: 100 }), null);
  assert.equal(validateUploadKind("image", { type: "image/png", size: maxImageBytes }), null);
  assert.match(validateUploadKind("media", { type: "image/gif", size: maxGifBytes + 1 }) ?? "", /25 MB/);
});

test("avif detection scans compatible brands, not just the major brand", () => {
  const ftyp = (major: string, compatible: string[]) => {
    const size = 16 + compatible.length * 4;
    const bytes = new Uint8Array(size);
    bytes[0] = (size >>> 24) & 0xff;
    bytes[1] = (size >>> 16) & 0xff;
    bytes[2] = (size >>> 8) & 0xff;
    bytes[3] = size & 0xff;
    const put = (text: string, offset: number) => bytes.set([...text].map((c) => c.charCodeAt(0)), offset);
    put("ftyp", 4);
    put(major, 8);
    compatible.forEach((brand, index) => put(brand, 16 + index * 4));
    return bytes;
  };

  assert.equal(matchesMediaSignature("image/avif", ftyp("avif", ["avif", "mif1"])), true);
  // libavif and friends commonly emit mif1 as the major brand with avif merely compatible.
  assert.equal(matchesMediaSignature("image/avif", ftyp("mif1", ["mif1", "avif", "miaf"])), true);
  assert.equal(matchesMediaSignature("image/avif", ftyp("heic", ["mif1", "heic"])), false);
  assert.equal(matchesMediaSignature("image/avif", ftyp("isom", ["isom", "mp42"])), false);
});

test("filenames sort in natural numeric order", () => {
  const names = ["10-end.jpg", "2-logo.jpg", "01-introduction.jpg", "04-brand-system.gif", "05-app.mp4"];
  assert.deepEqual(names.slice().sort(naturalFileNameCompare), [
    "01-introduction.jpg",
    "2-logo.jpg",
    "04-brand-system.gif",
    "05-app.mp4",
    "10-end.jpg",
  ]);
});

test("every media url column in the schema is covered by the reference check", () => {
  // A URL column missing from usedStorageUrls reads as unreferenced, so its file would
  // be deleted while a row still points at it — a broken image on the public site.
  // media.ts imports server-only, so compare against the schema rather than importing it.
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
  const schema = readFileSync(path.join(root, "prisma", "schema.prisma"), "utf8");
  const media = readFileSync(path.join(root, "lib", "content", "media.ts"), "utf8");

  const declared = new Set<string>();
  let model = "";
  for (const line of schema.split("\n")) {
    const start = /^model\s+(\w+)\s*\{/.exec(line);
    if (start) model = start[1]!;
    const field = /^\s{2}(\w*(?:[Uu]rl|URL))\s+String/.exec(line);
    // siteUrl and the social links are addresses we never store files for.
    if (model && field && /image|logo|portrait|media|cover|hero|^url$/i.test(field[1]!)) {
      declared.add(`${model}.${field[1]}`);
    }
  }

  assert.ok(declared.size > 0, "schema parse found no media url columns");
  const missing = [...declared].filter((column) => !media.includes(`"${column}"`));
  assert.deepEqual(missing, [], `add these to storageUrlColumns and usedStorageUrls: ${missing.join(", ")}`);
});

test("board width warnings are proportional and skip unknown sizes", () => {
  assert.equal(boardWidthMismatch(2800, 2800), false);
  assert.equal(boardWidthMismatch(2800, 2780), false);
  assert.equal(boardWidthMismatch(2800, 1400), true);
  assert.equal(boardWidthMismatch(2800, null), false);
  assert.equal(boardWidthMismatch(null, 1400), false);
});
