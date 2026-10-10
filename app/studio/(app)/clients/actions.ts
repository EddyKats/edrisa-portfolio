"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { clearClientLogo, deleteClient, moveClient, saveClient, saveClientLogo } from "@/lib/content/catalog";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { emptyToNull, failure, isPublished, text, type StudioState } from "@/lib/studio/form";
import { verifiedContentAsset } from "../media-actions";

function saved(warning?: string | null): StudioState {
  revalidatePublicContent(["/services"]);
  return { ok: true, warning: warning ?? undefined };
}

export async function saveClientRecord(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  try {
    const id = text(formData, "id");
    await saveClient({
      id: id || undefined,
      name: text(formData, "name"),
      website: emptyToNull(text(formData, "website")),
      published: isPublished(formData),
    });
    return saved();
  } catch (error) {
    return failure(error);
  }
}

export async function removeClient(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  if (text(formData, "confirm") !== "delete") return { error: "Type delete to confirm." };
  try {
    const result = await deleteClient(text(formData, "id"));
    return saved(result.warning);
  } catch (error) {
    return failure(error, "The client could not be removed.");
  }
}

export async function reorderClient(id: string, direction: "up" | "down"): Promise<StudioState> {
  await requireAdmin();
  try {
    await moveClient(id, direction);
    return saved();
  } catch (error) {
    return failure(error);
  }
}

export async function confirmClientLogo(id: string, key: string): Promise<StudioState> {
  await requireAdmin();
  try {
    const asset = await verifiedContentAsset("client", id, key);
    const result = await saveClientLogo(id, asset.publicUrl);
    return saved(result.warning);
  } catch (error) {
    return failure(error, "Upload failed.");
  }
}

export async function removeClientLogo(id: string): Promise<StudioState> {
  await requireAdmin();
  try {
    const result = await clearClientLogo(id);
    return saved(result.warning);
  } catch (error) {
    return failure(error, "The logo could not be removed.");
  }
}
