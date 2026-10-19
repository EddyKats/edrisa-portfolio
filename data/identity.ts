import { aboutProfile } from "@/data/about";
import { socialLinks } from "@/data/site";

export const canonicalSiteUrl = "https://edrisastudio.com";

export const studioBrand = {
  name: "Edrisa Studio",
  legalName: "Edrisa Studio",
} as const;

export const personIdentity = {
  name: aboutProfile.name,
  alternateName: [aboutProfile.alternateName, "Kasibante"] as const,
  jobTitle: aboutProfile.title,
  description: aboutProfile.bio[0],
} as const;

export const knownProfiles = {
  behance: socialLinks.behance,
  linkedin: socialLinks.linkedin,
} as const;

export function isStalePublicHost(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "edrisa.studio";
  } catch {
    return true;
  }
}
