"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  clearGalleryImage,
  deleteGalleryPhoto,
  moveGalleryPhoto,
  saveGalleryImage,
  saveGalleryPhoto,
} from "@/lib/content/gallery";
import { withContentAsset } from "@/lib/content/media";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { emptyToNull, failure, isPublished, text, type StudioState } from "@/lib/studio/form";

function saved(warning?: string | null): StudioState {
  revalidatePublicContent(["/gallery"]);
  return { ok: true, warning: warning ?? undefined };
}

export async function saveGalleryRecord(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  try {
    const id = text(formData, "id");
    await saveGalleryPhoto({
      id: id || undefined,
      title: text(formData, "title"),
      altText: text(formData, "altText"),
      caption: emptyToNull(text(formData, "caption")),
      category: emptyToNull(text(formData, "category")),
      published: isPublished(formData),
    });
    return saved();
  } catch (error) {
    return failure(error);
  }
}

export async function removeGalleryPhoto(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  if (text(formData, "confirm") !== "delete") return { error: "Type delete to confirm." };
  try {
    const result = await deleteGalleryPhoto(text(formData, "id"));
    return saved(result.warning);
  } catch (error) {
    return failure(error, "The photograph could not be removed.");
  }
}

export async function reorderGalleryPhoto(id: string, direction: "up" | "down"): Promise<StudioState> {
  await requireAdmin();
  try {
    await moveGalleryPhoto(id, direction);
    return saved();
  } catch (error) {
    return failure(error);
  }
}

export async function confirmGalleryImage(id: string, key: string): Promise<StudioState> {
  await requireAdmin();
  try {
    const result = await withContentAsset("gallery", id, key, (asset) => saveGalleryImage(id, asset));
    if ("error" in result) return { error: result.error };
    return saved(result.value.warning);
  } catch (error) {
    return failure(error, "Upload failed.");
  }
}

export async function removeGalleryImage(id: string): Promise<StudioState> {
  await requireAdmin();
  try {
    const result = await clearGalleryImage(id);
    return saved(result.warning);
  } catch (error) {
    return failure(error, "The photograph could not be removed.");
  }
}
