"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/studio", label: "Dashboard", icon: LayoutDashboard },
  { href: "/studio/projects", label: "Projects", icon: FolderKanban },
  { href: "/studio/about", label: "About", icon: User },
  { href: "/studio/services", label: "Services", icon: Sparkles },
  { href: "/studio/clients", label: "Clients", icon: Users },
  { href: "/studio/contact", label: "Contact", icon: Mail },
  { href: "/studio/home", label: "Home", icon: House },
  { href: "/studio/settings", label: "Site Settings", icon: Settings },
];

export function StudioNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Studio" className="flex gap-1 overflow-x-auto px-3 pb-4 lg:flex-1 lg:flex-col lg:overflow-visible">
      {links.map((link) => {
        const active = link.href === "/studio" ? pathname === "/studio" : pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              active ? "bg-white/15 font-semibold text-white shadow-[inset_3px_0_0_#f7f1ea]" : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
