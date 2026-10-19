import "server-only";

import { getDb } from "@/lib/db";

export async function getStudioOverview() {
  const db = getDb();
  const [publishedProjects, draftProjects, services, clients, recentProjects] = await Promise.all([
    db.project.count({ where: { published: true } }),
    db.project.count({ where: { published: false } }),
    db.service.count({ where: { published: true } }),
    db.client.count({ where: { published: true } }),
    db.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, published: true, updatedAt: true, coverImageUrl: true },
    }),
  ]);

  const projectTotal = publishedProjects + draftProjects;
  const publishedShare = projectTotal === 0 ? 0 : Math.round((publishedProjects / projectTotal) * 100);

  return { publishedProjects, draftProjects, services, clients, recentProjects, publishedShare };
}
