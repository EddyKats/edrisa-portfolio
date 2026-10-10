"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { saveHomeLabels, saveHomePortrait } from "@/lib/content/home";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { failure, text, type StudioState } from "@/lib/studio/form";
import { verifiedContentAsset } from "../media-actions";

const paths = ["/", "/portfolio"];

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
