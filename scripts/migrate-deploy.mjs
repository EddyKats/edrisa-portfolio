import { spawnSync } from "node:child_process";

const attempts = 4;
const waitMs = 8000;

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: process.env,
    shell: true,
  });
  if (result.status === 0) process.exit(0);
  if (attempt === attempts) process.exit(result.status === null ? 1 : result.status);
  console.warn(`prisma migrate deploy failed (attempt ${attempt}/${attempts}). Retrying in ${waitMs / 1000}s.`);
  await new Promise((resolve) => setTimeout(resolve, waitMs));
}
