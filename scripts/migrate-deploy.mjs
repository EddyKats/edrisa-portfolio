import { spawnSync } from "node:child_process";
import pg from "pg";

const attempts = 4;
const waitMs = 8000;
const prismaLock = 72707369;

function migrateUrl() {
  const direct =
    process.env.DATABASE_URL_UNPOOLED?.trim() ||
    process.env.DIRECT_URL?.trim() ||
    process.env.POSTGRES_URL_NON_POOLING?.trim();
  if (direct) return direct;
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.replace(/-pooler(?=\.)/, "");
    parsed.searchParams.delete("pgbouncer");
    return parsed.toString();
  } catch {
    return url;
  }
}

async function releaseStaleMigrateLock() {
  const connectionString = migrateUrl();
  if (!connectionString) return;
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 15000 });
  await client.connect();
  const result = await client.query(
    `SELECT pg_terminate_backend(l.pid)
     FROM pg_locks l
     WHERE l.locktype = 'advisory'
       AND l.objid = $1
       AND l.pid <> pg_backend_pid()`,
    [prismaLock],
  );
  await client.end();
  if (result.rowCount) {
    console.warn(`Released ${result.rowCount} stale Prisma migrate advisory lock(s).`);
  }
}

await releaseStaleMigrateLock().catch((error) => {
  console.warn("Could not inspect Prisma migrate locks:", error instanceof Error ? error.message : error);
});

for (let attempt = 1; attempt <= attempts; attempt += 1) {
  const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status === 0) process.exit(0);
  if (attempt === attempts) process.exit(result.status === null ? 1 : result.status);
  console.warn(`prisma migrate deploy failed (attempt ${attempt}/${attempts}). Retrying in ${waitMs / 1000}s.`);
  await new Promise((resolve) => setTimeout(resolve, waitMs));
}
