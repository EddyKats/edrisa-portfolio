import assert from "node:assert/strict";
import test from "node:test";
import {
  boardWidthMismatch,
  isPortfolioAssetKey,
  matchesMediaSignature,
  maxGifBytes,
  maxImageBytes,
  maxVideoBytes,
  naturalFileNameCompare,
  readMediaSize,
  validateImageUpload,
  validateMediaUpload,
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

test("board width warnings are proportional and skip unknown sizes", () => {
  assert.equal(boardWidthMismatch(2800, 2800), false);
  assert.equal(boardWidthMismatch(2800, 2780), false);
  assert.equal(boardWidthMismatch(2800, 1400), true);
  assert.equal(boardWidthMismatch(2800, null), false);
  assert.equal(boardWidthMismatch(null, 1400), false);
});
