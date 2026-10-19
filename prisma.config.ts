import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "prisma/config";

loadLocalEnv(".env.local");

const databaseUrl = migrateConnectionString(process.env.DATABASE_URL);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --env-file=.env.local --import tsx prisma/seed.ts",
  },
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});

function migrateConnectionString(url: string | undefined) {
  const direct =
    process.env.DATABASE_URL_UNPOOLED?.trim() ||
    process.env.DIRECT_URL?.trim() ||
    process.env.POSTGRES_URL_NON_POOLING?.trim();
  if (direct) return direct;
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

function loadLocalEnv(file: string) {
  if (!existsSync(file)) return;

  const text = readFileSync(file, "utf8");

  for (const line of text.split(/\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
