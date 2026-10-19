export const site = {
  name: "Edrisa Studio",
  title: "Kasibante Edrisa · Edrisa Studio",
  description:
    "Kasibante Edrisa is a multidisciplinary designer and software developer. Graphic design, branding, web development and digital products from Edrisa Studio.",
  url: "https://edrisastudio.com",
  portraitSrc: "/images/edrisa-portrait.jpg",
  portraitWidth: 3333,
  portraitHeight: 4167,
  logoSrc: "/images/edrisa-logo.png",
  logoWidth: 1490,
  logoHeight: 369,
  footerNote: "Built with pixels, patience, and unnecessary attention to spacing.",
} as const;

/**
 * WhatsApp uses https://wa.me/<digits>: country code and number only, no plus sign or spaces.
 */
export const socialLinks = {
  behance: "https://www.behance.net/kasibanteedrisa1",
  linkedin: "https://www.linkedin.com/in/kasibante-edrisa-81aa91281/",
  whatsapp: "https://wa.me/256759395908",
} as const;

export const socialProfiles = [
  {
    id: "behance",
    label: "Behance",
    href: socialLinks.behance,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: socialLinks.linkedin,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    href: socialLinks.whatsapp,
    iconLabel: "Chat with Edrisa on WhatsApp",
  },
] as const;
