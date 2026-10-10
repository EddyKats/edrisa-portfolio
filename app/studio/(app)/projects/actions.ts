"use server";

import { redirect } from "next/navigation";
import { revalidateProjectContent } from "@/lib/content/revalidate";
import { removeProjectFiles } from "@/lib/content/project-media";
import { replaceProjectRelations } from "@/lib/content/project-relations";
import {
  createProjectRecord,
  deleteProjectRecord,
  ProjectWriteError,
  setProjectPublished,
  updateProjectRecord,
} from "@/lib/content/projects";
import { requireAdmin } from "@/lib/auth/require-admin";
import { parseProjectForm } from "@/lib/studio/project-schema";

export type ProjectActionState = {
  error?: string;
  ok?: boolean;
};

function failure(error: unknown, fallback = "The project could not be saved."): ProjectActionState {
  if (error instanceof ProjectWriteError) return { error: error.message };
  return { error: fallback };
}

export async function createProject(_state: ProjectActionState, formData: FormData): Promise<ProjectActionState> {
  await requireAdmin();
  const parsed = parseProjectForm(formData, { generateSlug: true });
  if (!parsed.ok) return { error: parsed.error };

  let projectId = "";
  try {
    const project = await createProjectRecord(parsed.data);
    projectId = project.id;
    if (formData.get("relations") === "1") {
      await replaceProjectRelations(project.id, selectedIds(formData, "serviceId"), selectedIds(formData, "softwareId"));
    }
    revalidateProjectContent([project.slug]);
  } catch (error) {
    return failure(error);
  }

  redirect(`/studio/projects/${projectId}?saved=1`);
}

export async function updateProject(_state: ProjectActionState, formData: FormData): Promise<ProjectActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = parseProjectForm(formData, { generateSlug: false });
  if (!parsed.ok) return { error: parsed.error };

  try {
    const { project, previousSlug } = await updateProjectRecord(id, parsed.data);
    if (formData.get("relations") === "1") {
      await replaceProjectRelations(id, selectedIds(formData, "serviceId"), selectedIds(formData, "softwareId"));
    }
    revalidateProjectContent([previousSlug, project.slug]);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function publishProject(_state: ProjectActionState, formData: FormData): Promise<ProjectActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const published = formData.get("published") === "true";

  try {
    const project = await setProjectPublished(id, published);
    revalidateProjectContent([project.slug]);
    return { ok: true };
  } catch (error) {
    return failure(error, "The project could not be updated.");
  }
}

export async function deleteProject(_state: ProjectActionState, formData: FormData): Promise<ProjectActionState> {
  await requireAdmin();
  if (formData.get("confirm") !== "delete") {
    return { error: "Confirm deletion before removing a project." };
  }

  const id = String(formData.get("id") ?? "");
  let slug = "";
  try {
    const project = await deleteProjectRecord(id);
    slug = project.slug;
    revalidateProjectContent([slug]);
    const warning = await removeProjectFiles([
      project.coverImageUrl,
      project.heroImageUrl,
      ...project.images.map((image) => image.url),
    ]);
    if (warning) return { error: warning };
  } catch (error) {
    return failure(error, "The project could not be deleted.");
  }

  redirect("/studio/projects");
}

function selectedIds(formData: FormData, name: string) {
  return formData.getAll(name).map(String);
}
