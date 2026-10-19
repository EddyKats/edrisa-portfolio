import type { HomeFrame, HomeMediaMode } from "@/lib/content/home-surfaces";

export type PublicSocial = {
  id: "behance" | "linkedin" | "whatsapp";
  label: string;
  href: string;
  iconLabel?: string;
};

export type HomeSectionMedia = {
  mode: HomeMediaMode;
  frames: HomeFrame[];
};

export type PublicSite = {
  name: string;
  title: string;
  description: string;
  url: string;
  portraitSrc: string;
  portraits: string[];
  portraitMode: HomeMediaMode;
  hero: HomeSectionMedia;
  tiles: {
    about: HomeSectionMedia;
    services: HomeSectionMedia;
    contact: HomeSectionMedia;
    portfolio: HomeSectionMedia;
  };
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
