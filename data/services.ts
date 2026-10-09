export const servicesMeta = {
  title: "Services | Edrisa",
  description:
    "Brand identity, creative and advertising, and digital experiences from Edrisa.",
} as const;

export const servicesCopy = {
  title: "Things I'm Suspiciously Good At",
  capabilitiesHeading: "Pick Your Problem",
  capabilitiesNote: "No prices here. These are the kinds of problems, not a menu with invented numbers.",
  clientsHeading: "Some Logos I've Stared At For Too Long",
  clientsNote: "The frames stay empty until the actual logo files are added.",
  talkLabel: "Talk About It",
  ctaHeading: "Need something less ordinary?",
  ctaBody: "If the brief is specific, so is the work.",
  ctaLabel: "Start a Project",
} as const;

export const serviceOffers = [
  {
    title: "Brand Identity",
    summary: "Making businesses look like they know exactly what they're doing.",
    icon: "gem",
    surface: "about",
  },
  {
    title: "Creative & Advertising",
    summary: 'The part where "make it pop" gets translated into actual design.',
    icon: "zap",
    surface: "services",
  },
  {
    title: "Digital Experiences",
    summary: "Websites, products and interfaces that behave as good as they look.",
    icon: "layers",
    surface: "portfolio",
  },
] as const;

export type ServiceIconName = (typeof serviceOffers)[number]["icon"];

export const capabilityPackages = [
  {
    name: "Brand",
    items: ["Brand strategy", "Identity systems", "Logo design", "Guidelines"],
  },
  {
    name: "Campaign",
    items: ["Advertising concepts", "Social campaigns", "Print", "Outdoor", "Creative direction"],
  },
  {
    name: "Digital",
    items: ["Web design", "UI/UX", "Product design", "Design systems"],
  },
] as const;

/**
 * Drop logo files in public/images/clients/, then set src.
 * Example: src: "/images/clients/client-01.svg"
 * Do not download logos from the web.
 */
export const clientSlots = [
  { id: "client-01", src: null as string | null, alt: "Client logo" },
  { id: "client-02", src: null as string | null, alt: "Client logo" },
  { id: "client-03", src: null as string | null, alt: "Client logo" },
  { id: "client-04", src: null as string | null, alt: "Client logo" },
  { id: "client-05", src: null as string | null, alt: "Client logo" },
  { id: "client-06", src: null as string | null, alt: "Client logo" },
] as const;
