"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  clearAboutFeature,
  clearExperienceImage,
  deleteAboutStat,
  deleteExperience,
  moveAboutStat,
  moveExperience,
  parseDate,
  saveAboutContent,
  saveAboutFeature,
  saveAboutStat,
  saveExperience,
  saveExperienceImage,
} from "@/lib/content/about";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { emptyToNull, failure, isPublished, text, type StudioState } from "@/lib/studio/form";
import { verifiedContentAsset } from "../media-actions";

function saved(warning?: string | null): StudioState {
  revalidatePublicContent(["/about"]);
  return { ok: true, warning: warning ?? undefined };
}

export async function saveAbout(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  try {
    await saveAboutContent({
      pageTitle: text(formData, "pageTitle"),
      introHeading: text(formData, "introHeading"),
      introParagraph: text(formData, "introParagraph"),
      storyHeading: text(formData, "storyHeading"),
      storyBody: text(formData, "storyBody"),
      seoTitle: emptyToNull(text(formData, "seoTitle")),
      seoDescription: emptyToNull(text(formData, "seoDescription")),
      ctaHeading: text(formData, "ctaHeading"),
      ctaText: text(formData, "ctaText"),
      ctaButtonLabel: text(formData, "ctaButtonLabel"),
      ctaButtonHref: text(formData, "ctaButtonHref"),
    });
    return saved();
  } catch (error) {
    return failure(error);
  }
}

export async function confirmAboutFeature(key: string): Promise<StudioState> {
  await requireAdmin();
  try {
    const asset = await verifiedContentAsset("about-feature", "about", key);
    const result = await saveAboutFeature(asset.publicUrl);
    return saved(result.warning);
  } catch (error) {
    return failure(error, "Upload failed.");
  }
}

export async function removeAboutFeature(): Promise<StudioState> {
  await requireAdmin();
  try {
    const result = await clearAboutFeature();
    return saved(result.warning);
  } catch (error) {
    return failure(error, "The image could not be removed.");
  }
}

export async function saveStat(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  try {
    const id = text(formData, "id");
    await saveAboutStat({
      id: id || undefined,
      value: text(formData, "value"),
      label: text(formData, "label"),
      icon: text(formData, "icon"),
      published: isPublished(formData),
    });
    return saved();
  } catch (error) {
    return failure(error);
  }
}

export async function removeStat(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  if (text(formData, "confirm") !== "delete") return { error: "Type delete to confirm." };
  try {
    await deleteAboutStat(text(formData, "id"));
    return saved();
  } catch (error) {
    return failure(error, "The stat could not be removed.");
  }
}

export async function reorderStat(id: string, direction: "up" | "down"): Promise<StudioState> {
  await requireAdmin();
  try {
    await moveAboutStat(id, direction);
    return saved();
  } catch (error) {
    return failure(error);
  }
}

export async function saveExperienceRecord(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  try {
    const id = text(formData, "id");
    await saveExperience({
      id: id || undefined,
      company: text(formData, "company"),
      role: text(formData, "role"),
      microcopy: emptyToNull(text(formData, "microcopy")),
      startDate: parseDate(text(formData, "startDate")),
      endDate: parseDate(text(formData, "endDate")),
      published: isPublished(formData),
    });
    return saved();
  } catch (error) {
    return failure(error);
  }
}

export async function confirmExperienceImage(id: string, key: string): Promise<StudioState> {
  await requireAdmin();
  try {
    const asset = await verifiedContentAsset("experience", id, key);
    const result = await saveExperienceImage(id, asset.publicUrl);
    return saved(result.warning);
  } catch (error) {
    return failure(error, "Upload failed.");
  }
}

export async function removeExperienceImage(id: string): Promise<StudioState> {
  await requireAdmin();
  try {
    const result = await clearExperienceImage(id);
    return saved(result.warning);
  } catch (error) {
    return failure(error, "The image could not be removed.");
  }
}

export async function removeExperience(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  if (text(formData, "confirm") !== "delete") return { error: "Type delete to confirm." };
  try {
    const result = await deleteExperience(text(formData, "id"));
    return saved(result.warning);
  } catch (error) {
    return failure(error, "The experience could not be removed.");
  }
}

export async function reorderExperience(id: string, direction: "up" | "down"): Promise<StudioState> {
  await requireAdmin();
  try {
    await moveExperience(id, direction);
    return saved();
  } catch (error) {
    return failure(error);
  }
}
