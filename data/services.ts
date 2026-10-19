import { aboutProfile } from "@/data/about";
import { projectCta } from "@/data/project-cta";

export const servicesMeta = {
  title: "Services | Edrisa",
  description:
    "Graphic design, branding, web development and app development from Kasibante Edrisa, multidisciplinary designer and software developer.",
} as const;

export const servicesCopy = {
  title: "Things I'm",
  titleLine: "Suspiciously Good At",
  offersHeading: aboutProfile.disciplinesHeading,
  capabilitiesHeading: "What the work covers",
  placesHeading: "Where the work has been",
  talkLabel: projectCta.label,
  ctaHeading: projectCta.heading,
  ctaBody: "Bring the idea. I'll bring the unreasonable attention to detail.",
  ctaLabel: projectCta.label,
} as const;

export const serviceOffers = [
  {
    title: "Graphic Design",
    summary: "Visual communication with a point of view, including logos, vector graphics, image work and campaign design.",
    icon: "gem" as const,
    surface: "about" as const,
  },
  {
    title: "Branding",
    summary: "Identities and campaigns built to be recognized, including brand management and visual direction.",
    icon: "zap" as const,
    surface: "services" as const,
  },
  {
    title: "Web Development",
    summary: "Websites that carry the work, not just the look, including front end development with HTML, CSS, JavaScript and React.",
    icon: "layers" as const,
    surface: "portfolio" as const,
  },
  {
    title: "App Development",
    summary: "Digital products shaped with the same care, including UI · UX, research, wireframes and prototypes.",
    icon: "layers" as const,
    surface: "contact" as const,
  },
] as const;

export type ServiceIconName = (typeof serviceOffers)[number]["icon"];

export const capabilityPackages = [
  {
    name: "Graphic Design",
    items: ["Graphic Design", "Visual Communication", "Campaign Design"],
  },
  {
    name: "Branding",
    items: ["Branding", "Creative Direction", "Brand management"],
  },
  {
    name: "Web Development",
    items: ["Web Development", "Front end development", "Next.js", "React"],
  },
  {
    name: "App Development",
    items: ["App Development", "UI · UX", "Wireframes and prototypes"],
  },
] as const;
