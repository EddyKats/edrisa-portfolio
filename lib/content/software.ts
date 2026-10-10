import "server-only";

import { getDb } from "@/lib/db";

export async function listSoftwareCatalogue() {
  return getDb().software.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, key: true, name: true, iconKey: true, published: true },
  });
}
