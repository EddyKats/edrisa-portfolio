"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  addHomeMedia,
  deleteHomeMedia,
  moveHomeMedia,
  saveHomeLabels,
  saveHomeMediaItem,
  saveHomeSurfaceMode,
} from "@/lib/content/home";
import { isHomeSurface, isHomeMediaMode } from "@/lib/content/home-surfaces";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { withContentAsset } from "@/lib/content/media";
import { failure, text, type StudioState } from "@/lib/studio/form";

const paths = ["/", "/about"];

export async function saveHome(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  try {
    await saveHomeLabels({
      aboutTileLabel: text(formData, "aboutTileLabel"),
      servicesTileLabel: text(formData, "servicesTileLabel"),
      contactTileLabel: text(formData, "contactTileLabel"),
      portfolioTileLabel: text(formData, "portfolioTileLabel"),
    });
    revalidatePublicContent(["/"]);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function saveHomeMode(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  try {
    const surface = text(formData, "surface");
    const mode = text(formData, "mode");
    if (!isHomeSurface(surface) || !isHomeMediaMode(mode)) return { error: "Choose a display for that section." };
    await saveHomeSurfaceMode(surface, mode);
    revalidatePublicContent(paths);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function confirmAddHomeMedia(surface: string, ownerId: string, key: string): Promise<StudioState> {
  await requireAdmin();
  try {
    // Checked before the upload is claimed, so a bad surface never strands an object.
    if (!isHomeSurface(surface)) return { error: "Choose a homepage section." };
    const result = await withContentAsset("home-media", ownerId, key, (asset) =>
      addHomeMedia({ surface, url: asset.publicUrl, mimeType: asset.mimeType }),
    );
    if ("error" in result) return { error: result.error };
    revalidatePublicContent(paths);
    return { ok: true };
  } catch (error) {
    return failure(error, "Upload failed.");
  }
}

export async function confirmHomeMediaItem(id: string, key: string): Promise<StudioState> {
  await requireAdmin();
  try {
    const result = await withContentAsset("home-media", id, key, (asset) =>
      saveHomeMediaItem(id, asset.publicUrl, asset.mimeType),
    );
    if ("error" in result) return { error: result.error };
    revalidatePublicContent(paths);
    return { ok: true, warning: result.value.warning ?? undefined };
  } catch (error) {
    return failure(error, "Upload failed.");
  }
}

export async function removeHomePicture(id: string): Promise<StudioState> {
  await requireAdmin();
  try {
    const result = await deleteHomeMedia(id);
    revalidatePublicContent(paths);
    return { ok: true, warning: result.warning ?? undefined };
  } catch (error) {
    return failure(error);
  }
}

export async function reorderHomePicture(id: string, direction: "up" | "down"): Promise<StudioState> {
  await requireAdmin();
  try {
    await moveHomeMedia(id, direction);
    revalidatePublicContent(paths);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
