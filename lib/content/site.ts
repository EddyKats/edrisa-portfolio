import "server-only";

import { site, socialProfiles } from "@/data/site";
import { getDb } from "@/lib/db";
import { ContentWriteError } from "@/lib/content/errors";
import { removeStoredFile } from "@/lib/content/media";
import type { PublicSite } from "@/lib/content/site-shape";
import { httpsUrlSchema, optionalText, whatsappUrlSchema } from "@/lib/studio/urls";

export async function getPublicSite(): Promise<PublicSite> {
  const db = getDb();
  const [settings, home] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "site" } }),
    db.homeContent.findUnique({ where: { id: "home" } }),
  ]);

  // Static copy is used only when the site singleton row is missing. Database errors are not caught here.
  if (!settings) {
    return {
      name: site.name,
      title: site.title,
      description: site.description,
      url: site.url,
      portraitSrc: site.portraitSrc,
      portraitWidth: site.portraitWidth,
      portraitHeight: site.portraitHeight,
      logoSrc: site.logoSrc,
      logoWidth: site.logoWidth,
      logoHeight: site.logoHeight,
      footerNote: site.footerNote,
      footerSecondary: null,
      socials: socialProfiles.map((item) => ({ ...item })),
    };
  }

  const portraitSrc = home?.portraitUrl || settings.homepagePortraitUrl || site.portraitSrc;
  const logoSrc = home?.logoUrl || settings.logoUrl || site.logoSrc;

  return {
    name: settings.siteName,
    title: settings.defaultSeoTitle || site.title,
    description: settings.defaultSeoDescription || site.description,
    url: settings.siteUrl,
    portraitSrc,
    portraitWidth: site.portraitWidth,
    portraitHeight: site.portraitHeight,
    logoSrc,
    logoWidth: site.logoWidth,
    logoHeight: site.logoHeight,
    footerNote: settings.footerText || site.footerNote,
    footerSecondary: settings.footerSecondaryText,
    socials: [
      { id: "behance", label: "Behance", href: settings.behanceUrl },
      { id: "linkedin", label: "LinkedIn", href: settings.linkedinUrl },
      {
        id: "whatsapp",
        label: "WhatsApp",
        href: settings.whatsappUrl,
        iconLabel: "Chat with Edrisa on WhatsApp",
      },
    ],
  };
}

export async function getStudioSettings() {
  const row = await getDb().siteSettings.findUnique({ where: { id: "site" } });
  if (!row) throw new ContentWriteError("Site settings have not been seeded.");
  return row;
}

export async function saveSiteSettings(input: {
  siteName: string;
  siteUrl: string;
  behanceUrl: string;
  linkedinUrl: string;
  whatsappUrl: string;
  contactEmail: string | null;
  contactPhone: string | null;
  location: string | null;
  footerText: string | null;
  footerSecondaryText: string | null;
  defaultSeoTitle: string | null;
  defaultSeoDescription: string | null;
}) {
  const siteUrl = httpsUrlSchema.parse(input.siteUrl);
  const behanceUrl = httpsUrlSchema.parse(input.behanceUrl);
  const linkedinUrl = httpsUrlSchema.parse(input.linkedinUrl);
  const whatsappUrl = whatsappUrlSchema.parse(input.whatsappUrl);
  if (!input.siteName.trim()) throw new ContentWriteError("Add a site name.");

  await getDb().siteSettings.update({
    where: { id: "site" },
    data: {
      siteName: input.siteName.trim(),
      siteUrl,
      behanceUrl,
      linkedinUrl,
      whatsappUrl,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      location: input.location,
      footerText: input.footerText,
      footerSecondaryText: input.footerSecondaryText,
      defaultSeoTitle: input.defaultSeoTitle,
      defaultSeoDescription: input.defaultSeoDescription,
    },
  });
}

export async function saveSiteLogo(url: string) {
  const db = getDb();
  const current = await db.siteSettings.findUnique({ where: { id: "site" }, select: { logoUrl: true } });
  await db.$transaction([
    db.siteSettings.update({ where: { id: "site" }, data: { logoUrl: url } }),
    db.homeContent.update({ where: { id: "home" }, data: { logoUrl: url } }),
  ]);
  const warning = current?.logoUrl && current.logoUrl !== url ? await removeStoredFile(current.logoUrl) : null;
  return { warning };
}

export function blankToNull(value: string) {
  return optionalText.parse(value);
}
