import "server-only";

import { canonicalPortfolioCategories } from "@/data/portfolio";
import { getDb } from "@/lib/db";

export async function listCanonicalCategories() {
  const rows = await getDb().portfolioCategory.findMany({
    where: { name: { in: [...canonicalPortfolioCategories] } },
    select: { id: true, name: true },
  });
  return canonicalPortfolioCategories.flatMap((name) => {
    const row = rows.find((item) => item.name === name);
    return row ? [row] : [];
  });
}

export async function listPortfolioCategories() {
  return getDb().portfolioCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, published: true },
  });
}
