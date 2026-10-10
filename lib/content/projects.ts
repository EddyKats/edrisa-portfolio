import "server-only";

import { getDb } from "@/lib/db";
import type { ProjectInput } from "@/lib/studio/project-schema";

export class ProjectWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectWriteError";
  }
}

function isUniqueConflict(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

async function assertCategory(categoryId: string) {
  const category = await getDb().portfolioCategory.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) throw new ProjectWriteError("Choose a category.");
}

export async function listStudioProjects() {
  return getDb().project.findMany({
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      size: true,
      published: true,
      updatedAt: true,
      category: { select: { name: true } },
    },
  });
}

export async function getStudioProject(id: string) {
  return getDb().project.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      services: { orderBy: { sortOrder: "asc" }, select: { serviceId: true } },
      software: { orderBy: { sortOrder: "asc" }, select: { softwareId: true } },
      credits: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
    },
  });
}

export async function createProjectRecord(input: ProjectInput) {
  await assertCategory(input.categoryId);
  try {
    return await getDb().project.create({
      data: input,
      select: { id: true, slug: true },
    });
  } catch (error) {
    if (isUniqueConflict(error)) throw new ProjectWriteError("That slug is already used.");
    throw error;
  }
}

export async function updateProjectRecord(id: string, input: ProjectInput) {
  const existing = await getDb().project.findUnique({
    where: { id },
    select: { id: true, slug: true },
  });
  if (!existing) throw new ProjectWriteError("That project was not found.");

  await assertCategory(input.categoryId);
  const conflict = await getDb().project.findFirst({
    where: { slug: input.slug, NOT: { id } },
    select: { id: true },
  });
  if (conflict) throw new ProjectWriteError("That slug is already used.");

  try {
    const project = await getDb().project.update({
      where: { id },
      data: input,
      select: { id: true, slug: true },
    });
    return { project, previousSlug: existing.slug };
  } catch (error) {
    if (isUniqueConflict(error)) throw new ProjectWriteError("That slug is already used.");
    throw error;
  }
}

export async function setProjectPublished(id: string, published: boolean) {
  const existing = await getDb().project.findUnique({ where: { id }, select: { id: true, slug: true } });
  if (!existing) throw new ProjectWriteError("That project was not found.");

  await getDb().project.update({ where: { id }, data: { published } });
  return existing;
}

export async function deleteProjectRecord(id: string) {
  const existing = await getDb().project.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      coverImageUrl: true,
      heroImageUrl: true,
      images: { select: { url: true } },
    },
  });
  if (!existing) throw new ProjectWriteError("That project was not found.");
  await getDb().project.delete({ where: { id } });
  return existing;
}
