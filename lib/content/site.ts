import "server-only";

import { isStalePublicHost } from "@/data/identity";
import { site, socialLinks, socialProfiles } from "@/data/site";
import { getDb } from "@/lib/db";
import { ContentWriteError } from "@/lib/content/errors";
import { framesFor } from "@/lib/content/home";
import { removeStoredFile } from "@/lib/content/media";
import { resolveCallHref } from "@/lib/content/phone";
import type { HomeSectionMedia, PublicSite } from "@/lib/content/site-shape";
import { httpsUrlSchema, optionalText, whatsappUrlSchema } from "@/lib/studio/urls";

export async function getPublicSite(): Promise<PublicSite> {
  const db = getDb();
  const [settings, home, contact] = await Promise.all([
    db.siteSettings.findUnique({ where: { id: "site" } }),
    db.homeContent.findUnique({
      where: { id: "home" },
      include: { portraits: { where: { published: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
    }),
    db.contactContent.findUnique({ where: { id: "contact" }, select: { phone: true } }),
  ]);

  // Static copy is used only when the site singleton row is missing. Database errors are not caught here.
  if (!settings) {
    return {
      name: site.name,
      title: site.title,
      description: site.description,
      url: site.url,
      portraitSrc: site.portraitSrc,
      portraits: [site.portraitSrc],
      portraitMode: "single",
      hero: { mode: "single", frames: [{ src: site.portraitSrc, kind: "IMAGE" }] },
      tiles: {
        about: { mode: "single", frames: [] },
        services: { mode: "single", frames: [] },
        contact: { mode: "single", frames: [] },
        portfolio: { mode: "single", frames: [] },
      },
      portraitWidth: site.portraitWidth,
      portraitHeight: site.portraitHeight,
      logoSrc: site.logoSrc,
      logoWidth: site.logoWidth,
      logoHeight: site.logoHeight,
      footerNote: site.footerNote,
      footerSecondary: null,
      socials: socialProfiles.map((item) => ({ ...item })),
      callHref: resolveCallHref([contact?.phone], socialLinks.whatsapp),
    };
  }

  const grouped = {
    hero: home?.portraits.filter((item) => item.surface === "hero") ?? [],
    about: home?.portraits.filter((item) => item.surface === "about") ?? [],
    services: home?.portraits.filter((item) => item.surface === "services") ?? [],
    contact: home?.portraits.filter((item) => item.surface === "contact") ?? [],
    portfolio: home?.portraits.filter((item) => item.surface === "portfolio") ?? [],
  };
  const hero: HomeSectionMedia = {
    mode: home?.portraitMode === "sequence" ? "sequence" : "single",
    frames: framesFor(grouped.hero, home?.portraitMode ?? "single"),
  };
  if (hero.frames.length === 0 && (home?.portraitUrl || settings.homepagePortraitUrl || site.portraitSrc)) {
    hero.frames = [{ src: home?.portraitUrl || settings.homepagePortraitUrl || site.portraitSrc, kind: "IMAGE" }];
  }
  const tiles = {
    about: sectionMedia(home?.aboutMode, grouped.about),
    services: sectionMedia(home?.servicesMode, grouped.services),
    contact: sectionMedia(home?.contactMode, grouped.contact),
    portfolio: sectionMedia(home?.portfolioMode, grouped.portfolio),
  };
  const portraitSrc =
    hero.frames.find((frame) => frame.kind !== "VIDEO")?.src || home?.portraitUrl || settings.homepagePortraitUrl || site.portraitSrc;
  const logoSrc = home?.logoUrl || settings.logoUrl || site.logoSrc;
  const portraitMode = hero.mode === "sequence" && hero.frames.length > 1 ? "sequence" : "single";

  const staleHost = isStalePublicHost(settings.siteUrl);
  const publicUrl = (staleHost ? site.url : settings.siteUrl).replace(/\/$/, "");
  return {
    name: staleHost ? site.name : settings.siteName,
    title: staleHost ? site.title : settings.defaultSeoTitle || site.title,
    description: staleHost ? site.description : settings.defaultSeoDescription || site.description,
    url: publicUrl,
    portraitSrc,
    portraits: hero.frames.map((frame) => frame.src),
    portraitMode,
    hero,
    tiles,
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
    callHref: resolveCallHref([contact?.phone, settings.contactPhone], settings.whatsappUrl),
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

function sectionMedia(mode: string | undefined, items: { imageUrl: string; kind: string; published: boolean }[]): HomeSectionMedia {
  const display = mode === "sequence" ? "sequence" : "single";
  return { mode: display, frames: framesFor(items, display) };
}
