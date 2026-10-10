"use server";

import { revalidateProjectContent } from "@/lib/content/revalidate";
import {
  addProjectGalleryImage,
  clearProjectAsset,
  deleteProjectGalleryImage,
  moveProjectGalleryImage,
  saveProjectAsset,
  updateProjectGalleryText,
} from "@/lib/content/project-media";
import {
  addProjectCredit,
  deleteProjectCredit,
  moveProjectCredit,
  updateProjectCredit,
} from "@/lib/content/project-relations";
import { ProjectWriteError } from "@/lib/content/projects";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createPortfolioUpload, inspectPortfolioAsset, deletePortfolioAsset, type PortfolioAssetRole } from "@/lib/storage";

export type DetailState = {
  error?: string;
  ok?: boolean;
  warning?: string;
};

export type UploadTicket = {
  error?: string;
  uploadUrl?: string;
  key?: string;
  contentType?: string;
};

function failure(error: unknown, fallback: string): DetailState {
  if (error instanceof ProjectWriteError) return { error: error.message };
  return { error: fallback };
}

export async function prepareProjectUpload(
  projectId: string,
  role: PortfolioAssetRole,
  file: { type: string; size: number },
): Promise<UploadTicket> {
  await requireAdmin();
  if (!["cover", "hero", "gallery"].includes(role)) return { error: "That upload could not be started." };
  try {
    const ticket = await createPortfolioUpload({ projectId, role, type: file.type, size: file.size });
    if ("error" in ticket) return { error: ticket.error };
    return { uploadUrl: ticket.uploadUrl, key: ticket.key, contentType: file.type };
  } catch (error) {
    return failure(error, "Upload failed.");
  }
}

export async function confirmProjectUpload(projectId: string, role: PortfolioAssetRole, key: string): Promise<DetailState> {
  await requireAdmin();
  try {
    const asset = await inspectPortfolioAsset(projectId, key);
    if ("error" in asset) {
      await deletePortfolioAsset(key).catch(() => undefined);
      return { error: asset.error };
    }
    const saved =
      role === "gallery" ? await addProjectGalleryImage(projectId, asset) : await saveProjectAsset(projectId, role, asset);
    revalidateProjectContent([saved.slug]);
    return { ok: true, warning: "warning" in saved ? saved.warning ?? undefined : undefined };
  } catch (error) {
    return failure(error, "Upload failed.");
  }
}

export async function removeProjectImage(projectId: string, role: "cover" | "hero"): Promise<DetailState> {
  await requireAdmin();
  try {
    const saved = await clearProjectAsset(projectId, role);
    revalidateProjectContent([saved.slug]);
    return { ok: true, warning: saved.warning ?? undefined };
  } catch (error) {
    return failure(error, "The image could not be removed.");
  }
}

export async function saveGalleryText(_state: DetailState, formData: FormData): Promise<DetailState> {
  await requireAdmin();
  const altText = String(formData.get("altText") ?? "").trim();
  const caption = String(formData.get("caption") ?? "").trim();
  if (altText.length > 300 || caption.length > 300) return { error: "Keep alt text and captions under 300 characters." };
  try {
    const saved = await updateProjectGalleryText(String(formData.get("imageId") ?? ""), altText, caption || null);
    revalidateProjectContent([saved.slug]);
    return { ok: true };
  } catch (error) {
    return failure(error, "Save failed.");
  }
}

export async function reorderGalleryImage(imageId: string, direction: "up" | "down"): Promise<DetailState> {
  await requireAdmin();
  try {
    const saved = await moveProjectGalleryImage(imageId, direction);
    revalidateProjectContent([saved.slug]);
    return { ok: true };
  } catch (error) {
    return failure(error, "The gallery could not be reordered.");
  }
}

export async function removeGalleryImage(_state: DetailState, formData: FormData): Promise<DetailState> {
  await requireAdmin();
  if (formData.get("confirm") !== "delete") return { error: "Confirm before removing an image." };
  try {
    const saved = await deleteProjectGalleryImage(String(formData.get("imageId") ?? ""));
    revalidateProjectContent([saved.slug]);
    return { ok: true, warning: saved.warning ?? undefined };
  } catch (error) {
    return failure(error, "The image could not be removed.");
  }
}

export async function saveCredit(_state: DetailState, formData: FormData): Promise<DetailState> {
  await requireAdmin();
  const label = String(formData.get("label") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  if (!label || !value) return { error: "A credit needs a label and a value." };
  if (label.length > 80 || value.length > 160) return { error: "That credit is too long." };
  try {
    const creditId = String(formData.get("creditId") ?? "");
    const slug = creditId
      ? await updateProjectCredit(creditId, label, value)
      : await addProjectCredit(String(formData.get("projectId") ?? ""), label, value);
    revalidateProjectContent([slug]);
    return { ok: true };
  } catch (error) {
    return failure(error, "Save failed.");
  }
}

export async function reorderCredit(creditId: string, direction: "up" | "down"): Promise<DetailState> {
  await requireAdmin();
  try {
    const slug = await moveProjectCredit(creditId, direction);
    revalidateProjectContent([slug]);
    return { ok: true };
  } catch (error) {
    return failure(error, "The credits could not be reordered.");
  }
}

export async function removeCredit(_state: DetailState, formData: FormData): Promise<DetailState> {
  await requireAdmin();
  if (formData.get("confirm") !== "delete") return { error: "Confirm before removing a credit." };
  try {
    const slug = await deleteProjectCredit(String(formData.get("creditId") ?? ""));
    revalidateProjectContent([slug]);
    return { ok: true };
  } catch (error) {
    return failure(error, "The credit could not be removed.");
  }
}
