import { aboutCopy, aboutProfile } from "@/data/about";
import { projectCta } from "@/data/project-cta";
import { serviceOffers } from "@/data/services";

export const contactMeta = {
  title: "Contact | Edrisa",
  description:
    "Start a project with Kasibante Edrisa. Graphic design, branding, web development and app development.",
} as const;

export const contactCopy = {
  title: "Talk",
  titleLine: "To Me",
  arrived: "If you made it this far, we should probably talk.",
  subheading: aboutCopy.ctaBody,
  detailsHeading: "Reach me",
  formHeading: "Start a project",
  socialHeading: aboutProfile.contactHeading,
  sendLabel: projectCta.label,
  sendNote: "This opens your email app addressed to Kasibante.",
} as const;

export const contactDetails = {
  email: "kasibanteedrisa256@gmail.com",
  phone: "+256 759 395 908" as string | null,
} as const;

export const projectTypes = serviceOffers.map((offer) => offer.title);

export function splitContactTitle(pageTitle: string) {
  const words = pageTitle.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { title: contactCopy.title, titleLine: contactCopy.titleLine };
  if (words.length === 1) return { title: words[0]!, titleLine: contactCopy.titleLine };
  return { title: words[0]!, titleLine: words.slice(1).join(" ") };
}
