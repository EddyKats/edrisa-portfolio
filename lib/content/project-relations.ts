import "server-only";

import { getDb } from "@/lib/db";
import { ProjectWriteError } from "@/lib/content/projects";

export async function replaceProjectRelations(projectId: string, serviceIds: string[], softwareIds: string[]) {
  const db = getDb();
  const uniqueServices = [...new Set(serviceIds)];
  const uniqueSoftware = [...new Set(softwareIds)];
  const [services, software] = await Promise.all([
    uniqueServices.length === 0
      ? []
      : db.service.findMany({ where: { id: { in: uniqueServices } }, select: { id: true } }),
    uniqueSoftware.length === 0
      ? []
      : db.software.findMany({ where: { id: { in: uniqueSoftware } }, select: { id: true } }),
  ]);
  if (services.length !== uniqueServices.length) throw new ProjectWriteError("Choose a valid service.");
  if (software.length !== uniqueSoftware.length) throw new ProjectWriteError("Choose a valid tool.");

  await db.$transaction(async (tx) => {
    await tx.projectService.deleteMany({ where: { projectId } });
    await tx.projectSoftware.deleteMany({ where: { projectId } });
    if (uniqueServices.length > 0) {
      await tx.projectService.createMany({
        data: uniqueServices.map((serviceId, sortOrder) => ({ projectId, serviceId, sortOrder })),
      });
    }
    if (uniqueSoftware.length > 0) {
      await tx.projectSoftware.createMany({
        data: uniqueSoftware.map((softwareId, sortOrder) => ({ projectId, softwareId, sortOrder })),
      });
    }
  });
}

export async function addProjectCredit(projectId: string, label: string, value: string) {
  const project = await projectSlug(projectId);
  const last = await getDb().projectCredit.findFirst({
    where: { projectId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  await getDb().projectCredit.create({
    data: { projectId, label, value, sortOrder: (last?.sortOrder ?? -1) + 1 },
  });
  return project;
}

export async function updateProjectCredit(creditId: string, label: string, value: string) {
  const credit = await getDb().projectCredit.findUnique({
    where: { id: creditId },
    select: { id: true, project: { select: { slug: true } } },
  });
  if (!credit) throw new ProjectWriteError("That credit was not found.");
  await getDb().projectCredit.update({ where: { id: creditId }, data: { label, value } });
  return credit.project.slug;
}

export async function deleteProjectCredit(creditId: string) {
  const credit = await getDb().projectCredit.findUnique({
    where: { id: creditId },
    select: { id: true, project: { select: { slug: true } } },
  });
  if (!credit) throw new ProjectWriteError("That credit was not found.");
  await getDb().projectCredit.delete({ where: { id: creditId } });
  return credit.project.slug;
}

export async function moveProjectCredit(creditId: string, direction: "up" | "down") {
  const credit = await getDb().projectCredit.findUnique({
    where: { id: creditId },
    select: { id: true, projectId: true, project: { select: { slug: true } } },
  });
  if (!credit) throw new ProjectWriteError("That credit was not found.");
  const credits = await getDb().projectCredit.findMany({
    where: { projectId: credit.projectId },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  const index = credits.findIndex((item) => item.id === creditId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= credits.length) return credit.project.slug;
  const next = credits.slice();
  const [moved] = next.splice(index, 1);
  next.splice(target, 0, moved!);
  await getDb().$transaction(
    next.map((item, sortOrder) => getDb().projectCredit.update({ where: { id: item.id }, data: { sortOrder } })),
  );
  return credit.project.slug;
}

async function projectSlug(projectId: string) {
  const project = await getDb().project.findUnique({ where: { id: projectId }, select: { slug: true } });
  if (!project) throw new ProjectWriteError("That project was not found.");
  return project.slug;
}
