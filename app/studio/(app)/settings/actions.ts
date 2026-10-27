"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { saveCta } from "@/lib/content/cta";
import { saveSiteLogo, saveSiteSettings } from "@/lib/content/site";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { withContentAsset } from "@/lib/content/media";
import { emptyToNull, failure, text, type StudioState } from "@/lib/studio/form";

const paths = ["/", "/about", "/services", "/contact", "/portfolio"];

export async function saveSettings(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  try {
    await saveSiteSettings({
      siteName: text(formData, "siteName"),
      siteUrl: text(formData, "siteUrl"),
      behanceUrl: text(formData, "behanceUrl"),
      linkedinUrl: text(formData, "linkedinUrl"),
      whatsappUrl: text(formData, "whatsappUrl"),
      contactEmail: emptyToNull(text(formData, "contactEmail")),
      contactPhone: emptyToNull(text(formData, "contactPhone")),
      location: null,
      footerText: emptyToNull(text(formData, "footerText")),
      footerSecondaryText: emptyToNull(text(formData, "footerSecondaryText")),
      defaultSeoTitle: emptyToNull(text(formData, "defaultSeoTitle")),
      defaultSeoDescription: emptyToNull(text(formData, "defaultSeoDescription")),
    });
    revalidatePublicContent(paths);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}

export async function confirmSiteLogo(key: string): Promise<StudioState> {
  await requireAdmin();
  try {
    const result = await withContentAsset("home-logo", "home", key, (asset) => saveSiteLogo(asset.publicUrl));
    if ("error" in result) return { error: result.error };
    revalidatePublicContent(paths);
    return { ok: true, warning: result.value.warning ?? undefined };
  } catch (error) {
    return failure(error, "Upload failed.");
  }
}

export async function savePortfolioCta(_state: StudioState, formData: FormData): Promise<StudioState> {
  await requireAdmin();
  try {
    await saveCta({
      key: "portfolio",
      heading: text(formData, "heading"),
      body: text(formData, "body"),
      buttonLabel: text(formData, "buttonLabel"),
      buttonHref: text(formData, "buttonHref"),
    });
    revalidatePublicContent(["/portfolio"]);
    return { ok: true };
  } catch (error) {
    return failure(error);
  }
}
