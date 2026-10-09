export const navigation = [
  {
    id: "about",
    title: "About",
    href: "/about",
    icon: "gem",
    transitionName: "section-about",
    summary: "About edrisa, creative director and brand designer.",
    surfaceClass:
      "bg-[linear-gradient(128deg,#6325E8_0%,#4d3eec_22%,#3566f2_46%,#2889ED_68%,#20D1C0_100%)]",
  },
  {
    id: "services",
    title: "Services",
    href: "/services",
    icon: "zap",
    transitionName: "section-services",
    summary: "Services and creative expertise from edrisa.",
    surfaceClass:
      "bg-[linear-gradient(150deg,#E4247B_0%,#EF315C_32%,#F8444B_64%,#FF633E_100%)]",
  },
  {
    id: "contact",
    title: "Contact",
    href: "/contact",
    icon: "pin",
    transitionName: "section-contact",
    summary: "Contact edrisa.",
    surfaceClass:
      "bg-[linear-gradient(165deg,#FFF200_0%,#FFD51C_18%,#FFAE16_42%,#FF8E12_66%,#F25C0A_100%)]",
  },
  {
    id: "portfolio",
    title: "Portfolio",
    href: "/portfolio",
    icon: "trophy",
    transitionName: "section-portfolio",
    summary: "Selected work by edrisa.",
    surfaceClass:
      "bg-[linear-gradient(112deg,#5446DF_0%,#6A3AE6_28%,#8A3AE9_54%,#A23DEB_78%,#B52EE5_100%)]",
  },
] as const;

export type NavItem = (typeof navigation)[number];
export type NavIconName = NavItem["icon"];
export type NavId = NavItem["id"];

export function isNavId(value: string): value is NavId {
  return navigation.some((item) => item.id === value);
}

export function getNavItem(id: NavId): NavItem {
  const item = navigation.find((entry) => entry.id === id);
  if (!item) {
    throw new Error(`Unknown navigation item: ${id}`);
  }
  return item;
}
