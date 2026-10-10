"use server";

import { requireAdmin } from "@/lib/auth/require-admin";
import { saveCta } from "@/lib/content/cta";
import { saveSiteLogo, saveSiteSettings } from "@/lib/content/site";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { emptyToNull, failure, text, type StudioState } from "@/lib/studio/form";
import { verifiedContentAsset } from "../media-actions";

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
      location: emptyToNull(text(formData, "location")),
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
    const asset = await verifiedContentAsset("home-logo", "home", key);
    const result = await saveSiteLogo(asset.publicUrl);
    revalidatePublicContent(paths);
    return { ok: true, warning: result.warning ?? undefined };
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
