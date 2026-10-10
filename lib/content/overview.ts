import "server-only";

import { getDb } from "@/lib/db";

export async function getStudioOverview() {
  const db = getDb();
  const [publishedProjects, draftProjects, services, clients, recentProjects] = await Promise.all([
    db.project.count({ where: { published: true } }),
    db.project.count({ where: { published: false } }),
    db.service.count(),
    db.client.count(),
    db.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, published: true, updatedAt: true },
    }),
  ]);

  return { publishedProjects, draftProjects, services, clients, recentProjects };
}
