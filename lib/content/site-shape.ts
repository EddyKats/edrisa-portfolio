export type PublicSocial = {
  id: "behance" | "linkedin" | "whatsapp";
  label: string;
  href: string;
  iconLabel?: string;
};

export type PublicSite = {
  name: string;
  title: string;
  description: string;
  url: string;
  portraitSrc: string;
  portraits: string[];
  portraitMode: "single" | "sequence";
  portraitWidth: number;
  portraitHeight: number;
  logoSrc: string;
  logoWidth: number;
  logoHeight: number;
  footerNote: string;
  footerSecondary: string | null;
  socials: PublicSocial[];
  callHref: string | null;
};
