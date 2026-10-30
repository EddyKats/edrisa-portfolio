export const navigation = [
  {
    id: "about",
    title: "About",
    homeLabel: "About Edrisa",
    href: "/about",
    icon: "gem",
    transitionName: "section-about",
    summary: "About Kasibante Edrisa, multidisciplinary designer and software developer.",
    surfaceClass:
      "bg-[linear-gradient(128deg,#6325E8_0%,#4d3eec_22%,#3566f2_46%,#2889ED_68%,#20D1C0_100%)]",
  },
  {
    id: "services",
    title: "Services",
    homeLabel: "What I Do",
    href: "/services",
    icon: "zap",
    transitionName: "section-services",
    summary: "Graphic design, branding, web development and app development from Kasibante Edrisa.",
    surfaceClass:
      "bg-[linear-gradient(150deg,#E4247B_0%,#EF315C_32%,#F8444B_64%,#FF633E_100%)]",
  },
  {
    id: "contact",
    title: "Contact",
    homeLabel: "Talk To Me",
    href: "/contact",
    icon: "pin",
    transitionName: "section-contact",
    summary: "Start a project with Kasibante Edrisa.",
    surfaceClass:
      "bg-[linear-gradient(165deg,#FFF200_0%,#FFD51C_18%,#FFAE16_42%,#FF8E12_66%,#F25C0A_100%)]",
  },
  {
    id: "portfolio",
    title: "Portfolio",
    homeLabel: "Selected Works",
    href: "/portfolio",
    icon: "trophy",
    transitionName: "section-portfolio",
    summary: "Selected work by Kasibante Edrisa of Edrisa Studio.",
    surfaceClass:
      "bg-[linear-gradient(112deg,#5446DF_0%,#6A3AE6_28%,#8A3AE9_54%,#A23DEB_78%,#B52EE5_100%)]",
  },
  {
    id: "gallery",
    title: "Gallery",
    homeLabel: "Gallery",
    href: "/gallery",
    icon: "camera",
    transitionName: "section-gallery",
    summary: "Photographs by Kasibante Edrisa of Edrisa Studio.",
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

export function getSectionNeighbors(id: NavId) {
  if (id === "gallery") {
    const current = getNavItem("gallery");
    const previous = getNavItem("portfolio");
    const next = getNavItem("about");
    return { current, previous, next };
  }

  const cycle = navigation.filter((item) => item.id !== "gallery");
  const index = cycle.findIndex((item) => item.id === id);
  const count = cycle.length;
  const current = cycle[index];
  const previous = cycle[(index - 1 + count) % count];
  const next = cycle[(index + 1) % count];

  if (!current || !previous || !next) {
    throw new Error(`Unknown navigation item: ${id}`);
  }

  return { current, previous, next };
}
