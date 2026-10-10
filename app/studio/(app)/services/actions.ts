"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { saveCta } from "@/lib/content/cta";
import {
  deleteCapabilityItem,
  deletePackage,
  deleteService,
  moveCapabilityItem,
  movePackage,
  moveService,
  saveCapabilityItem,
  savePackage,
  saveService,
} from "@/lib/content/catalog";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { emptyToNull, failure, isPublished, text, type StudioState } from "@/lib/studio/form";

function saved(): StudioState {
  revalidatePublicContent(["/services"]);
  return { ok: true };
}

export async function saveServiceRecord(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  try {
    const id = text(formData, "id");
    await saveService({
      id: id || undefined,
      title: text(formData, "title"),
      slug: text(formData, "slug"),
      description: text(formData, "description"),
      icon: text(formData, "icon"),
      published: isPublished(formData),
    });
    return saved();
  } catch (error) {
    return failure(error);
  }
}

export async function removeService(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  if (text(formData, "confirm") !== "delete") return { error: "Type delete to confirm." };
  try {
    await deleteService(text(formData, "id"));
    return saved();
  } catch (error) {
    return failure(error, "The service could not be removed.");
  }
}

export async function reorderService(id: string, direction: "up" | "down"): Promise<StudioState> {
  await requireAdmin();
  try {
    await moveService(id, direction);
    return saved();
  } catch (error) {
    return failure(error);
  }
}

export async function savePackageRecord(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  try {
    const id = text(formData, "id");
    await savePackage({
      id: id || undefined,
      title: text(formData, "title"),
      description: emptyToNull(text(formData, "description")),
      buttonLabel: text(formData, "buttonLabel"),
      published: isPublished(formData),
    });
    return saved();
  } catch (error) {
    return failure(error);
  }
}

export async function removePackage(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  if (text(formData, "confirm") !== "delete") return { error: "Type delete to confirm." };
  try {
    await deletePackage(text(formData, "id"));
    return saved();
  } catch (error) {
    return failure(error, "The package could not be removed.");
  }
}

export async function reorderPackage(id: string, direction: "up" | "down"): Promise<StudioState> {
  await requireAdmin();
  try {
    await movePackage(id, direction);
    return saved();
  } catch (error) {
    return failure(error);
  }
}

export async function saveItem(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  try {
    const id = text(formData, "id");
    await saveCapabilityItem({
      id: id || undefined,
      packageId: text(formData, "packageId"),
      label: text(formData, "label"),
    });
    return saved();
  } catch (error) {
    return failure(error);
  }
}

export async function removeItem(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  if (text(formData, "confirm") !== "delete") return { error: "Type delete to confirm." };
  try {
    await deleteCapabilityItem(text(formData, "id"));
    return saved();
  } catch (error) {
    return failure(error, "The item could not be removed.");
  }
}

export async function reorderItem(id: string, direction: "up" | "down"): Promise<StudioState> {
  await requireAdmin();
  try {
    await moveCapabilityItem(id, direction);
    return saved();
  } catch (error) {
    return failure(error);
  }
}

export async function saveServicesCta(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  try {
    await saveCta({
      key: "services",
      heading: text(formData, "heading"),
      body: text(formData, "body"),
      buttonLabel: text(formData, "buttonLabel"),
      buttonHref: text(formData, "buttonHref"),
    });
    revalidatePublicContent(["/services"]);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
