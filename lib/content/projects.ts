import "server-only";

import { canonicalPortfolioCategories } from "@/data/portfolio";
import { getDb } from "@/lib/db";
import type { CreateProjectInput, UpdateProjectInput } from "@/lib/studio/project-schema";

export class ProjectWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProjectWriteError";
  }
}

function isUniqueConflict(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

async function canonicalCategoryIds(ids: string[]) {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return [];
  const rows = await getDb().portfolioCategory.findMany({
    where: { id: { in: unique }, name: { in: [...canonicalPortfolioCategories] } },
    select: { id: true, name: true },
  });
  if (rows.length !== unique.length) throw new ProjectWriteError("Choose a valid category.");
  const byName = new Map(rows.map((row) => [row.name, row.id]));
  return canonicalPortfolioCategories.flatMap((name) => {
    const id = byName.get(name);
    return id ? [id] : [];
  });
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
      coverImageUrl: true,
      category: { select: { name: true } },
      categories: {
        orderBy: { sortOrder: "asc" },
        select: { category: { select: { name: true } } },
      },
      _count: { select: { images: true } },
    },
  });
}

export async function getStudioProject(id: string) {
  return getDb().project.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true } },
      categories: { orderBy: { sortOrder: "asc" }, select: { categoryId: true, category: { select: { name: true } } } },
      images: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
      services: { orderBy: { sortOrder: "asc" }, select: { serviceId: true } },
      software: { orderBy: { sortOrder: "asc" }, select: { softwareId: true } },
      credits: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] },
    },
  });
}

export async function createProjectRecord(input: CreateProjectInput) {
  const categoryIds = await canonicalCategoryIds(input.categoryIds);
  try {
    return await getDb().project.create({
      data: {
        title: input.title,
        slug: input.slug,
        role: input.role,
        published: input.published,
        client: "",
        categoryId: categoryIds[0] ?? null,
        categories: {
          create: categoryIds.map((categoryId, sortOrder) => ({ categoryId, sortOrder })),
        },
      },
      select: { id: true, slug: true },
    });
  } catch (error) {
    if (isUniqueConflict(error)) throw new ProjectWriteError("That slug is already used.");
    throw error;
  }
}

export async function updateProjectRecord(id: string, input: UpdateProjectInput) {
  const existing = await getDb().project.findUnique({
    where: { id },
    select: { id: true, slug: true, categoryId: true },
  });
  if (!existing) throw new ProjectWriteError("That project was not found.");

  const categoryIds = await canonicalCategoryIds(input.categoryIds);
  const conflict = await getDb().project.findFirst({
    where: { slug: input.slug, NOT: { id } },
    select: { id: true },
  });
  if (conflict) throw new ProjectWriteError("That slug is already used.");

  try {
    const project = await getDb().$transaction(async (tx) => {
      await tx.projectCategory.deleteMany({ where: { projectId: id } });
      if (categoryIds.length > 0) {
        await tx.projectCategory.createMany({
          data: categoryIds.map((categoryId, sortOrder) => ({ projectId: id, categoryId, sortOrder })),
        });
      }
      return tx.project.update({
        where: { id },
        data: {
          title: input.title,
          slug: input.slug,
          role: input.role,
          client: input.client,
          year: input.year,
          shortDescription: input.shortDescription,
          fullDescription: input.fullDescription,
          size: input.size,
          sortOrder: input.sortOrder,
          featured: input.featured,
          seoTitle: input.seoTitle,
          seoDescription: input.seoDescription,
          categoryId: categoryIds[0] ?? existing.categoryId,
        },
        select: { id: true, slug: true },
      });
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
