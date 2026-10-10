"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { saveContactContent } from "@/lib/content/contact";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { emptyToNull, failure, text, type StudioState } from "@/lib/studio/form";

export async function saveContact(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  try {
    await saveContactContent({
      pageTitle: text(formData, "pageTitle"),
      subtitle: emptyToNull(text(formData, "subtitle")),
      location: emptyToNull(text(formData, "location")),
      email: emptyToNull(text(formData, "email")),
      phone: emptyToNull(text(formData, "phone")),
      formHeading: emptyToNull(text(formData, "formHeading")),
      socialHeading: emptyToNull(text(formData, "socialHeading")),
      seoTitle: emptyToNull(text(formData, "seoTitle")),
      seoDescription: emptyToNull(text(formData, "seoDescription")),
    });
    revalidatePublicContent(["/contact"]);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
