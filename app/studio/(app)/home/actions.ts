"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  addHomePortrait,
  deleteHomePortrait,
  moveHomePortrait,
  saveHomeLabels,
  saveHomePortrait,
  saveHomePortraitItem,
  saveHomePortraitMode,
} from "@/lib/content/home";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { failure, text, type StudioState } from "@/lib/studio/form";
import { verifiedContentAsset } from "../media-actions";

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
    const mode = text(formData, "portraitMode");
    if (mode !== "single" && mode !== "sequence") return { error: "Choose a portrait display." };
    await saveHomePortraitMode(mode);
    revalidatePublicContent(paths);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function confirmHomePortrait(key: string): Promise<StudioState> {
  await requireAdmin();
  try {
    const asset = await verifiedContentAsset("home-portrait", "home", key);
    const result = await saveHomePortrait(asset.publicUrl);
    revalidatePublicContent(paths);
    return { ok: true, warning: result.warning ?? undefined };
  } catch (error) {
    return failure(error, "Upload failed.");
  }
}

export async function confirmAddHomePortrait(ownerId: string, key: string): Promise<StudioState> {
  await requireAdmin();
  try {
    const asset = await verifiedContentAsset("home-portrait", ownerId, key);
    await addHomePortrait(asset.publicUrl);
    revalidatePublicContent(paths);
    return { ok: true };
  } catch (error) {
    return failure(error, "Upload failed.");
  }
}

export async function confirmHomeGalleryPortrait(id: string, key: string): Promise<StudioState> {
  await requireAdmin();
  try {
    const asset = await verifiedContentAsset("home-portrait", id, key);
    const result = await saveHomePortraitItem(id, asset.publicUrl);
    revalidatePublicContent(paths);
    return { ok: true, warning: result.warning ?? undefined };
  } catch (error) {
    return failure(error, "Upload failed.");
  }
}

export async function removeHomePicture(id: string): Promise<StudioState> {
  await requireAdmin();
  try {
    const result = await deleteHomePortrait(id);
    revalidatePublicContent(paths);
    return { ok: true, warning: result.warning ?? undefined };
  } catch (error) {
    return failure(error);
  }
}

export async function reorderHomePicture(id: string, direction: "up" | "down"): Promise<StudioState> {
  await requireAdmin();
  try {
    await moveHomePortrait(id, direction);
    revalidatePublicContent(paths);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
