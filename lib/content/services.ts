import "server-only";

import { getDb } from "@/lib/db";

export async function listStudioServices() {
  return getDb().service.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: { id: true, title: true, published: true },
  });
}
