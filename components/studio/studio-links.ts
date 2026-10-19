import {
  FolderKanban,
  House,
  LayoutDashboard,
  Mail,
  Settings,
  Sparkles,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

export type StudioLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const studioOverviewLinks: StudioLink[] = [
  { href: "/studio", label: "Dashboard", icon: LayoutDashboard },
  { href: "/studio/projects", label: "Projects", icon: FolderKanban },
  { href: "/studio/home", label: "Home", icon: House },
];

export const studioContentLinks: StudioLink[] = [
  { href: "/studio/about", label: "About", icon: User },
  { href: "/studio/services", label: "Services", icon: Sparkles },
  { href: "/studio/clients", label: "Clients", icon: Users },
  { href: "/studio/contact", label: "Contact", icon: Mail },
];

export const studioSettingLinks: StudioLink[] = [
  { href: "/studio/settings", label: "Settings", icon: Settings },
];

export const studioSearchLinks: StudioLink[] = [
  ...studioOverviewLinks,
  ...studioContentLinks,
  ...studioSettingLinks,
];

export const studioSiteLinks = [
  { href: "/about", label: "About", note: "Public page" },
  { href: "/services", label: "Services", note: "Public page" },
  { href: "/portfolio", label: "Portfolio", note: "Public page" },
  { href: "/contact", label: "Contact", note: "Public page" },
] as const;
