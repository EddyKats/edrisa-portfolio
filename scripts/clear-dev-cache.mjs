import { rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const cacheDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".next",
);

try {
  await rm(cacheDir, { recursive: true, force: true });
} catch (error) {
  const code =
    error && typeof error === "object" && "code" in error ? error.code : "";
  console.error(
    code === "EBUSY" || code === "EPERM"
      ? "Could not clear the dev cache because the dev server is still running. Stop it with Ctrl+C, then run npm.cmd run dev again."
      : "Could not clear the dev cache.",
  );
  console.error(error);
  process.exit(1);
}
