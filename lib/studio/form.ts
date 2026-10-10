import { ZodError } from "zod";
import { ContentWriteError } from "@/lib/content/errors";

export type StudioState = {
  error?: string;
  ok?: boolean;
  warning?: string;
};

export function failure(error: unknown, fallback = "Save failed."): StudioState {
  if (error instanceof ContentWriteError) return { error: error.message };
  if (error instanceof ZodError) return { error: error.issues[0]?.message ?? fallback };
  if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
    return { error: "That value is already used." };
  }
  return { error: fallback };
}

export function text(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

export function emptyToNull(value: string) {
  return value.length > 0 ? value : null;
}

export function isPublished(formData: FormData) {
  return formData.get("published") === "on";
}
