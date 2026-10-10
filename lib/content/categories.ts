import "server-only";

import { getDb } from "@/lib/db";

export async function listPortfolioCategories() {
  return getDb().portfolioCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, published: true },
  });
}
